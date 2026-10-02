"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Brain, ChevronRight, Clock, Eye, FileDiff, FileMinus, FilePlus2, FolderGit2, MessagesSquare, RefreshCw, ShieldAlert, WifiOff, Wrench } from "lucide-react";
import { RichText } from "./RichText";
import { Button, ButtonLink, Card, Changes, EmptyState, ErrorState, LoadingState, Notice, OnlineDot, Pill, Spinner, StatusBadge, cx } from "@/components/ui";
import { useResource, type ApiError, type Resource } from "@/lib/api";
import { useLiveDevices, useNow } from "@/lib/live";
import { useLiveState, useRealtime } from "@/lib/realtime";
import { fullDate, plural, timeAgo } from "@/lib/format";
import type { ChangedFile, Part, Session } from "@/lib/types";

const VIEW_ONLY = "View only — continue this session in BambooKit Desktop, or on your phone after continuing it on your PC.";

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

function ChangesPanel({ changes }: { changes: Resource<ChangedFile[]> }) {
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
              <li key={f.file} className="flex items-center gap-2 px-4 py-2" title={f.file}>
                {fileIcon(f.status)}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-xs text-bk-fg">{name}</span>
                  {dir && <span className="block truncate font-mono text-[11px] text-bk-faint">{dir}</span>}
                </span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums">
                  <span className="text-bk-ok">+{f.additions}</span> <span className="text-bk-err">−{f.deletions}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {changes.data && files.length > 0 && (
        <p className="border-t border-bk-line px-4 py-2 text-[11px] text-bk-faint">Open diffs in BambooKit Desktop or on your phone.</p>
      )}
    </Card>
  );
}

export function SessionView() {
  const id = useSearchParams().get("id");
  const now = useNow();
  const live = useLiveState();
  const enc = id ? encodeURIComponent(id) : null;
  const session = useResource<Session>(enc ? `/v1/sessions/${enc}` : null);
  const parts = useResource<Part[]>(enc ? `/v1/sessions/${enc}/parts` : null);
  const changes = useResource<ChangedFile[]>(enc ? `/v1/sessions/${enc}/changes` : null);
  const devices = useLiveDevices();
  const [removed, setRemoved] = useState(false);

  const pc = devices.data?.find((d) => d.id === session.data?.deviceId);
  const pcOnline = pc?.online ?? false;

  // When the PC comes back online, retry whatever failed because it was offline.
  const prevOnline = useRef(pcOnline);
  useEffect(() => {
    if (pcOnline && !prevOnline.current) {
      if (parts.error) parts.reload();
      if (changes.error) changes.reload();
    }
    prevOnline.current = pcOnline;
  }, [pcOnline, parts, changes]);

  useRealtime((e) => {
    if (!id) return;
    const sid = e.sessionId ?? e.payload?.sessionId;
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

  return (
    <div className="min-w-0">
      <Link href="/sessions/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-bk-muted hover:text-bk-fg">
        <ArrowLeft className="size-4" /> Sessions
      </Link>

      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="min-w-0 break-words text-xl font-semibold tracking-tight sm:text-2xl">{s.title || "Untitled session"}</h1>
          <StatusBadge status={s.status} />
          <span className={cx("inline-flex items-center gap-1.5 text-xs", isLive ? "text-bk-ok" : "text-bk-faint")} title={isLive ? "Receiving live updates from your PC" : "Not live"}>
            <OnlineDot online={isLive} /> {isLive ? "Live" : "Not live"}
          </span>
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
          {s.agent && <span className="text-xs text-bk-faint">agent: {s.agent}</span>}
          <span className="inline-flex items-center gap-1.5 text-xs text-bk-faint" title={fullDate(s.updatedAt)}>
            <Clock className="size-3.5" /> updated {timeAgo(s.updatedAt, now)}
          </span>
          {s.pendingApprovals > 0 && (
            <Link href="/approvals/">
              <Pill tone="warn">
                <ShieldAlert className="size-3" /> {plural(s.pendingApprovals, "approval")} waiting
              </Pill>
            </Link>
          )}
        </div>
        {s.directory && <div className="mt-1.5 truncate font-mono text-xs text-bk-faint" title={s.directory}>{s.directory}</div>}
      </div>

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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ChatPanel parts={parts} busy={s.status === "busy"} />
        <ChangesPanel changes={changes} />
      </div>
    </div>
  );
}
