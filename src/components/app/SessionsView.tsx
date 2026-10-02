"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Monitor, Search, ShieldAlert, Sparkles } from "lucide-react";
import { ButtonLink, Changes, EmptyState, ErrorState, LoadingState, OnlineDot, PageHeader, Pill, StatusBadge, cx } from "@/components/ui";
import { useLiveDevices, useLiveSessions, useNow, sortSessions } from "@/lib/live";
import { timeAgo, fullDate, plural } from "@/lib/format";
import type { Device, Session, SessionStatus } from "@/lib/types";

const STATUS_FILTERS: Array<{ value: "" | SessionStatus; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "busy", label: "Working" },
  { value: "retry", label: "Retrying" },
  { value: "error", label: "Error" },
  { value: "idle", label: "Idle" },
];

function PcButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex w-full min-w-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors max-lg:w-auto max-lg:shrink-0 max-lg:border max-lg:border-bk-line",
        active ? "bg-bk-raised text-bk-fg" : "text-bk-muted hover:bg-bk-raised/60 hover:text-bk-fg",
      )}
    >
      {children}
    </button>
  );
}

function PcList({ desktops, sessions, selected, onSelect, now }: { desktops: Device[]; sessions: Session[]; selected: string; onSelect: (id: string) => void; now: number }) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sessions) m.set(s.deviceId, (m.get(s.deviceId) ?? 0) + 1);
    return m;
  }, [sessions]);
  return (
    <aside className="min-w-0">
      <div className="mb-2 hidden px-3 text-xs font-medium uppercase tracking-wider text-bk-faint lg:block">Your PCs</div>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
        <PcButton active={selected === ""} onClick={() => onSelect("")}>
          <Monitor className="size-4 shrink-0 text-bk-faint" />
          <span className="flex-1 truncate">All PCs</span>
          <span className="text-xs tabular-nums text-bk-faint">{sessions.length}</span>
        </PcButton>
        {desktops.map((d) => (
          <PcButton key={d.id} active={selected === d.id} onClick={() => onSelect(d.id)}>
            <OnlineDot online={d.online} />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{d.name}</span>
              <span className="block truncate text-[11px] text-bk-faint">{d.online ? "Online" : `Last seen ${timeAgo(d.lastSeenAt, now)}`}</span>
            </span>
            <span className="text-xs tabular-nums text-bk-faint">{counts.get(d.id) ?? 0}</span>
          </PcButton>
        ))}
      </div>
    </aside>
  );
}

