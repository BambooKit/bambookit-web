"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { ApiError, useResource } from "./api";
import { useRealtime } from "./realtime";
import type { MyPlan } from "./billing";

/**
 * The signed-in account's plan (GET /v1/me/plan), shared by the header chip, the chat composer, the
 * New session button and the Account page. Kept current by 'plan.updated', by an optimistic +1 after
 * each successful send or new session (then reconciled with the API), and by a refetch when the
 * daily limits reset.
 */

export type QuotaMetric = "messages" | "sessions";

/** Details of a 402 PLAN_LIMIT error. */
export interface PlanLimitDetails {
  limit: string;
  max: number;
  used: number;
  resetsAt: string | null;
  upgradeUrl: string | null;
}

export interface Quota {
  /** null means unlimited. */
  max: number | null;
  used: number;
  /** null means unlimited. */
  left: number | null;
}

interface PlanValue {
  plan: MyPlan | undefined;
  error: ApiError | null;
  loading: boolean;
  reload: () => void;
  /** Count one successful send or new session now; the API's numbers replace it shortly after. */
  bump: (metric: QuotaMetric) => void;
  /** Apply a 402 PLAN_LIMIT error (marks the allowance as used up). Returns its details, or null if it isn't one. */
  applyLimit: (err: unknown) => PlanLimitDetails | null;
}

const PlanContext = createContext<PlanValue | null>(null);

const USAGE_KEY: Record<QuotaMetric, "phoneMessagesToday" | "phoneSessionsToday"> = { messages: "phoneMessagesToday", sessions: "phoneSessionsToday" };
const LIMIT_KEY: Record<QuotaMetric, "phoneMessagesPerDay" | "phoneSessionsPerDay"> = { messages: "phoneMessagesPerDay", sessions: "phoneSessionsPerDay" };
const METRIC_OF_LIMIT: Record<string, QuotaMetric> = { phoneMessagesPerDay: "messages", phoneSessionsPerDay: "sessions" };

/** How long after a send to refetch the real usage. */
const RECONCILE_MS = 1500;

export function planLimitOf(err: unknown): PlanLimitDetails | null {
  if (!(err instanceof ApiError) || err.code !== "PLAN_LIMIT") return null;
  const d = (err.details && typeof err.details === "object" ? err.details : {}) as Record<string, unknown>;
  return {
    limit: typeof d.limit === "string" ? d.limit : "",
    max: typeof d.max === "number" ? d.max : 0,
    used: typeof d.used === "number" ? d.used : typeof d.max === "number" ? d.max : 0,
    resetsAt: typeof d.resetsAt === "string" ? d.resetsAt : null,
    upgradeUrl: typeof d.upgradeUrl === "string" ? d.upgradeUrl : null,
  };
}

export function quotaOf(plan: MyPlan | undefined, metric: QuotaMetric): Quota | null {
  if (!plan) return null;
  const max = plan.limits?.[LIMIT_KEY[metric]] ?? null;
  const used = plan.usage?.[USAGE_KEY[metric]] ?? 0;
  return { max, used, left: max === null ? null : Math.max(0, max - used) };
}

/** "12:00 AM", or "12:00 AM tomorrow" / "Mon 12:00 AM" when the reset isn't today, in the viewer's time zone. */
export function resetTimeLabel(iso: string | null | undefined): string {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return "midnight";
  const at = new Date(t);
  const time = at.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const today = new Date();
  if (at.toDateString() === today.toDateString()) return time;
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (at.toDateString() === tomorrow.toDateString()) return `${time} tomorrow`;
  return `${at.toLocaleDateString(undefined, { weekday: "short" })} ${time}`;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const res = useResource<MyPlan>("/v1/me/plan");
  const { data, error, loading, reload, setData } = res;
  const reconcileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useRealtime((e) => {
    if (e.type === "plan.updated") {
      if (e.payload && typeof e.payload === "object" && "plan" in e.payload) setData(e.payload as MyPlan);
      else reload();
    } else if (e.type === "ready" && e.payload?.reconnect) reload();
  });

  const reconcile = useCallback(() => {
    if (reconcileTimer.current) clearTimeout(reconcileTimer.current);
    reconcileTimer.current = setTimeout(() => {
      reconcileTimer.current = null;
      reload();
    }, RECONCILE_MS);
  }, [reload]);
  useEffect(
    () => () => {
      if (reconcileTimer.current) clearTimeout(reconcileTimer.current);
    },
    [],
  );

  // Refetch when the daily limits reset (setTimeout can't wait longer than ~24.8 days; resets are daily).
  const resetsAt = data?.resetsAt;
  useEffect(() => {
    const t = resetsAt ? Date.parse(resetsAt) : NaN;
    if (Number.isNaN(t)) return;
    const wait = Math.min(Math.max(t - Date.now(), 0) + 2000, 2 ** 31 - 1);
    const timer = setTimeout(reload, wait);
    return () => clearTimeout(timer);
  }, [resetsAt, reload]);

  const bump = useCallback(
    (metric: QuotaMetric) => {
      const key = USAGE_KEY[metric];
      setData((p) => (p ? { ...p, usage: { ...p.usage, [key]: (p.usage?.[key] ?? 0) + 1 } } : p));
      reconcile();
    },
    [setData, reconcile],
  );

  const applyLimit = useCallback(
    (err: unknown) => {
      const d = planLimitOf(err);
      if (!d) return null;
      const metric = METRIC_OF_LIMIT[d.limit];
      if (metric) {
        setData((p) =>
          p
            ? {
                ...p,
                limits: { ...p.limits, [LIMIT_KEY[metric]]: d.max },
                usage: { ...p.usage, [USAGE_KEY[metric]]: Math.max(d.used, d.max) },
                resetsAt: d.resetsAt ?? p.resetsAt,
              }
            : p,
        );
      }
      reconcile();
      return d;
    },
    [setData, reconcile],
  );

  const value = useMemo<PlanValue>(() => ({ plan: data, error, loading, reload, bump, applyLimit }), [data, error, loading, reload, bump, applyLimit]);
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider (the signed-in app shell).");
  return ctx;
}
