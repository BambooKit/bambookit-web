"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bot,
  CircleAlert,
  CircleCheck,
  Cloud,
  FileDiff,
  FilePen,
  FilePlus2,
  FileText,
  Files,
  FlaskConical,
  Globe,
  ListChecks,
  MessageSquare,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  Terminal,
  Users,
  WifiOff,
  Wrench,
} from "lucide-react";
import { CodeView, DiffTable } from "./CodeViews";
import { RichText } from "./RichText";
import { approvalTone } from "./ApprovalsView";
import { Button, Card, Changes, EmptyState, ErrorState, LoadingState, Notice, Pill, Spinner, StatusBadge, cx } from "@/components/ui";
import { useResource, type ApiError, type Resource } from "@/lib/api";
import { clockTime, dateTime, formatDuration, plural, timeAgo, toMs } from "@/lib/format";
import type { Approval, FileVersions, HistoryChange, Session, SessionHistory, SessionHistoryResponse, TimelineItem } from "@/lib/types";

/* ---------------------------------------------------------------- helpers */

export function agentLabel(agent: string | null | undefined): string | null {
  return agent ? `BambooKit · ${agent}` : null;
}

function splitPath(file: string): { name: string; dir: string } {
  const norm = file.replace(/\\/g, "/");
  const slash = norm.lastIndexOf("/");
  return { name: norm.slice(slash + 1), dir: slash > 0 ? norm.slice(0, slash) : "" };
}

const CHANGE_BADGE: Record<string, { letter: string; label: string; cls: string }> = {
  added: { letter: "A", label: "Added", cls: "border-bk-ok/40 bg-bk-ok/10 text-bk-ok" },
  modified: { letter: "M", label: "Modified", cls: "border-bk-warn/40 bg-bk-warn/10 text-bk-warn" },
  deleted: { letter: "D", label: "Deleted", cls: "border-bk-err/40 bg-bk-err/10 text-bk-err" },
  renamed: { letter: "R", label: "Renamed", cls: "border-bk-info/40 bg-bk-info/10 text-bk-info" },
};

export function ChangeBadge({ status }: { status: string | null | undefined }) {
  const b = CHANGE_BADGE[status ?? "modified"] ?? CHANGE_BADGE.modified;
  return (
    <span title={b.label} aria-label={b.label} className={cx("grid size-5 shrink-0 place-items-center rounded border font-mono text-[10px] font-semibold", b.cls)}>
      {b.letter}
    </span>
  );
}

function PlusMinus({ additions, deletions }: { additions?: number; deletions?: number }) {
  if (additions === undefined && deletions === undefined) return null;
  return (
    <span className="shrink-0 font-mono text-[11px] tabular-nums">
      <span className="text-bk-ok">+{additions ?? 0}</span> <span className="text-bk-err">−{deletions ?? 0}</span>
    </span>
  );
}

function statusTone(status: string | null | undefined): "ok" | "err" | "warn" | "neutral" {
  const s = (status ?? "").toLowerCase();
  if (["completed", "passed", "success", "ok", "done"].includes(s)) return "ok";
  if (["error", "failed", "failure"].includes(s)) return "err";
  if (["running", "pending", "busy"].includes(s)) return "warn";
  return "neutral";
}

/* ---------------------------------------------------------------- source + loading gate */

export function SourceBadge({ data, now }: { data: SessionHistoryResponse | undefined; now: number }) {
  if (!data) return null;
  if (data.source === "pc") {
    return (
      <Pill tone="ok" className="gap-1.5">
        <Radio className="size-3" /> Live from PC
      </Pill>
    );
  }
  return (
    <span title={data.savedAt ? `Saved ${dateTime(data.savedAt)}` : undefined}>
      <Pill className="gap-1.5">
        <Cloud className="size-3" /> Saved copy{data.savedAt ? ` · ${timeAgo(data.savedAt, now)}` : ""} · kept 7 days
      </Pill>
    </span>
  );
}