function SessionRow({ s, pc, now }: { s: Session; pc: Device | undefined; now: number }) {
  const detail = s.status === "error" || s.status === "retry" ? s.statusMessage : s.status === "busy" ? s.currentAction : null;
  return (
    <li>
      <Link
        href={`/session/?id=${encodeURIComponent(s.id)}`}
        className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-bk-raised/50 sm:items-center"
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate font-medium text-bk-fg">{s.title || "Untitled session"}</span>
            <StatusBadge status={s.status} />
            {s.pendingApprovals > 0 && (
              <Pill tone="warn">
                <ShieldAlert className="size-3" /> {plural(s.pendingApprovals, "approval")}
              </Pill>
            )}
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-bk-faint">
            {s.projectName && <span className="truncate text-bk-muted">{s.projectName}</span>}
            {pc && (
              <span className="inline-flex items-center gap-1">
                <OnlineDot online={pc.online} className="size-1.5" /> {pc.name}
              </span>
            )}
            {s.model && <span className="truncate font-mono">{s.model}</span>}
          </div>
          {detail && <div className={cx("mt-1 truncate text-xs", s.status === "busy" ? "text-bk-muted" : s.status === "error" ? "text-bk-err" : "text-bk-warn")}>{detail}</div>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          <span className="text-xs text-bk-faint" title={fullDate(s.updatedAt)}>
            {timeAgo(s.updatedAt, now)}
          </span>
          <Changes additions={s.changes.additions} deletions={s.changes.deletions} files={s.changes.files} />
        </div>
        <ChevronRight className="mt-0.5 hidden size-4 shrink-0 text-bk-faint group-hover:text-bk-muted sm:block" />
      </Link>
    </li>
  );
}

export function SessionsView() {
  const devices = useLiveDevices();
  const sessions = useLiveSessions();
  const now = useNow();
  const [pc, setPc] = useState("");
  const [status, setStatus] = useState<"" | SessionStatus>("");
  const [query, setQuery] = useState("");

  const desktops = useMemo(() => (devices.data ?? []).filter((d) => d.kind === "desktop"), [devices.data]);
  const byId = useMemo(() => new Map(desktops.map((d) => [d.id, d])), [desktops]);
  const all = useMemo(() => sortSessions(sessions.data ?? []), [sessions.data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (s) =>
        (!pc || s.deviceId === pc) &&
        (!status || s.status === status) &&
        (!q || (s.title ?? "").toLowerCase().includes(q) || (s.projectName ?? "").toLowerCase().includes(q)),
    );
  }, [all, pc, status, query]);

  const header = (
    <PageHeader
      title="Sessions"
      description="Every session on your PCs, updated live. View only: chat happens in BambooKit Desktop."
    />
  );

  if ((devices.loading && !devices.data) || (sessions.loading && !sessions.data)) {
    return (
      <>
        {header}
        <LoadingState slow={devices.slow || sessions.slow} label="Loading your sessions…" />
      </>
    );
  }
  const error = devices.error ?? sessions.error;
  if (error && (!devices.data || !sessions.data)) {
    return (
      <>
        {header}
        <ErrorState
          message={error.message}
          onRetry={() => {
            devices.reload();
            sessions.reload();
          }}
        />
      </>
    );
  }

  if (desktops.length === 0 && all.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={<Sparkles className="size-7" />}
          title="No PC connected yet"
          action={
            <ButtonLink href="/welcome/" variant="primary">
              Set up BambooKit
            </ButtonLink>
          }
        >
          Install BambooKit Desktop on your Windows PC and sign in with this account. Its sessions will appear here.
        </EmptyState>
      </>
    );
  }

  const busy = all.filter((s) => s.status === "busy" || s.status === "retry").length;

  return (
    <>
      {header}
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <PcList desktops={desktops} sessions={all} selected={pc} onSelect={setPc} now={now} />
        <section className="min-w-0">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bk-faint" />
              <span className="sr-only">Search sessions</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or project"
                className="w-full rounded-lg border border-bk-line bg-bk-panel py-2 pl-9 pr-3 text-sm text-bk-fg placeholder:text-bk-faint focus:border-bk-muted focus:outline-none"
              />
            </label>
            <label className="shrink-0">
              <span className="sr-only">Filter by status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "" | SessionStatus)}
                className="w-full rounded-lg border border-bk-line bg-bk-panel px-3 py-2 text-sm text-bk-fg focus:border-bk-muted focus:outline-none sm:w-auto"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mb-2 flex items-center justify-between px-1 text-xs text-bk-faint">
            <span>
              {plural(filtered.length, "session")}
              {filtered.length !== all.length && ` of ${all.length}`}
            </span>
            {busy > 0 && <span className="text-bk-ok">{busy} working now</span>}
          </div>
          {filtered.length === 0 ? (
            all.length === 0 ? (
              <EmptyState icon={<Monitor className="size-7" />} title="No sessions yet">
                Start a session in BambooKit Desktop on your PC. It appears here as soon as it starts.
              </EmptyState>
            ) : (
              <EmptyState title="No sessions match">Try another search or filter.</EmptyState>
            )
          ) : (
            <ul className="divide-y divide-bk-line overflow-hidden rounded-xl border border-bk-line bg-bk-panel">
              {filtered.map((s) => (
                <SessionRow key={s.id} s={s} pc={byId.get(s.deviceId)} now={now} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
