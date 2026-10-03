"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Brain, ChevronRight, Check, CircleCheck, Clock, Eye, FileDiff, FileMinus, FilePlus2, FolderGit2, Laptop, MessagesSquare, Pencil, RefreshCw, ShieldAlert, TriangleAlert, WifiOff, Wrench, X } from "lucide-react";
import { RichText } from "./RichText";
import { ApprovalItem } from "./ApprovalsView";
import { LikeButton } from "./LikeButton";
import { ChangesTab, FilesTab, HistoryGate, PromptsTab, SourceBadge, SummaryTab, TimelineTab, agentLabel, touchedFiles } from "./SessionHistory";
import { Button, ButtonLink, Card, Changes, EmptyState, ErrorState, LoadingState, Notice, OnlineDot, Pill, Spinner, StatusBadge, cx } from "@/components/ui";
import { ApiError, apiRequestFull, useResource, type Resource } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLiveDevices, useNow } from "@/lib/live";
import { useLiveState, useRealtime } from "@/lib/realtime";
import { fullDate, plural, timeAgo } from "@/lib/format";
import type { Approval, ChangedFile, Part, Session, SessionHistoryResponse } from "@/lib/types";

const VIEW_ONLY = "View only. Chat in BambooKit on your PC, or in the Android app.";

function sortParts(parts: Part[]): Part[] {
  return parts.slice().sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0));
}

/** Friendly state for errors from endpoints that read live from the PC. */
function PcError({ error, onRetry, compact, what }: { error: ApiError; onRetry: () => void; compact?: boolean; what: string }) {
  const offline = error.code === "DESKTOP_OFFLINE";
  const timeout = error.code === "DESKTOP_TIMEOUT";
  const title = offline ? "Your PC is offline" : timeout ? "Your PC didn't answer in time" : `Couldn't load the ${what}`;
  const message = offline
    ? `${error.message} It loads automatically when the PC comes back online.`
    : error.message;
  if (compact) {
    return (
      <div className="px-4 py-6 text-center text-sm">
        <div className="mb-1 inline-flex items-center gap-1.5 font-medium text-bk-fg">
          {offline && <WifiOff className="size-4 text-bk-warn" />} {title}
        </div>
        <p className="text-xs text-bk-muted">{offline ? "Changed files are read live from your PC." : error.message}</p>
        <Button className="mt-3 px-3 py-1.5 text-xs" onClick={onRetry}>
          <RefreshCw className="size-3.5" /> Retry
        </Button>
      </div>
    );
  }
  return <ErrorState icon={offline ? <WifiOff className="size-6" /> : undefined} title={title} message={message} onRetry={onRetry} />;
}

function ToolRow({ part }: { part: Part }) {
  const status = part.toolStatus ?? "pending";
  const tone = status === "completed" ? "text-bk-ok" : status === "error" ? "text-bk-err" : "text-bk-warn";
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-bk-line bg-bk-bg/60 px-3 py-1.5 text-xs">
      {status === "running" || status === "pending" ? <Spinner className="size-3.5 text-bk-warn" /> : <Wrench className="size-3.5 shrink-0 text-bk-faint" />}
      <span className="shrink-0 font-mono text-bk-fg">{part.tool ?? "tool"}</span>
      {part.toolTitle && <span className="min-w-0 flex-1 truncate font-mono text-bk-muted" title={part.toolTitle}>{part.toolTitle}</span>}
      <span className={cx("ml-auto shrink-0", tone)}>{status}</span>
    </div>
  );
}