function HistoryError({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const offline = error.code === "DESKTOP_OFFLINE";
  const timeout = error.code === "DESKTOP_TIMEOUT";
  return (
    <ErrorState
      icon={offline ? <WifiOff className="size-6" /> : undefined}
      title={offline ? "Your PC is offline" : timeout ? "Your PC didn't answer in time" : "Couldn't load the session history"}
      message={offline ? `${error.message} It loads automatically when the PC comes back online.` : error.message}
      onRetry={onRetry}
    />
  );
}

/** Renders history-based content once loaded; handles loading, errors and stale data. */
export function HistoryGate({ history, children }: { history: Resource<SessionHistoryResponse>; children: (data: SessionHistoryResponse) => ReactNode }) {
  if (history.error && !history.data) return <HistoryError error={history.error} onRetry={history.reload} />;
  if (!history.data) return <LoadingState slow={history.slow} label="Loading the session history…" />;
  return (
    <>
      {history.error && (
        <Notice tone="warn" className="mb-4" icon={<WifiOff className="size-4" />}>
          Showing the last loaded history. {history.error.message}{" "}
          <button type="button" className="underline underline-offset-2" onClick={history.reload}>
            Retry
          </button>
        </Notice>
      )}
      {children(history.data)}
    </>
  );
}

/* ---------------------------------------------------------------- summary */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-bk-faint">{label}</dt>
      <dd className="mt-0.5 min-w-0 break-words text-sm text-bk-fg">{children}</dd>
    </div>
  );
}

function testCounts(h: SessionHistory): { passed: number; failed: number; total: number } | null {
  const tests = h.tests;
  if (tests) {
    return {
      passed: tests.filter((t) => t.status === "passed").length,
      failed: tests.filter((t) => t.status === "failed").length,
      total: tests.length,
    };
  }
  const s = h.summary;
  if (s && (s.testsPassed !== undefined || s.testsFailed !== undefined)) {
    const passed = s.testsPassed ?? 0;
    const failed = s.testsFailed ?? 0;
    return { passed, failed, total: passed + failed };
  }
  return null;
}

