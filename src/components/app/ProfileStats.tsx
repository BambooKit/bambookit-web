"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronRight, Clock, Code2, FolderGit2, ListChecks, Trophy } from "lucide-react";
import { InlineError } from "@/components/ErrorInfo";
import { Achievements } from "./Achievements";
import { Card, EmptyState, ErrorState, LoadingState, Pill, Spinner, cx } from "@/components/ui";
import { apiRequest, useResource } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fullDate, timeAgo } from "@/lib/format";
import { useRealtime } from "@/lib/realtime";
import type { ProfileStats as Stats, ProjectStat, ProjectStatus } from "@/lib/types";

const n = (v: number | null | undefined) => (Number(v) || 0).toLocaleString();

/** Coding time as "12 h 5 min" / "40 min" / "0 min". */
export function codingTime(ms: number | null | undefined): string {
  const minutes = Math.floor((Number(ms) || 0) / 60_000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? (m ? `${h.toLocaleString()} h ${m} min` : `${h.toLocaleString()} h`) : `${m} min`;
}

function Section({ id, icon, title, help, children, action }: { id?: string; icon: ReactNode; title: string; help?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 text-sm font-medium text-bk-fg">
          <span className="text-bk-faint">{icon}</span> {title}
        </h3>
        {action}
      </div>
      {children}
      {help && <p className="mt-1.5 text-xs text-bk-faint">{help}</p>}
    </section>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: ReactNode; tone?: "ok" | "err" | "warn" }) {
  return (
    <div className="min-w-0 rounded-lg border border-bk-line bg-bk-bg/40 px-3 py-2.5">
      <div className="truncate text-xs text-bk-muted">{label}</div>
      <div className={cx("mt-0.5 text-lg font-semibold tabular-nums", tone === "ok" ? "text-bk-ok" : tone === "err" ? "text-bk-err" : tone === "warn" ? "text-bk-warn" : "text-bk-fg")}>
        {value}
      </div>
      {sub && <div className="truncate text-[11px] text-bk-faint">{sub}</div>}
    </div>
  );
}

const STATUSES: ProjectStatus[] = ["active", "completed", "archived"];
const STATUS_LABEL: Record<ProjectStatus, string> = { active: "Active", completed: "Completed", archived: "Archived" };

function recount(stats: Stats, list: ProjectStat[]): Stats {
  const by = (s: ProjectStatus) => list.filter((p) => p.status === s).length;
  return { ...stats, projects: { ...stats.projects, list, total: list.length, active: by("active"), completed: by("completed"), archived: by("archived") } };
}

function ProjectRow({ p, now, onStatus }: { p: ProjectStat; now: number; onStatus: (status: ProjectStatus) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const open = `/sessions/?project=${encodeURIComponent(p.id)}`;
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link href={open} className="group flex min-w-0 flex-1 items-center gap-2" title="Open this project's sessions">
          <FolderGit2 className="size-4 shrink-0 text-bk-faint" />
          <span className="min-w-0 truncate font-medium text-bk-fg group-hover:underline">{p.name}</span>
          {p.branch && <span className="hidden truncate font-mono text-[11px] text-bk-faint sm:inline">{p.branch}</span>}
          <ChevronRight className="size-4 shrink-0 text-bk-faint group-hover:text-bk-muted" />
        </Link>
        <label className="inline-flex shrink-0 items-center gap-1.5">
          <span className="sr-only">Status of {p.name}</span>
          {busy && <Spinner className="size-3.5 text-bk-faint" />}
          <select
            value={p.status}
            disabled={busy}
            onChange={async (e) => {
              setBusy(true);
              setError(null);
              try {
                await onStatus(e.target.value as ProjectStatus);
              } catch (err) {
                setError(err);
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-md border border-bk-line bg-bk-panel px-2 py-1 text-xs text-bk-fg focus:border-bk-muted focus:outline-none disabled:opacity-50"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 pl-6 text-xs text-bk-muted">
        <span title={fullDate(p.lastActivityAt)}>Last activity {timeAgo(p.lastActivityAt, now)}</span>
        <span>{n(p.sessions)} sessions</span>
        <span>{n(p.tasks)} tasks</span>
        <span>{n(p.filesChanged)} files changed</span>
        <span>{codingTime(p.codingMs)} coding</span>
      </div>
      <InlineError error={error} className="mt-2" />
    </li>
  );
}

/** Profile statistics from GET /v1/me/stats. Every number is computed by the API from real records. */
export function ProfileStats({ now }: { now: number }) {
  const { getToken } = useAuth();
  const stats = useResource<Stats>("/v1/me/stats");
  const { reload, setData } = stats;
  const [showAll, setShowAll] = useState(false);

  useRealtime((e) => {
    if (e.type === "achievement.unlocked") {
      reload();
    } else if (e.type === "project.updated" && e.payload?.id && e.payload?.status) {
      setData((d) => (d ? recount(d, d.projects.list.map((x) => (x.id === e.payload.id ? { ...x, status: e.payload.status } : x))) : d));
    } else if (e.type === "ready" && e.payload?.reconnect) {
      reload();
    }
  });

  if (stats.error && !stats.data) return <ErrorState title="Couldn't load your statistics" error={stats.error} onRetry={reload} />;
  if (!stats.data) return <LoadingState slow={stats.slow} label="Loading your statistics…" />;

  const s = stats.data;
  const projects = s.projects.list;
  const visible = showAll ? projects : projects.slice(0, 8);
  const achievements = Array.isArray(s.achievements) ? s.achievements : [];
  const unlocked = s.achievementSummary?.unlocked ?? achievements.filter((a) => a.unlocked).length;
  const total = s.achievementSummary?.total ?? achievements.length;

  const setStatus = async (id: string, status: ProjectStatus) => {
    const before = s.projects.list;
    setData((d) => (d ? recount(d, d.projects.list.map((x) => (x.id === id ? { ...x, status } : x))) : d));
    try {
      await apiRequest("PATCH", `/v1/projects/${encodeURIComponent(id)}`, await getToken(), { body: { status } });
    } catch (err) {
      setData((d) => (d ? recount(d, before) : d));
      throw err;
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium text-bk-fg">Statistics</h2>
        <span className="inline-flex items-center gap-2 text-xs text-bk-faint">
          {stats.loading && <Spinner className="size-3" />}
          Times in {s.timeZone}
        </span>
      </div>
      {stats.error && <InlineError error={stats.error} message={`Showing the last loaded statistics. ${stats.error.message}`} onRetry={reload} className="mb-4" />}

      <div className="space-y-6">
        <Section icon={<FolderGit2 className="size-4" />} title="Projects managed" help="A project is a folder you opened in BambooKit Desktop. You set the status here; it is not changed automatically.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Tile label="Total" value={n(s.projects.total)} />
            <Tile label="Active" value={n(s.projects.active)} />
            <Tile label="Completed" value={n(s.projects.completed)} tone={s.projects.completed ? "ok" : undefined} />
            <Tile label="Archived" value={n(s.projects.archived)} />
          </div>
          {projects.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="No projects yet">Open a folder in BambooKit Desktop on your PC. It appears here with its sessions and coding time.</EmptyState>
            </div>
          ) : (
            <>
              <ul className="mt-3 divide-y divide-bk-line overflow-hidden rounded-lg border border-bk-line">
                {visible.map((p) => (
                  <ProjectRow key={p.id} p={p} now={now} onStatus={(status) => setStatus(p.id, status)} />
                ))}
              </ul>
              {projects.length > visible.length || showAll ? (
                <button type="button" className="mt-2 text-xs text-bk-muted underline-offset-2 hover:text-bk-fg hover:underline" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Show fewer" : `Show all ${projects.length} projects`}
                </button>
              ) : null}
            </>
          )}
        </Section>

        <Section icon={<Clock className="size-4" />} title="Coding time" help={`${s.rules.codingTime} Weeks start on Monday; night hours are ${s.rules.nightHours}.`}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Tile label="Total" value={codingTime(s.codingTime.totalMs)} sub={`Longest task ${codingTime(s.codingTime.longestMs)}`} />
            <Tile label="This week" value={codingTime(s.codingTime.thisWeekMs)} />
            <Tile label="This month" value={codingTime(s.codingTime.thisMonthMs)} sub={`At night ${codingTime(s.codingTime.nightMs)}`} />
          </div>
        </Section>

        <Section icon={<ListChecks className="size-4" />} title="Tasks" help="A task is one agent run: from the moment the agent starts working until it finishes (completed) or stops with an error (failed).">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Tile label="Completed" value={n(s.tasks.completed)} tone={s.tasks.completed ? "ok" : undefined} />
            <Tile label="Failed" value={n(s.tasks.failed)} tone={s.tasks.failed ? "err" : undefined} />
            <Tile label="Sessions" value={n(s.sessions.total)} sub={`${n(s.sessions.withCompletedWork)} with completed work`} />
            <Tile label="Debugging tasks" value={n(s.tasks.debugging)} />
          </div>
        </Section>

        <Section icon={<Code2 className="size-4" />} title="Code" help={`${s.rules.files} Tests, commits and deployments are the commands the agent ran for you.`}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Tile label="Files created" value={n(s.code.filesCreated)} />
            <Tile label="Files modified" value={n(s.code.filesModified)} />
            <Tile label="Files deleted" value={n(s.code.filesDeleted)} />
            <Tile label="Files renamed" value={n(s.code.filesRenamed)} />
            <Tile label="Lines added" value={`+${n(s.code.linesAdded)}`} tone={s.code.linesAdded ? "ok" : undefined} />
            <Tile label="Lines deleted" value={`−${n(s.code.linesDeleted)}`} tone={s.code.linesDeleted ? "err" : undefined} />
            <Tile label="Edits" value={n(s.code.edits)} />
            <Tile label="Tests run" value={n(s.code.testsRun)} sub={`${n(s.code.testsPassed)} passed · ${n(s.code.testsFailed)} failed`} />
            <Tile label="Commits" value={n(s.code.commits)} />
            <Tile label="Deployments" value={n(s.code.deployments)} />
          </div>
        </Section>

        <Section
          id="achievements"
          icon={<Trophy className="size-4" />}
          title="Achievements"
          action={<Pill tone={unlocked ? "ok" : "neutral"}>{`${unlocked} of ${total} unlocked`}</Pill>}
          help="Each achievement has five tiers, Bronze to Diamond, computed from your real BambooKit records. A tier unlocks once and stays unlocked; new tiers appear here live. Hover or tap the dots for every tier's goal and unlock date."
        >
          <Achievements achievements={achievements} summary={s.achievementSummary} streak={s.streak} />
        </Section>
      </div>
    </Card>
  );
}