function Reasoning({ text }: { text: string }) {
  return (
    <details className="group rounded-lg border border-bk-line bg-bk-bg/40 text-xs">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-1.5 text-bk-faint hover:text-bk-muted">
        <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" />
        <Brain className="size-3.5" /> Thinking
      </summary>
      <div className="border-t border-bk-line px-3 py-2 text-bk-muted">
        <RichText text={text} />
      </div>
    </details>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  parts: Part[];
}

function groupMessages(parts: Part[]): Message[] {
  const out: Message[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (last && last.id === p.messageId) last.parts.push(p);
    else out.push({ id: p.messageId, role: p.role, parts: [p] });
  }
  return out;
}

function Transcript({ parts }: { parts: Part[] }) {
  const messages = useMemo(() => groupMessages(parts), [parts]);
  return (
    <div className="space-y-5">
      {messages.map((m) => {
        const visible = m.parts.filter((p) => p.type === "tool" || (p.text ?? "").trim());
        if (!visible.length) return null;
        if (m.role === "user") {
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[92%] rounded-2xl rounded-br-md border border-bk-line bg-bk-raised px-4 py-2.5 text-bk-fg sm:max-w-[80%]">
                {visible.map((p) => (p.type === "tool" ? <ToolRow key={p.id} part={p} /> : <RichText key={p.id} text={p.text ?? ""} />))}
              </div>
            </div>
          );
        }
        return (
          <div key={m.id} className="flex gap-3">
            <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-bk-line bg-bk-panel text-[10px] font-semibold text-bk-muted">AI</div>
            <div className="min-w-0 flex-1 space-y-2 text-bk-fg">
              {visible.map((p) =>
                p.type === "tool" ? <ToolRow key={p.id} part={p} /> : p.type === "reasoning" ? <Reasoning key={p.id} text={p.text ?? ""} /> : <RichText key={p.id} text={p.text ?? ""} />,
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChatPanel({ parts, busy }: { parts: Resource<Part[]>; busy: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const count = parts.data?.length ?? 0;
  const lastText = parts.data?.[count - 1]?.text?.length ?? 0;

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [count, lastText]);

  let body: React.ReactNode;
  if (parts.error && !parts.data) body = <PcError error={parts.error} onRetry={parts.reload} what="chat" />;
  else if (!parts.data) body = <LoadingState slow={parts.slow} label="Loading the chat from your PC…" />;
  else if (parts.data.length === 0) {
    body = (
      <EmptyState icon={<MessagesSquare className="size-7" />} title="No messages yet">
        Messages appear here live as you chat in BambooKit Desktop.
      </EmptyState>
    );
  } else body = <Transcript parts={parts.data} />;

  return (
    <Card className="flex min-w-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-bk-line px-4 py-2.5 text-sm">
        <span className="font-medium">Chat</span>
        <span className="flex items-center gap-2 text-xs text-bk-faint">
          {parts.loading && parts.data && <Spinner className="size-3.5" />}
          {parts.data && plural(groupMessages(parts.data).length, "message")}
        </span>
      </div>
      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="max-h-[70vh] min-h-64 overflow-y-auto px-4 py-5 lg:h-[calc(100vh-19rem)] lg:max-h-none"
      >
        {body}
        {busy && parts.data && parts.data.length > 0 && (
          <div className="mt-4 flex items-center gap-2 pl-10 text-xs text-bk-muted">
            <Spinner className="size-3.5" /> Agent is working…
          </div>
        )}
        {parts.error && parts.data && (
          <Notice tone="warn" className="mt-4" icon={<WifiOff className="size-4" />}>
            Showing the last loaded chat. {parts.error.message}{" "}
            <button type="button" className="underline underline-offset-2" onClick={parts.reload}>
              Retry
            </button>
          </Notice>
        )}
      </div>
      <div className="flex items-start gap-2 border-t border-bk-line bg-bk-bg/40 px-4 py-3 text-xs text-bk-muted">
        <Eye className="mt-0.5 size-3.5 shrink-0 text-bk-faint" />
        <span>{VIEW_ONLY}</span>
      </div>
    </Card>
  );
}

function fileIcon(status: string | null | undefined) {
  if (status === "added") return <FilePlus2 className="size-3.5 shrink-0 text-bk-ok" />;
  if (status === "deleted") return <FileMinus className="size-3.5 shrink-0 text-bk-err" />;
  return <FileDiff className="size-3.5 shrink-0 text-bk-faint" />;
}

function ChangesPanel({ changes, onOpen }: { changes: Resource<ChangedFile[]>; onOpen: (file?: string) => void }) {
  const files = changes.data ?? [];
  const totals = files.reduce((t, f) => ({ a: t.a + (f.additions || 0), d: t.d + (f.deletions || 0) }), { a: 0, d: 0 });
  return (
    <Card className="min-w-0 overflow-hidden lg:sticky lg:top-20">
      <div className="flex items-center justify-between border-b border-bk-line px-4 py-2.5 text-sm">
        <span className="font-medium">Changed files</span>
        {changes.data && <Changes additions={totals.a} deletions={totals.d} />}
      </div>
      {changes.error && !changes.data ? (
        <PcError compact error={changes.error} onRetry={changes.reload} what="changed files" />
      ) : !changes.data ? (
        <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-bk-muted">
          <Spinner className="size-3.5" /> Loading from your PC…
        </div>
      ) : files.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-bk-faint">No files changed in this session.</p>
      ) : (
        <ul className="max-h-[60vh] divide-y divide-bk-line overflow-y-auto">
          {files.map((f) => {
            const slash = f.file.replace(/\\/g, "/").lastIndexOf("/");
            const name = f.file.slice(slash + 1);
            const dir = slash > 0 ? f.file.slice(0, slash) : "";
            return (
              <li key={f.file}>
                <button type="button" onClick={() => onOpen(f.file)} className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-bk-raised" title={f.file}>
                {fileIcon(f.status)}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-xs text-bk-fg">{name}</span>
                  {dir && <span className="block truncate font-mono text-[11px] text-bk-faint">{dir}</span>}
                </span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums">
                  <span className="text-bk-ok">+{f.additions}</span> <span className="text-bk-err">−{f.deletions}</span>
                </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {changes.data && files.length > 0 && (
        <button type="button" onClick={() => onOpen()} className="w-full border-t border-bk-line px-4 py-2 text-left text-[11px] text-bk-faint hover:text-bk-fg">
          See every diff in the Changes tab
        </button>
      )}
    </Card>
  );
}

const TABS = ["summary", "prompts", "timeline", "changes", "files", "chat"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = { summary: "Summary", prompts: "Prompts", timeline: "Timeline", changes: "Changes", files: "Files", chat: "Chat" };

/** Session events that change the history; streaming text is excluded (the final status update covers it). */
function affectsHistory(type: string, payload: any): boolean {
  if (type === "session.part") return payload?.type === "tool" || payload?.role === "user";
  return type === "session.updated" || type === "session.diff" || type === "session.transcript" || type.startsWith("approval.");
}

/** Asks the PC to open this session in BambooKit (CONTINUE_ON_PC). The website never sends chat messages. */
function ContinueOnPc({ sessionId, pcOnline, pcName }: { sessionId: string; pcOnline: boolean; pcName: string }) {
  const { getToken } = useAuth();
  const [state, setState] = useState<"idle" | "busy" | "sent" | "queued">("idle");
  const [error, setError] = useState<string | null>(null);
  const send = async () => {
    setState("busy");
    setError(null);
    try {
      const res = await apiRequestFull<{ deviceOnline?: boolean } | null>("POST", `/v1/sessions/${encodeURIComponent(sessionId)}/commands`, await getToken(), {
        body: { type: "CONTINUE_ON_PC", payload: {} },
      });
      setState(res?.deviceOnline === false ? "queued" : "sent");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error)?.message || "Couldn't reach your PC. Try again.");
      setState("idle");
    }
  };
  return (
    <Card className="mb-5 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Laptop className="size-5 shrink-0 text-bk-faint" />
        <p className="min-w-0 flex-1 text-sm text-bk-muted">
          This page is view only. Chatting happens in BambooKit on your PC or in the Android app.
          {!pcOnline && <span className="block text-xs text-bk-faint">{pcName} is offline. Open BambooKit on it to continue this session.</span>}
        </p>
        <Button
          disabled={!pcOnline || state === "busy"}
          onClick={() => void send()}
          title={pcOnline ? `Open this session in BambooKit on ${pcName}` : `${pcName} is offline`}
          className="px-3 py-1.5 text-xs"
        >
          {state === "busy" ? <Spinner className="size-3.5" /> : <Laptop className="size-3.5" />} Continue on PC
        </Button>
      </div>
      {(state === "sent" || state === "queued") && (
        <Notice tone="ok" className="mt-3" icon={<CircleCheck className="size-4" />}>
          {state === "sent" ? `Asked ${pcName} to open this session in BambooKit.` : `${pcName} will open this session when BambooKit on it reconnects.`}
        </Notice>
      )}
      {error && (
        <Notice tone="err" className="mt-3" icon={<TriangleAlert className="size-4" />}>
          {error}
        </Notice>
      )}
    </Card>
  );
}

const TITLE_MAX = 200;
/** How long to wait for the PC to confirm a rename before saying so. */
const RENAME_TIMEOUT_MS = 30_000;

/**
 * The session title with a Rename action. The PC renames the session (RENAME_SESSION); the new
 * title arrives as session.updated, so "Renaming on your PC…" stays until the title changes.
 */
function SessionTitle({ session, pcOnline, pcName }: { session: Session; pcOnline: boolean; pcName: string }) {
  const { getToken } = useAuth();
  const title = session.title || "";
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<{ title: string; queued: boolean } | null>(null);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The rename is done when the session's title becomes the requested one.
  useEffect(() => {
    if (pending && title === pending.title) {
      setPending(null);
      setSlow(false);
    }
  }, [title, pending]);
  useEffect(() => {
    if (!pending || pending.queued) return;
    const t = setTimeout(() => setSlow(true), RENAME_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [pending]);

  const trimmed = value.trim();
  const invalid = !trimmed ? "Enter a title." : trimmed.length > TITLE_MAX ? `Titles can be up to ${TITLE_MAX} characters (this one has ${trimmed.length}).` : null;
  const unchanged = trimmed === title;

  const submit = async () => {
    setTried(true);
    if (invalid || unchanged || sending) {
      if (unchanged && !invalid) setEditing(false);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await apiRequestFull<{ deviceOnline?: boolean } | null>("POST", `/v1/sessions/${encodeURIComponent(session.id)}/commands`, await getToken(), {
        body: { type: "RENAME_SESSION", payload: { title: trimmed } },
      });
      setPending({ title: trimmed, queued: res?.deviceOnline === false });
      setSlow(false);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error)?.message || "Couldn't rename the session. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (editing) {
    return (
      <form
        className="w-full space-y-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" && !sending) setEditing(false);
            }}
            autoFocus
            aria-label="Session title"
            aria-invalid={tried && !!invalid}
            className={cx(
              "min-w-0 flex-1 rounded-lg border bg-bk-bg px-3 py-1.5 text-lg font-semibold text-bk-fg placeholder:text-bk-faint focus:outline-none sm:max-w-xl",
              (tried || trimmed.length > TITLE_MAX) && invalid ? "border-bk-err/60" : "border-bk-line focus:border-bk-muted",
            )}
          />
          <Button type="submit" variant="primary" className="px-3 py-1.5 text-xs" disabled={sending || !!invalid || unchanged || !pcOnline}>
            {sending ? <Spinner className="size-3.5" /> : <Check className="size-3.5" />} Rename
          </Button>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" disabled={sending} onClick={() => setEditing(false)}>
            <X className="size-3.5" /> Cancel
          </Button>
        </div>
        <p className={cx("text-xs", (tried || trimmed.length > TITLE_MAX) && invalid ? "text-bk-err" : "text-bk-faint")}>
          {(tried || trimmed.length > TITLE_MAX) && invalid
            ? invalid
            : !pcOnline
              ? `${pcName} went offline. Renaming happens on your PC, so try again when it is online.`
              : `${trimmed.length}/${TITLE_MAX} characters. ${pcName} renames the session in BambooKit.`}
        </p>
        {error && (
          <Notice tone="err" icon={<TriangleAlert className="size-4" />}>
            {error}
          </Notice>
        )}
      </form>
    );
  }

  return (
    <>
      <h1 className="min-w-0 break-words text-xl font-semibold tracking-tight sm:text-2xl">{title || "Untitled session"}</h1>
      <Button
        variant="ghost"
        className="px-2 py-1 text-xs"
        disabled={!pcOnline || !!pending}
        title={pcOnline ? "Rename this session" : `${pcName} is offline. Renaming happens on your PC.`}
        onClick={() => {
          setValue(title);
          setTried(false);
          setError(null);
          setEditing(true);
        }}
      >
        <Pencil className="size-3.5" /> Rename
      </Button>
      {!pcOnline && !pending && <span className="text-xs text-bk-faint">Renaming needs {pcName} online</span>}
      {pending && (
        <span className="inline-flex items-center gap-1.5 text-xs text-bk-muted">
          {!slow && !pending.queued && <Spinner className="size-3.5" />}
          {pending.queued
            ? `Renaming when ${pcName} reconnects…`
            : slow
              ? `${pcName} hasn't confirmed the new title yet.`
              : "Renaming on your PC…"}
          {(slow || pending.queued) && (
            <button type="button" className="underline underline-offset-2 hover:text-bk-fg" onClick={() => setPending(null)}>
              Hide
            </button>
          )}
        </span>
      )}
    </>
  );
}

/** Requests from this session that are waiting for an answer; answerable from here. */
function WaitingRequests({ approvals, now }: { approvals: Resource<Approval[]>; now: number }) {
  const list = approvals.data ?? [];
  if (list.length === 0) return null;
  return (
    <Card className="mb-5 overflow-hidden border-bk-warn/40">
      <div className="flex items-center gap-2 border-b border-bk-line px-4 py-2.5 text-sm font-medium text-bk-warn">
        <ShieldAlert className="size-4" /> Waiting for you
      </div>
      <ul className="divide-y divide-bk-line">
        {list.map((a) => (
          <li key={a.id} className="px-4 py-3.5">
            <ApprovalItem approval={a} now={now} showSession={false} onChanged={approvals.reload} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function SessionView() {
  const params = useSearchParams();
  const id = params.get("id");
  const now = useNow();
  const live = useLiveState();
  const enc = id ? encodeURIComponent(id) : null;
  const session = useResource<Session>(enc ? `/v1/sessions/${enc}` : null);
  const parts = useResource<Part[]>(enc ? `/v1/sessions/${enc}/parts` : null);
  const changes = useResource<ChangedFile[]>(enc ? `/v1/sessions/${enc}/changes` : null);
  const history = useResource<SessionHistoryResponse>(enc ? `/v1/sessions/${enc}/history` : null);
  const devices = useLiveDevices();
  const waiting = useResource<Approval[]>(enc ? `/v1/approvals?status=PENDING&sessionId=${enc}` : null);
  const [removed, setRemoved] = useState(false);
  const initialTab = params.get("tab") as Tab | null;
  const [tab, setTabState] = useState<Tab>(initialTab && TABS.includes(initialTab) ? initialTab : "summary");
  const [changeFile, setChangeFile] = useState<string | null>(null);
  const [touchedFile, setTouchedFile] = useState<string | null>(null);

  const setTab = useCallback(
    (next: Tab) => {
      setTabState(next);
      if (!id) return;
      const qs = new URLSearchParams({ id });
      if (next !== "summary") qs.set("tab", next);
      window.history.replaceState(null, "", `?${qs}`);
    },
    [id],
  );
  const openChange = useCallback(
    (file?: string) => {
      if (file) setChangeFile(file);
      setTab("changes");
    },
    [setTab],
  );

  const pc = devices.data?.find((d) => d.id === session.data?.deviceId);
  const pcOnline = pc?.online ?? false;
  const pcKnown = !!devices.data && !!session.data;

  // Refresh the history at most every few seconds while the session is active.
  const historyReload = history.reload;
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleHistory = useCallback(() => {
    if (historyTimer.current) return;
    historyTimer.current = setTimeout(() => {
      historyTimer.current = null;
      historyReload();
    }, 2500);
  }, [historyReload]);
  useEffect(
    () => () => {
      if (historyTimer.current) clearTimeout(historyTimer.current);
    },
    [],
  );

  // When the PC goes offline or comes back, retry what failed and switch the history between the
  // live PC copy and the saved cloud copy.
  const prevOnline = useRef<boolean | null>(null);
  useEffect(() => {
    if (!pcKnown) return;
    if (prevOnline.current !== null && prevOnline.current !== pcOnline) {
      if (pcOnline) {
        if (parts.error) parts.reload();
        if (changes.error) changes.reload();
      }
      historyReload();
    }
    prevOnline.current = pcOnline;
  }, [pcKnown, pcOnline, parts, changes, historyReload]);

  useRealtime((e) => {
    if (!id) return;
    const sid = e.sessionId ?? e.payload?.sessionId;
    const mine = sid === id || e.payload?.id === id;
    if (mine && affectsHistory(e.type, e.payload)) scheduleHistory();
    if (e.type.startsWith("approval.") || e.type === "notification" || (e.type === "ready" && e.payload?.reconnect)) waiting.reload();
    switch (e.type) {
      case "session.updated":
        if (e.payload?.id === id) session.setData((s) => ({ ...s, ...(e.payload as Session) }));
        break;
      case "session.removed":
        if ((e.payload?.id ?? e.sessionId) === id) setRemoved(true);
        break;
      case "session.part":
        if (sid === id && e.payload?.id) {
          const part = e.payload as Part;
          parts.setData((list) => {
            if (!list) return list;
            const i = list.findIndex((p) => p.id === part.id);
            if (i === -1) return sortParts([...list, part]);
            const next = list.slice();
            next[i] = part;
            return next[i].sortKey === list[i].sortKey ? next : sortParts(next);
          });
        }
        break;
      case "session.transcript":
        if (sid === id) parts.reload();
        break;
      case "session.diff":
        if (sid === id && Array.isArray(e.payload?.files)) changes.setData(e.payload.files as ChangedFile[]);
        break;
      case "ready":
        if (e.payload?.reconnect) {
          session.reload();
          parts.reload();
          changes.reload();
          historyReload();
        }
        break;
    }
  });

  if (!id) {
    return (
      <EmptyState title="No session selected" action={<ButtonLink href="/sessions/">All sessions</ButtonLink>}>
        Pick a session from your list.
      </EmptyState>
    );
  }
  if (session.error && !session.data) {
    if (session.error.status === 404) {
      return (
        <EmptyState title="Session not found" action={<ButtonLink href="/sessions/">All sessions</ButtonLink>}>
          It may have been deleted on your PC.
        </EmptyState>
      );
    }
    return <ErrorState message={session.error.message} onRetry={session.reload} />;
  }
  if (!session.data) return <LoadingState slow={session.slow} label="Loading session…" />;

  const s = session.data;
  const isLive = live === "live" && pcOnline;
  const h = history.data?.history;
  const counts: Partial<Record<Tab, number>> = h
    ? {
        prompts: (h.prompts ?? []).filter((p) => (p.text ?? "").trim()).length,
        timeline: (h.timeline?.length ?? 0) + (history.data?.approvals?.length ?? 0),
        changes: h.changes?.length ?? 0,
        files: touchedFiles(h).length,
      }
    : {};

  return (
    <div className="min-w-0">
      <Link href="/sessions/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-bk-muted hover:text-bk-fg">
        <ArrowLeft className="size-4" /> Sessions
      </Link>

      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <LikeButton session={s} onChange={(starred, server) => session.setData((cur) => (cur ? { ...cur, ...(server ?? {}), starred } : cur))} className="-ml-1.5" />
          <SessionTitle session={s} pcOnline={pcOnline} pcName={pc?.name ?? "Your PC"} />
          <StatusBadge status={s.status} />
          <span className={cx("inline-flex items-center gap-1.5 text-xs", isLive ? "text-bk-ok" : "text-bk-faint")} title={isLive ? "Receiving live updates from your PC" : "Not live"}>
            <OnlineDot online={isLive} /> {isLive ? "Live" : "Not live"}
          </span>
          <SourceBadge data={history.data} now={now} />
          {history.loading && history.data && <Spinner className="size-3.5 text-bk-faint" />}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-bk-muted">
          <span className="inline-flex items-center gap-1.5">
            <OnlineDot online={pcOnline} /> {pc?.name ?? "PC"}
            <span className="text-xs text-bk-faint">{pcOnline ? "online" : pc ? `offline · seen ${timeAgo(pc.lastSeenAt, now)}` : ""}</span>
          </span>
          {s.projectName && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <FolderGit2 className="size-4 text-bk-faint" /> {s.projectName}
            </span>
          )}
          {s.model && <span className="truncate font-mono text-xs">{s.model}</span>}
          {s.agent && <span className="text-xs text-bk-faint">{agentLabel(s.agent)}</span>}
          <span className="inline-flex items-center gap-1.5 text-xs text-bk-faint" title={fullDate(s.updatedAt)}>
            <Clock className="size-3.5" /> updated {timeAgo(s.updatedAt, now)}
          </span>
          {s.pendingApprovals > 0 && (
            <button type="button" onClick={() => document.getElementById("waiting-requests")?.scrollIntoView({ behavior: "smooth" })}>
              <Pill tone="warn">
                <ShieldAlert className="size-3" /> {plural(s.pendingApprovals, "request")} waiting
              </Pill>
            </button>
          )}
        </div>
        {s.directory && <div className="mt-1.5 truncate font-mono text-xs text-bk-faint" title={s.directory}>{s.directory}</div>}
      </div>

      <div id="waiting-requests">
        <WaitingRequests approvals={waiting} now={now} />
      </div>
      {!removed && <ContinueOnPc sessionId={s.id} pcOnline={pcOnline} pcName={pc?.name ?? "Your PC"} />}

      {removed && (
        <Notice tone="warn" className="mb-4">
          This session was deleted on your PC.
        </Notice>
      )}
      {(s.status === "error" || s.status === "retry") && s.statusMessage && (
        <Notice tone={s.status === "error" ? "err" : "warn"} className="mb-4">
          {s.statusMessage}
        </Notice>
      )}

      <div role="tablist" aria-label="Session views" className="mb-5 flex gap-1 overflow-x-auto border-b border-bk-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx(
              "-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm",
              tab === t ? "border-bk-accent text-bk-fg" : "border-transparent text-bk-muted hover:text-bk-fg",
            )}
          >
            {TAB_LABEL[t]}
            {(counts[t] ?? 0) > 0 && <span className="rounded-full bg-bk-raised px-1.5 text-[11px] tabular-nums text-bk-muted">{counts[t]}</span>}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={TAB_LABEL[tab]}>
        {tab === "chat" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <ChatPanel parts={parts} busy={s.status === "busy"} />
            <ChangesPanel changes={changes} onOpen={openChange} />
          </div>
        ) : (
          <HistoryGate history={history}>
            {(data) =>
              tab === "summary" ? (
                <SummaryTab data={data} session={s} now={now} onOpenChange={openChange} />
              ) : tab === "prompts" ? (
                <PromptsTab data={data} now={now} />
              ) : tab === "timeline" ? (
                <TimelineTab
                  data={data}
                  now={now}
                  onOpenFile={(file) => {
                    if (data.history?.changes?.some((c) => c.file === file)) openChange(file);
                    else {
                      setTouchedFile(file);
                      setTab("files");
                    }
                  }}
                />
              ) : tab === "changes" ? (
                <ChangesTab data={data} sessionId={enc!} pcOnline={pcOnline} now={now} selected={changeFile} onSelect={setChangeFile} />
              ) : (
                <FilesTab data={data} sessionId={enc!} pcOnline={pcOnline} onOpenChange={openChange} selected={touchedFile} onSelect={setTouchedFile} />
              )
            }
          </HistoryGate>
        )}
      </div>
    </div>
  );
}