function FirstPrompt({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 400 || text.split("\n").length > 6;
  return (
    <div className="border-b border-bk-line px-4 py-3.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-bk-faint">
        <MessageSquare className="size-3.5" /> Prompt
      </div>
      <div className={cx("relative text-bk-fg", long && !open && "max-h-36 overflow-hidden")}>
        <RichText text={text} />
      </div>
      {long && (
        <button type="button" className="mt-1.5 text-xs text-bk-muted underline underline-offset-2 hover:text-bk-fg" onClick={() => setOpen((o) => !o)}>
          {open ? "Show less" : "Show the full prompt"}
        </button>
      )}
    </div>
  );
}

export function SummaryTab({
  data,
  session,
  now,
  onOpenChange,
}: {
  data: SessionHistoryResponse;
  session: Session;
  now: number;
  onOpenChange: (file: string) => void;
}) {
  const h = data.history ?? {};
  const changes = h.changes ?? [];
  const approvals = data.approvals ?? [];
  const pendingApprovals = approvals.filter((a) => a.status.toUpperCase() === "PENDING").length;
  const prompt = h.prompts?.find((p) => (p.text ?? "").trim())?.text;
  const project = h.projectName ?? session.projectName;
  const agent = agentLabel(h.agent ?? session.agent);
  const model = h.model ?? session.model;
  const duration = formatDuration(h.durationMs ?? h.summary?.durationMs);
  const filesChanged = h.summary?.filesChanged ?? (h.changes ? changes.length : undefined);
  const additions = h.summary?.additions ?? (h.changes ? changes.reduce((n, c) => n + (c.additions ?? 0), 0) : undefined);
  const deletions = h.summary?.deletions ?? (h.changes ? changes.reduce((n, c) => n + (c.deletions ?? 0), 0) : undefined);
  const tests = testCounts(h);
  const started = h.createdAt ?? session.createdAt;
  const promptCount = h.summary?.prompts ?? h.prompts?.length;

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        {prompt && <FirstPrompt text={prompt} />}
        <dl className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
          {project && <Field label="Project">{project}</Field>}
          <Field label="Branch">
            {h.branch ? <span className="font-mono text-[13px]">{h.branch}</span> : <span className="text-bk-faint">Branch unavailable</span>}
            {h.baseCommit && (
              <span className="ml-2 font-mono text-xs text-bk-faint" title={`Base commit ${h.baseCommit}`}>
                @ {h.baseCommit.slice(0, 7)}
              </span>
            )}
          </Field>
          <Field label="Session">
            <span className="block truncate">{h.title || session.title || "Untitled session"}</span>
            {started && <span className="block text-xs text-bk-faint">Started {dateTime(started)}</span>}
          </Field>
          {agent && <Field label="Agent">{agent}</Field>}
          {model && (
            <Field label="Model">
              <span className="font-mono text-[13px]">{model}</span>
            </Field>
          )}
          <Field label="Status">
            <StatusBadge status={session.status} />
          </Field>
          {duration && <Field label="Duration">{duration}</Field>}
          {promptCount !== undefined && <Field label="Prompts">{promptCount}</Field>}
          {filesChanged !== undefined && <Field label="Files changed">{filesChanged}</Field>}
          {(additions !== undefined || deletions !== undefined) && (
            <Field label="Lines">
              <span className="font-mono text-[13px] tabular-nums">
                <span className="text-bk-ok">+{additions ?? 0}</span> <span className="text-bk-err">−{deletions ?? 0}</span>
              </span>
            </Field>
          )}
          {tests && (
            <Field label="Tests">
              {tests.total === 0 ? (
                <span className="text-bk-faint">None run</span>
              ) : (
                <span className="inline-flex flex-wrap gap-1.5">
                  {tests.passed > 0 && <Pill tone="ok">{tests.passed} passed</Pill>}
                  {tests.failed > 0 && <Pill tone="err">{tests.failed} failed</Pill>}
                  {tests.total - tests.passed - tests.failed > 0 && <Pill>{tests.total - tests.passed - tests.failed} other</Pill>}
                </span>
              )}
            </Field>
          )}
          <Field label="Approvals">
            {approvals.length === 0 ? (
              <span className="text-bk-faint">None</span>
            ) : (
              <span>
                {approvals.length}
                {pendingApprovals > 0 && (
                  <Pill tone="warn" className="ml-2">
                    {pendingApprovals} waiting
                  </Pill>
                )}
              </span>
            )}
          </Field>
        </dl>
        {h.directory && (
          <div className="truncate border-t border-bk-line px-4 py-2 font-mono text-xs text-bk-faint" title={h.directory}>
            {h.directory}
          </div>
        )}
      </Card>

      {changes.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-bk-line px-4 py-2.5 text-sm">
            <span className="font-medium">Changed files</span>
            <Changes additions={additions ?? 0} deletions={deletions ?? 0} />
          </div>
          <ul className="divide-y divide-bk-line">
            {changes.slice(0, 8).map((c) => (
              <li key={c.file}>
                <button type="button" onClick={() => onOpenChange(c.file)} className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-bk-raised">
                  <ChangeBadge status={c.status} />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-bk-fg" title={c.file}>
                    {c.file}
                  </span>
                  <PlusMinus additions={c.additions} deletions={c.deletions} />
                </button>
              </li>
            ))}
          </ul>
          {changes.length > 8 && (
            <button type="button" onClick={() => onOpenChange(changes[8].file)} className="w-full border-t border-bk-line px-4 py-2 text-left text-xs text-bk-muted hover:text-bk-fg">
              {plural(changes.length - 8, "more file")} in Changes
            </button>
          )}
        </Card>
      )}

      {h.tests && h.tests.length > 0 && (
        <Card className="overflow-hidden">
          <div className="border-b border-bk-line px-4 py-2.5 text-sm font-medium">Tests</div>
          <ul className="divide-y divide-bk-line">
            {h.tests.map((t, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 px-4 py-2 text-xs">
                <FlaskConical className="size-3.5 shrink-0 text-bk-faint" />
                <code className="min-w-0 flex-1 truncate font-mono text-bk-fg" title={t.command}>
                  {t.command || "Test run"}
                </code>
                {t.exitCode !== undefined && t.exitCode !== null && <span className="font-mono text-bk-faint">exit {t.exitCode}</span>}
                {t.status && <Pill tone={statusTone(t.status)}>{t.status}</Pill>}
                {clockTime(t.time, now) && <span className="text-bk-faint">{clockTime(t.time, now)}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {approvals.length > 0 && (
        <Card className="overflow-hidden">
          <div className="border-b border-bk-line px-4 py-2.5 text-sm font-medium">Approvals</div>
          <ul className="divide-y divide-bk-line">
            {approvals.map((a) => (
              <ApprovalRow key={a.id} approval={a} now={now} />
            ))}
          </ul>
          <p className="border-t border-bk-line px-4 py-2 text-[11px] text-bk-faint">
            Answer approvals in BambooKit Desktop or on your phone. <Link href="/approvals/" className="underline underline-offset-2 hover:text-bk-fg">All approvals</Link>
          </p>
        </Card>
      )}
    </div>
  );
}

function ApprovalRow({ approval: a, now }: { approval: Approval; now: number }) {
  return (
    <li className="px-4 py-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <ShieldAlert className="size-3.5 shrink-0 text-bk-faint" />
        <span className="min-w-0 flex-1 truncate text-sm text-bk-fg">{a.title || a.permission}</span>
        <Pill tone={approvalTone(a.status)}>{a.status.toLowerCase()}</Pill>
        <span className="text-bk-faint" title={dateTime(a.createdAt)}>
          {clockTime(a.createdAt, now)}
        </span>
      </div>
      {a.patterns.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5 pl-5">
          {a.patterns.map((p, i) => (
            <code key={i} className="max-w-full truncate rounded border border-bk-line bg-bk-bg px-1.5 py-0.5 font-mono text-[11px] text-bk-muted">
              {p}
            </code>
          ))}
        </div>
      )}
    </li>
  );
}

/* ---------------------------------------------------------------- prompts */

export function PromptsTab({ data, now }: { data: SessionHistoryResponse; now: number }) {
  const prompts = (data.history?.prompts ?? []).filter((p) => (p.text ?? "").trim());
  if (prompts.length === 0) {
    return (
      <EmptyState icon={<MessageSquare className="size-7" />} title="No prompts recorded">
        Prompts you send in BambooKit Desktop appear here.
      </EmptyState>
    );
  }
  return (
    <ol className="space-y-3">
      {prompts.map((p, i) => (
        <li key={p.messageId ?? i}>
          <Card className="px-4 py-3">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-bk-faint">
              <span className="font-medium text-bk-muted">Prompt {i + 1}</span>
              {clockTime(p.time, now) && <span title={dateTime(p.time)}>{clockTime(p.time, now)}</span>}
            </div>
            <div className="text-bk-fg">
              <RichText text={p.text ?? ""} />
            </div>
          </Card>
        </li>
      ))}
    </ol>
  );
}

/* ---------------------------------------------------------------- timeline */

const KIND_ICON: Record<string, typeof Bot> = {
  prompt: MessageSquare,
  response: Bot,
  read: FileText,
  edit: FilePen,
  write: FilePlus2,
  patch: FileDiff,
  command: Terminal,
  test: FlaskConical,
  search: Search,
  web: Globe,
  agent: Users,
  plan: ListChecks,
  tool: Wrench,
  error: CircleAlert,
  completed: CircleCheck,
  approval: ShieldAlert,
};

const KIND_LABEL: Record<string, string> = {
  prompt: "Prompt",
  response: "Response",
  read: "Read",
  edit: "Edit",
  write: "Write",
  patch: "Patch",
  command: "Command",
  test: "Test",
  search: "Search",
  web: "Web",
  agent: "Sub-agent",
  plan: "Plan",
  tool: "Tool",
  error: "Error",
  completed: "Completed",
  approval: "Approval",
};

type Filter = "all" | "prompts" | "files" | "commands" | "approvals" | "errors";
const FILTERS: Array<{ id: Filter; label: string; kinds?: string[] }> = [
  { id: "all", label: "All" },
  { id: "prompts", label: "Prompts", kinds: ["prompt", "response"] },
  { id: "files", label: "Files", kinds: ["read", "edit", "write", "patch"] },
  { id: "commands", label: "Commands & tests", kinds: ["command", "test"] },
  { id: "approvals", label: "Approvals", kinds: ["approval"] },
  { id: "errors", label: "Errors", kinds: ["error"] },
];

interface Entry {
  key: string;
  ms: number;
  kind: string;
  item?: TimelineItem;
  approval?: Approval;
}

function mergeTimeline(timeline: TimelineItem[], approvals: Approval[]): Entry[] {
  const out: Entry[] = [];
  let last = -Infinity;
  timeline.forEach((item, i) => {
    let ms = toMs(item.time);
    // Items without a time keep their place after the previous item.
    if (Number.isNaN(ms)) ms = last;
    last = ms;
    out.push({ key: `t:${item.id ?? i}`, ms, kind: item.kind ?? "tool", item });
  });
  for (const a of approvals) out.push({ key: `a:${a.id}`, ms: toMs(a.createdAt), kind: "approval", approval: a });
  return out
    .map((e, i) => ({ e, i }))
    .sort((x, y) => (x.e.ms === y.e.ms || Number.isNaN(x.e.ms) || Number.isNaN(y.e.ms) ? x.i - y.i : x.e.ms - y.e.ms))
    .map((x) => x.e);
}

function Detail({ text }: { text: string }) {
  const long = text.length > 200 || text.includes("\n");
  if (!long) return <p className="mt-0.5 break-words text-xs text-bk-muted">{text}</p>;
  return (
    <details className="group mt-1">
      <summary className="cursor-pointer list-none text-xs text-bk-faint hover:text-bk-muted">
        <span className="group-open:hidden">Show details</span>
        <span className="hidden group-open:inline">Hide details</span>
      </summary>
      <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-bk-line bg-bk-bg px-3 py-2 font-mono text-[11px] leading-5 text-bk-muted">
        {text}
      </pre>
    </details>
  );
}

export function TimelineTab({ data, now, onOpenFile }: { data: SessionHistoryResponse; now: number; onOpenFile: (file: string) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const entries = useMemo(() => mergeTimeline(data.history?.timeline ?? [], data.approvals ?? []), [data]);
  const kinds = FILTERS.find((f) => f.id === filter)?.kinds;
  const shown = kinds ? entries.filter((e) => kinds.includes(e.kind)) : entries;

  if (entries.length === 0) {
    return (
      <EmptyState icon={<ListChecks className="size-7" />} title="Nothing recorded yet">
        Each step the agent takes (reading and editing files, running commands and tests) appears here.
      </EmptyState>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cx(
              "rounded-full border px-3 py-1 text-xs",
              filter === f.id ? "border-bk-muted bg-bk-raised text-bk-fg" : "border-bk-line text-bk-muted hover:text-bk-fg",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-bk-faint">Nothing of this kind in this session.</p>
      ) : (
        <ol className="relative space-y-1 border-l border-bk-line pl-5">
          {shown.map((e) => {
            const Icon = KIND_ICON[e.kind] ?? Wrench;
            const time = Number.isFinite(e.ms) ? clockTime(e.ms, now) : "";
            if (e.approval) {
              const a = e.approval;
              return (
                <li key={e.key} className="relative py-1.5">
                  <span className="absolute -left-[29px] top-2 grid size-4.5 place-items-center rounded-full border border-bk-warn/40 bg-bk-panel text-bk-warn">
                    <Icon className="size-2.5" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-bk-faint">Approval</span>
                    <span className="min-w-0 text-sm text-bk-fg">{a.title || a.permission}</span>
                    <Pill tone={approvalTone(a.status)}>{a.status.toLowerCase()}</Pill>
                    {time && <span className="ml-auto text-xs text-bk-faint" title={dateTime(a.createdAt)}>{time}</span>}
                  </div>
                  {a.patterns.length > 0 && <p className="mt-0.5 truncate font-mono text-[11px] text-bk-muted">{a.patterns.join("  ")}</p>}
                </li>
              );
            }
            const item = e.item!;
            const err = e.kind === "error" || statusTone(item.status) === "err";
            return (
              <li key={e.key} className="relative py-1.5">
                <span
                  className={cx(
                    "absolute -left-[29px] top-2 grid size-4.5 place-items-center rounded-full border bg-bk-panel",
                    err ? "border-bk-err/40 text-bk-err" : e.kind === "completed" ? "border-bk-ok/40 text-bk-ok" : "border-bk-line text-bk-muted",
                  )}
                >
                  <Icon className="size-2.5" />
                </span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-bk-faint">{KIND_LABEL[e.kind] ?? e.kind}</span>
                  <span className="min-w-0 break-words text-sm text-bk-fg">{item.title || KIND_LABEL[e.kind] || "Step"}</span>
                  {item.status && statusTone(item.status) !== "ok" && <Pill tone={statusTone(item.status)}>{item.status}</Pill>}
                  {time && (
                    <span className="ml-auto text-xs text-bk-faint" title={dateTime(e.ms)}>
                      {time}
                    </span>
                  )}
                </div>
                {item.file && (
                  <button type="button" onClick={() => onOpenFile(item.file!)} className="mt-0.5 block max-w-full truncate font-mono text-[11px] text-bk-muted underline-offset-2 hover:text-bk-fg hover:underline" title={item.file}>
                    {item.file}
                  </button>
                )}
                {item.detail && <Detail text={item.detail} />}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- file versions (live from the PC) */

function useFileVersions(sessionId: string, path: string | null, enabled: boolean): Resource<FileVersions> {
  return useResource<FileVersions>(enabled && path ? `/v1/sessions/${sessionId}/file-versions?path=${encodeURIComponent(path)}` : null);
}

function NeedsPc({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <WifiOff className="mb-2 size-5 text-bk-warn" />
      <p className="max-w-md text-sm text-bk-muted">{children}</p>
    </div>
  );
}

function VersionPane({
  res,
  which,
  pcOnline,
  status,
  context,
}: {
  res: Resource<FileVersions>;
  which: "before" | "after";
  pcOnline: boolean;
  status: string | null | undefined;
  context: "change" | "file";
}) {
  const offlineText =
    context === "change"
      ? "Before and after need your PC online: full file versions are read live from your PC and are never saved in the cloud. The diff is still available from the session record."
      : "File contents need your PC online: they are read live from your PC and are never saved in the cloud. Open BambooKit Desktop on that PC to see them here.";
  if (!pcOnline || res.error?.code === "DESKTOP_OFFLINE") return <NeedsPc>{offlineText}</NeedsPc>;
  if (res.error && !res.data) return <ErrorState title="Couldn't load this file" message={res.error.message} onRetry={res.reload} />;
  if (!res.data) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-10 text-xs text-bk-muted">
        <Spinner className="size-3.5" /> Reading the file from your PC…
      </div>
    );
  }
  const v = res.data;
  const st = v.status ?? status;
  const text = which === "before" ? v.before : v.after;
  const sourceLabel = which === "before" ? (v.beforeSource === "git" ? "From Git, as committed before this session" : v.beforeSource === "session" ? "From the session record" : null) : "After this session";
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-bk-line px-4 py-2 text-xs text-bk-faint">
        {sourceLabel && <span>{sourceLabel}</span>}
        {res.loading && <Spinner className="size-3" />}
        <button type="button" onClick={res.reload} className="ml-auto inline-flex items-center gap-1 hover:text-bk-fg" title="Read the file again">
          <RefreshCw className="size-3" /> Refresh
        </button>
      </div>
      {v.note && (
        <Notice className="m-3" icon={<CircleAlert className="size-4" />}>
          {v.note}
        </Notice>
      )}
      {v.truncated && (
        <Notice tone="warn" className="m-3">
          This file is large, so only the beginning is shown.
        </Notice>
      )}
      {text === null || text === undefined ? (
        <p className="px-4 py-10 text-center text-sm text-bk-faint">
          {which === "before"
            ? st === "added"
              ? "This file didn't exist before this session."
              : "The earlier version of this file isn't available."
            : st === "deleted"
              ? "This file was deleted in this session."
              : "The current version of this file isn't available."}
        </p>
      ) : text === "" ? (
        <p className="px-4 py-10 text-center text-sm text-bk-faint">This file is empty.</p>
      ) : (
        <CodeView text={text} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- changes */

function FileList<T extends { file: string }>({
  files,
  selected,
  onSelect,
  render,
}: {
  files: T[];
  selected: string | null;
  onSelect: (file: string) => void;
  render: (f: T) => ReactNode;
}) {
  return (
    <ul className="max-h-[70vh] divide-y divide-bk-line overflow-y-auto">
      {files.map((f) => {
        const { name, dir } = splitPath(f.file);
        const active = f.file === selected;
        return (
          <li key={f.file}>
            <button
              type="button"
              onClick={() => onSelect(f.file)}
              title={f.file}
              aria-current={active ? "true" : undefined}
              className={cx("flex w-full items-center gap-2 px-3 py-2 text-left", active ? "bg-bk-raised" : "hover:bg-bk-raised/60")}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-xs text-bk-fg">{name}</span>
                {dir && <span className="block truncate font-mono text-[11px] text-bk-faint">{dir}</span>}
              </span>
              {render(f)}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SegButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("shrink-0 rounded-md px-2.5 py-1 text-xs", active ? "bg-bk-raised text-bk-fg" : "text-bk-muted hover:text-bk-fg")}
    >
      {children}
    </button>
  );
}

type ChangeView = "diff" | "before" | "after";

function ChangeViewer({ change, sessionId, pcOnline, now }: { change: HistoryChange; sessionId: string; pcOnline: boolean; now: number }) {
  const [view, setView] = useState<ChangeView>("diff");
  const [edit, setEdit] = useState<number | "all">("all");
  const edits = change.edits ?? [];
  const versions = useFileVersions(sessionId, change.file, view !== "diff" && pcOnline);
  const shownEdits = edit === "all" ? edits.map((e, i) => ({ e, i })) : edits[edit] ? [{ e: edits[edit], i: edit }] : [];

  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-bk-line px-4 py-2.5">
        <ChangeBadge status={change.status} />
        <span className="min-w-0 flex-1 break-all font-mono text-xs text-bk-fg">
          {change.oldPath && change.oldPath !== change.file && <span className="text-bk-faint">{change.oldPath} → </span>}
          {change.file}
        </span>
        <PlusMinus additions={change.additions} deletions={change.deletions} />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-bk-line px-3 py-2">
        <div className="inline-flex rounded-lg border border-bk-line bg-bk-bg p-0.5">
          <SegButton active={view === "diff"} onClick={() => setView("diff")}>Diff</SegButton>
          <SegButton active={view === "before"} onClick={() => setView("before")}>Before</SegButton>
          <SegButton active={view === "after"} onClick={() => setView("after")}>After</SegButton>
        </div>
        {view === "diff" && edits.length > 1 && (
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            <SegButton active={edit === "all"} onClick={() => setEdit("all")}>All changes</SegButton>
            {edits.map((e, i) => (
              <SegButton key={i} active={edit === i} onClick={() => setEdit(i)}>
                Change {i + 1}
                {clockTime(e.time, now) && <span className="ml-1 text-bk-faint">· {clockTime(e.time, now)}</span>}
              </SegButton>
            ))}
          </div>
        )}
      </div>
      {view === "diff" ? (
        edits.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-bk-faint">No edits were recorded for this file.</p>
        ) : (
          <div className="divide-y divide-bk-line">
            {shownEdits.map(({ e, i }) => (
              <div key={i}>
                {(edits.length > 1 || e.tool || e.time) && (
                  <div className="flex flex-wrap items-center gap-2 bg-bk-bg/60 px-4 py-1.5 text-[11px] text-bk-faint">
                    <span className="font-medium text-bk-muted">Change {i + 1}</span>
                    {e.tool && <span className="font-mono">{e.tool}</span>}
                    {clockTime(e.time, now) && <span title={dateTime(e.time)}>{clockTime(e.time, now)}</span>}
                    <span className="ml-auto">
                      <PlusMinus additions={e.additions} deletions={e.deletions} />
                    </span>
                  </div>
                )}
                <DiffTable patch={e.patch} />
              </div>
            ))}
          </div>
        )
      ) : (
        <VersionPane res={versions} which={view} pcOnline={pcOnline} status={change.status} context="change" />
      )}
    </Card>
  );
}

export function ChangesTab({
  data,
  sessionId,
  pcOnline,
  now,
  selected,
  onSelect,
}: {
  data: SessionHistoryResponse;
  sessionId: string;
  pcOnline: boolean;
  now: number;
  selected: string | null;
  onSelect: (file: string) => void;
}) {
  const changes = data.history?.changes ?? [];
  const current = changes.find((c) => c.file === selected) ?? changes[0];
  if (changes.length === 0) {
    return (
      <EmptyState icon={<FileDiff className="size-7" />} title="No files changed">
        Files the agent adds, edits or deletes in this session appear here with their diffs.
      </EmptyState>
    );
  }
  const totals = changes.reduce((t, c) => ({ a: t.a + (c.additions ?? 0), d: t.d + (c.deletions ?? 0) }), { a: 0, d: 0 });
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <Card className="min-w-0 self-start overflow-hidden lg:sticky lg:top-20">
        <div className="flex items-center justify-between border-b border-bk-line px-3 py-2.5 text-sm">
          <span className="font-medium">{plural(changes.length, "file")}</span>
          <Changes additions={totals.a} deletions={totals.d} />
        </div>
        <FileList
          files={changes}
          selected={current.file}
          onSelect={onSelect}
          render={(c) => (
            <>
              <PlusMinus additions={c.additions} deletions={c.deletions} />
              <ChangeBadge status={c.status} />
            </>
          )}
        />
      </Card>
      <ChangeViewer key={current.file} change={current} sessionId={sessionId} pcOnline={pcOnline} now={now} />
    </div>
  );
}

/* ---------------------------------------------------------------- files */

interface TouchedFile {
  file: string;
  kinds: string[];
  change?: HistoryChange;
}

export function touchedFiles(h: SessionHistory | null | undefined): TouchedFile[] {
  const map = new Map<string, TouchedFile>();
  const get = (file: string) => {
    let f = map.get(file);
    if (!f) map.set(file, (f = { file, kinds: [] }));
    return f;
  };
  for (const c of h?.changes ?? []) get(c.file).change = c;
  for (const t of h?.timeline ?? []) {
    if (!t.file) continue;
    const f = get(t.file);
    const kind = t.kind ?? "tool";
    if (!f.kinds.includes(kind)) f.kinds.push(kind);
  }
  return [...map.values()].sort((a, b) => a.file.localeCompare(b.file));
}

export function FilesTab({
  data,
  sessionId,
  pcOnline,
  onOpenChange,
  selected,
  onSelect,
}: {
  data: SessionHistoryResponse;
  sessionId: string;
  pcOnline: boolean;
  onOpenChange: (file: string) => void;
  selected: string | null;
  onSelect: (file: string) => void;
}) {
  const files = useMemo(() => touchedFiles(data.history), [data]);
  const current = files.find((f) => f.file === selected) ?? files[0];
  const content = useFileVersions(sessionId, current?.file ?? null, pcOnline);

  if (!current) {
    return (
      <EmptyState icon={<Files className="size-7" />} title="No files touched yet">
        Every file the agent reads, searches, creates, edits or deletes in this session is listed here.
      </EmptyState>
    );
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <Card className="min-w-0 self-start overflow-hidden lg:sticky lg:top-20">
        <div className="border-b border-bk-line px-3 py-2.5 text-sm font-medium">{plural(files.length, "file")} touched</div>
        <FileList
          files={files}
          selected={current.file}
          onSelect={onSelect}
          render={(f) =>
            f.change ? (
              <ChangeBadge status={f.change.status} />
            ) : (
              <span className="shrink-0 text-[10px] uppercase tracking-wide text-bk-faint">{f.kinds.map((k) => KIND_LABEL[k] ?? k).join(", ")}</span>
            )
          }
        />
      </Card>
      <Card className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-bk-line px-4 py-2.5">
          {current.change ? <ChangeBadge status={current.change.status} /> : <FileText className="size-4 shrink-0 text-bk-faint" />}
          <span className="min-w-0 flex-1 break-all font-mono text-xs text-bk-fg">{current.file}</span>
          {current.change && (
            <Button className="px-2.5 py-1 text-xs" onClick={() => onOpenChange(current.file)}>
              <FileDiff className="size-3.5" /> View changes
            </Button>
          )}
        </div>
        {current.kinds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-bk-line px-4 py-2">
            {current.kinds.map((k) => (
              <Pill key={k}>{KIND_LABEL[k] ?? k}</Pill>
            ))}
          </div>
        )}
        <VersionPane res={content} which="after" pcOnline={pcOnline} status={current.change?.status} context="file" />
      </Card>
    </div>
  );
}
