"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, ShieldOff } from "lucide-react";
import { Button, ButtonLink, Card, EmptyState, ErrorState, LoadingState, PageHeader, Pill, Spinner, cx } from "@/components/ui";
import { InlineError } from "@/components/ErrorInfo";
import { ApiError, apiRequestFull, safePath, useResource } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { useNow } from "@/lib/live";
import { clockTime, formatDuration, fullDate, plural, timeAgo } from "@/lib/format";
import type { AdminOverview, AdminUser } from "@/lib/types";

const REFRESH_MS = 30_000;
const PAGE_SIZE = 25;

/** Calls `refresh` every 30 s while the tab is visible, and right away when it becomes visible again. */
function useAutoRefresh(refresh: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const timer = setInterval(tick, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, enabled]);
}

/** GET /v1/admin/users with its `total`, which useResource drops. */
function useAdminUsers(offset: number, enabled: boolean) {
  const { getToken, status } = useAuth();
  const [data, setData] = useState<{ data: AdminUser[]; total: number } | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled || status !== "signedIn") return;
    const path = `/v1/admin/users?limit=${PAGE_SIZE}&offset=${offset}`;
    const ctrl = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const body = await apiRequestFull<{ data: AdminUser[]; total: number }>("GET", path, await getToken(), { signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        setData(body);
        setError(null);
      } catch (err) {
        if (ctrl.signal.aborted || (err as Error)?.name === "AbortError") return;
        setError(err instanceof ApiError ? err : new ApiError(0, "UNKNOWN", (err as Error)?.message ?? "Something went wrong.", { method: "GET", path: safePath(path) }));
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [offset, enabled, status, tick, getToken]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}

const PROVIDER_LABELS: Record<string, string> = { email: "Email", google: "Google", unknown: "Unknown" };
const providerLabel = (p: string | null) => PROVIDER_LABELS[p ?? "unknown"] ?? p ?? "Unknown";
const num = (n: number) => n.toLocaleString();

function uptime(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const rest = formatDuration((seconds % 86_400) * 1000) || "0 s";
  return days > 0 ? `${days} d ${rest}` : rest;
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-bk-faint">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "ok" | "warn" | "err" | "faint" }) {
  const tones = { ok: "text-bk-ok", warn: "text-bk-warn", err: "text-bk-err", faint: "text-bk-faint" };
  return (
    <Card className="min-w-0 p-4">
      <div className="text-xs text-bk-faint">{label}</div>
      <div className={cx("mt-1 truncate text-xl font-semibold tabular-nums", tone ? tones[tone] : "text-bk-fg")}>{value}</div>
      {hint && <div className="mt-0.5 truncate text-xs text-bk-muted">{hint}</div>}
    </Card>
  );
}

/** A count list as small horizontal bars (sign-in methods, desktop versions). */
function Breakdown({ title, counts, label = (k: string) => k, empty }: { title: string; counts: Record<string, number>; label?: (k: string) => string; empty: string }) {
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <Card className="p-4">
      <div className="mb-3 text-xs text-bk-faint">{title}</div>
      {rows.length === 0 ? (
        <p className="text-sm text-bk-faint">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(([k, n]) => (
            <li key={k} className="text-sm">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="truncate text-bk-muted">{label(k)}</span>
                <span className="tabular-nums text-bk-fg">{num(n)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bk-raised">
                <div className="h-full rounded-full bg-bk-accent/60" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const TH = "px-3 py-2 text-left text-xs font-medium text-bk-faint";
const TD = "px-3 py-2 align-top";

function ErrorsTable({ overview, now }: { overview: AdminOverview; now: number }) {
  const errors = overview.health.recentErrors;
  if (errors.length === 0) {
    return <EmptyState title="No server errors">No 5xx responses since the API started {timeAgo(overview.health.startedAt, now)}.</EmptyState>;
  }
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-bk-line">
          <tr>
            <th className={TH}>Time</th>
            <th className={TH}>Route</th>
            <th className={TH}>Status</th>
            <th className={TH}>Code</th>
            <th className={TH}>Request ID</th>
            <th className={TH}>Client</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bk-line">
          {errors.map((e) => (
            <tr key={`${e.requestId}-${e.at}`}>
              <td className={cx(TD, "whitespace-nowrap text-bk-muted")} title={fullDate(e.at)}>
                {clockTime(e.at, now)}
              </td>
              <td className={TD}>
                <div className="font-mono text-xs text-bk-fg">
                  <span className="text-bk-faint">{e.method}</span> {e.path}
                </div>
                {e.message && <div className="mt-0.5 line-clamp-2 text-xs text-bk-muted">{e.message}</div>}
              </td>
              <td className={TD}>
                <Pill tone="err">{e.status}</Pill>
              </td>
              <td className={cx(TD, "font-mono text-xs text-bk-muted")}>{e.code}</td>
              <td className={cx(TD, "select-all font-mono text-xs text-bk-muted")}>{e.requestId}</td>
              <td className={cx(TD, "text-xs text-bk-muted")}>{e.client ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function UsersTable({ enabled, refreshKey, now }: { enabled: boolean; refreshKey: number; now: number }) {
  const [offset, setOffset] = useState(0);
  const users = useAdminUsers(offset, enabled);
  const { reload } = users;
  useEffect(() => {
    if (refreshKey > 0) reload();
  }, [refreshKey, reload]);

  if (users.error && !users.data) return <ErrorState title="Couldn't load users" error={users.error} onRetry={reload} />;
  if (!users.data) return <LoadingState label="Loading users…" />;

  const { data, total } = users.data;
  const first = total === 0 ? 0 : offset + 1;
  const last = Math.min(offset + data.length, total);
  return (
    <div className="space-y-3">
      {users.error && <InlineError error={users.error} message="Couldn't refresh the users list. Showing the last loaded page." onRetry={reload} />}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-bk-line">
            <tr>
              <th className={TH}>User</th>
              <th className={TH}>Sign-in</th>
              <th className={TH}>Joined</th>
              <th className={TH}>Last seen</th>
              <th className={cx(TH, "text-right")}>Devices</th>
              <th className={cx(TH, "text-right")}>Projects</th>
              <th className={cx(TH, "text-right")}>Sessions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bk-line">
            {data.map((u) => (
              <tr key={u.id}>
                <td className={TD}>
                  <div className="truncate text-bk-fg">{u.name || u.email || "No name"}</div>
                  {u.email && u.name && <div className="truncate text-xs text-bk-faint">{u.email}</div>}
                </td>
                <td className={TD}>
                  <span className="text-bk-muted">{providerLabel(u.provider)}</span>
                  {u.emailVerified === false && (
                    <Pill tone="warn" className="ml-2">
                      Unverified
                    </Pill>
                  )}
                </td>
                <td className={cx(TD, "whitespace-nowrap text-bk-muted")} title={fullDate(u.createdAt)}>
                  {timeAgo(u.createdAt, now)}
                </td>
                <td className={cx(TD, "whitespace-nowrap text-bk-muted")} title={fullDate(u.lastSeenAt)}>
                  {u.lastSeenAt ? timeAgo(u.lastSeenAt, now) : "Never"}
                </td>
                <td className={cx(TD, "text-right tabular-nums")}>{num(u.devices)}</td>
                <td className={cx(TD, "text-right tabular-nums")}>{num(u.projects)}</td>
                <td className={cx(TD, "text-right tabular-nums")}>{num(u.sessions)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-bk-faint">
                  No users on this page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-bk-muted">
        <span className="inline-flex items-center gap-2">
          {first}–{last} of {num(total)}
          {users.loading && <Spinner className="size-3.5" />}
        </span>
        <div className="flex gap-2">
          <Button className="px-3 py-1.5" disabled={offset === 0 || users.loading} onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}>
            <ChevronLeft className="size-4" /> Newer
          </Button>
          <Button className="px-3 py-1.5" disabled={offset + PAGE_SIZE >= total || users.loading} onClick={() => setOffset((o) => o + PAGE_SIZE)}>
            Older <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotAdmin() {
  return (
    <EmptyState
      icon={<ShieldOff className="size-6" />}
      title="Administrators only"
      action={
        <ButtonLink href="/sessions/" variant="secondary">
          Back to sessions
        </ButtonLink>
      }
    >
      This page shows the BambooKit service status and is only available to administrator accounts.
    </EmptyState>
  );
}

const isNotAdmin = (e: unknown) => e instanceof ApiError && (e.code === "NOT_ADMIN" || e.status === 403);

export function AdminView() {
  const profile = useProfile();
  const admin = profile.data?.admin === true;
  const overview = useResource<AdminOverview>(admin ? "/v1/admin/overview" : null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const now = useNow(5_000);
  const { reload } = overview;

  const refresh = useCallback(() => {
    reload();
    setRefreshKey((k) => k + 1);
  }, [reload]);
  useAutoRefresh(refresh, admin);

  useEffect(() => {
    if (overview.data) setUpdatedAt(Date.now());
  }, [overview.data]);

  const header = (
    <PageHeader
      title="Admin"
      description="BambooKit service health, usage and recent server errors. Refreshes every 30 seconds while this tab is open."
      actions={
        admin && (
          <>
            {updatedAt && <span className="text-xs text-bk-faint">Updated {timeAgo(new Date(updatedAt).toISOString(), now)}</span>}
            <Button onClick={refresh} disabled={overview.loading}>
              <RefreshCw className={cx("size-4", overview.loading && "animate-spin")} /> Refresh
            </Button>
          </>
        )
      }
    />
  );

  if (profile.error && !profile.data) {
    return (
      <>
        {header}
        <ErrorState title="Couldn't check your account" error={profile.error} onRetry={profile.reload} />
      </>
    );
  }
  if (!profile.data) return <LoadingState slow={profile.slow} label="Checking your account…" />;
  if (!admin || isNotAdmin(overview.error)) {
    return (
      <>
        {header}
        <NotAdmin />
      </>
    );
  }
  if (overview.error && !overview.data) {
    return (
      <>
        {header}
        <ErrorState title="Couldn't load the admin overview" error={overview.error} onRetry={refresh} />
      </>
    );
  }
  if (!overview.data) return <LoadingState slow={overview.slow} label="Loading the admin overview…" />;

  const o = overview.data;
  const h = o.health;
  return (
    <>
      {header}
      <div className="space-y-8">
        {overview.error && <InlineError error={overview.error} message="Couldn't refresh. Showing the last loaded figures." onRetry={refresh} />}

        <Section title="Service">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            <Stat label="Version" value={o.service.version} />
            <Stat label="Commit" value={<span className="font-mono">{o.service.commit ?? "—"}</span>} />
            <Stat label="Database" value={o.service.database} />
            <Stat label="Storage" value={o.service.storage ? "On" : "Off"} tone={o.service.storage ? "ok" : "faint"} />
            <Stat label="Telegram" value={o.service.telegram ? "On" : "Off"} tone={o.service.telegram ? "ok" : "faint"} />
            <Stat label="Uptime" value={uptime(h.uptimeSeconds)} hint={<span title={fullDate(h.startedAt)}>since {clockTime(h.startedAt, now)}</span>} />
            <Stat label="Memory" value={`${num(h.memoryMb)} MB`} />
          </div>
        </Section>

        <div className="grid gap-8 lg:grid-cols-2">
          <Section title="Traffic since start">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Requests" value={num(h.requests)} />
              <Stat label="Client errors (4xx)" value={num(h.clientErrors)} tone={h.clientErrors > 0 ? "warn" : undefined} />
              <Stat label="Server errors (5xx)" value={num(h.serverErrors)} tone={h.serverErrors > 0 ? "err" : "ok"} />
            </div>
          </Section>
          <Section title="Live streams">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Open streams" value={num(o.realtime.streams)} tone={o.realtime.streams > 0 ? "ok" : undefined} />
              <Stat label="Devices" value={num(o.realtime.devices)} />
              <Stat label="Web" value={num(o.realtime.web)} />
            </div>
          </Section>
        </div>

        <Section title="Users">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total" value={num(o.users.total)} />
              <Stat label="New today" value={num(o.users.new24h)} hint="last 24 h" tone={o.users.new24h > 0 ? "ok" : undefined} />
              <Stat label="New this week" value={num(o.users.new7d)} hint="last 7 days" />
              <Stat label="Active" value={num(o.users.active24h)} hint="last 24 h" />
            </div>
            <Breakdown title="By sign-in method" counts={o.users.byProvider} label={providerLabel} empty="No users yet." />
          </div>
        </Section>

        <Section title="Devices">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="PCs" value={num(o.devices.desktops)} hint={`${num(o.devices.desktopsOnline)} online`} tone={o.devices.desktopsOnline > 0 ? "ok" : undefined} />
              <Stat label="Phones" value={num(o.devices.phones)} />
              <Stat label="Revoked" value={num(o.devices.revoked)} tone="faint" />
            </div>
            <Breakdown
              title="BambooKit Desktop versions"
              counts={o.devices.desktopVersions}
              label={(v) => (v === "unknown" ? "Unknown" : `v${v}`)}
              empty="No PCs signed in."
            />
          </div>
        </Section>

        <Section title="Activity">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat label="Sessions" value={num(o.sessions.total)} hint={`${num(o.sessions.updated24h)} updated in 24 h`} />
            <Stat label="Working now" value={num(o.sessions.working)} tone={o.sessions.working > 0 ? "ok" : undefined} />
            <Stat label="Projects" value={num(o.projects.total)} />
            <Stat label="Pending approvals" value={num(o.approvals.pending)} tone={o.approvals.pending > 0 ? "warn" : undefined} />
            <Stat
              label="Work, last 7 days"
              value={formatDuration(o.work.last7dMs) || "0 s"}
              hint={`${plural(o.work.tasks7d, "task")}${o.work.failed7d ? `, ${num(o.work.failed7d)} failed` : ""}`}
            />
          </div>
        </Section>

        <Section title="Recent server errors">
          <ErrorsTable overview={o} now={now} />
        </Section>

        <Section title="Users, newest first">
          <UsersTable enabled={admin} refreshKey={refreshKey} now={now} />
        </Section>
      </div>
    </>
  );
}
