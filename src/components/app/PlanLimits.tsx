"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { ButtonLink, cx } from "@/components/ui";
import { quotaOf, resetTimeLabel, usePlan, type Quota, type QuotaMetric } from "@/lib/plan";

/** Remaining-today counts are shown from this many left in the warning colour. */
export const LOW_QUOTA = 3;

/** The free allowance for `metric`, or null when the plan isn't loaded, is Pro or is unlimited. */
export function useFreeQuota(metric: QuotaMetric): (Quota & { max: number; left: number }) | null {
  const { plan } = usePlan();
  if (!plan || plan.plan !== "free") return null;
  const q = quotaOf(plan, metric);
  if (!q || q.max === null || q.left === null) return null;
  return { ...q, max: q.max, left: q.left };
}

/** Header chip: "Free" + Upgrade for free accounts, a small "Pro" badge otherwise. */
export function PlanChip() {
  const { plan } = usePlan();
  if (!plan) return null;
  if (plan.plan !== "free") {
    return (
      <Link
        href="/account/#plan"
        title="Your plan"
        className="inline-flex items-center gap-1 rounded-full border border-bk-ok/40 bg-bk-ok/10 px-2 py-0.5 text-[11px] font-medium text-bk-ok hover:bg-bk-ok/15"
      >
        <Sparkles className="size-3" /> Pro
      </Link>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Link
        href="/account/#plan"
        title="Free plan: see today's usage"
        className="inline-flex items-center rounded-full border border-bk-line bg-bk-raised px-2 py-0.5 text-[11px] font-medium text-bk-muted hover:text-bk-fg"
      >
        Free
      </Link>
      <Link href="/pricing/" className="hidden items-center gap-1 text-xs font-medium text-bk-fg underline-offset-2 hover:underline sm:inline-flex">
        <Sparkles className="size-3.5" /> Upgrade
      </Link>
    </span>
  );
}

/** "N of M free messages left today" (or "N of M left today" without a noun; warning colour when few are left). Renders nothing on Pro. */
export function QuotaNote({ metric, noun, className }: { metric: QuotaMetric; noun?: string; className?: string }) {
  const q = useFreeQuota(metric);
  if (!q || q.left === 0) return null;
  return (
    <span className={cx("text-xs tabular-nums", q.left <= LOW_QUOTA ? "text-bk-warn" : "text-bk-faint", className)}>
      {q.left} of {q.max} {noun ? `free ${noun} ` : ""}left today
    </span>
  );
}

/** Daily limit reached: when it resets and an Upgrade button. */
export function LimitReached({ resetsAt, children, className }: { resetsAt: string | null | undefined; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-bk-warn/40 bg-bk-warn/10 px-3 py-2.5 text-sm", className)} role="status">
      <Lock className="size-4 shrink-0 text-bk-warn" />
      <div className="min-w-0 flex-1 text-bk-warn">
        Daily limit reached — resets at {resetTimeLabel(resetsAt)}.
        {children && <span className="mt-0.5 block text-xs text-bk-muted">{children}</span>}
      </div>
      <ButtonLink href="/pricing/" variant="primary" className="px-3 py-1.5 text-xs">
        <Sparkles className="size-3.5" /> Upgrade
      </ButtonLink>
    </div>
  );
}
