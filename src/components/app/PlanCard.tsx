"use client";

import { Lock, Sparkles } from "lucide-react";
import { ButtonLink, Card, Pill, Spinner } from "@/components/ui";
import { InlineError } from "@/components/ErrorInfo";
import { useResource } from "@/lib/api";
import { useRealtime } from "@/lib/realtime";
import { fullDate } from "@/lib/format";
import { formatMoney, limitLabel, productLabel, sourceLabel, type BillingOrder, type OrderStatus } from "@/lib/billing";
import { usePlan } from "@/lib/plan";

const STATUS_TONE: Record<OrderStatus, "ok" | "warn" | "err" | "neutral"> = {
  PAID: "ok",
  PENDING: "warn",
  FAILED: "err",
  EXPIRED: "neutral",
};

const STATUS_LABEL: Record<OrderStatus, string> = { PAID: "Paid", PENDING: "Pending", FAILED: "Failed", EXPIRED: "Expired" };

function longDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : new Date(t).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function Usage({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="rounded-lg border border-bk-line bg-bk-bg px-3 py-2.5">
      <div className="text-xs text-bk-faint">{label}</div>
      <div className="mt-0.5 text-sm tabular-nums text-bk-fg">
        {used}
        <span className="text-bk-muted"> / {limit === null ? "unlimited" : limit}</span>
      </div>
      {limit !== null && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bk-raised" aria-hidden="true">
          <div className={pct >= 100 ? "h-full bg-bk-warn" : "h-full bg-bk-ok"} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

/** What Pro unlocks, listed with lock icons for free accounts. */
const WITH_PRO = ["Unlimited chat from phone & web", "Unlimited new sessions", "Up to 5 PCs", "No ads in the Android app"];

/** Account → Plan: current plan, today's usage and billing history. Updates live on plan.updated. */
export function PlanCard() {
  const plan = usePlan();
  const history = useResource<BillingOrder[]>("/v1/billing/history");

  useRealtime((e) => {
    if (e.type === "plan.updated" || (e.type === "ready" && e.payload?.reconnect)) history.reload();
  });

  const p = plan.plan;
  const pro = p?.plan === "pro";
  const orders = history.data ?? [];

  return (
    <section id="plan" className="scroll-mt-20">
      <h2 className="mb-1 font-medium text-bk-fg">Plan</h2>
      <p className="mb-3 text-sm text-bk-muted">Your BambooKit plan, today&apos;s phone and web usage and your payments.</p>
      <Card className="p-4 sm:p-5">
        {!p && plan.loading && (
          <div className="flex items-center gap-2 text-sm text-bk-muted">
            <Spinner /> Loading your plan…
          </div>
        )}
        {!p && plan.error && <InlineError error={plan.error} message="Couldn't load your plan." onRetry={plan.reload} />}
        {p && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={pro ? "ok" : "neutral"} className="text-xs">
                    {pro && <Sparkles className="size-3" />} {pro ? "Pro" : "Free"}
                  </Pill>
                  {pro && p.source && <span className="text-xs text-bk-faint">{sourceLabel(p.source)}</span>}
                </div>
                <p className="mt-2 text-sm text-bk-muted">
                  {pro
                    ? p.proUntil
                      ? <>Pro until <span className="text-bk-fg" title={fullDate(p.proUntil)}>{longDate(p.proUntil)}</span>.</>
                      : "Pro is active."
                    : `Free plan: ${limitLabel(p.limits.phoneMessagesPerDay, "messages")} and ${limitLabel(p.limits.phoneSessionsPerDay, "new sessions")} a day from your phone and this website, ${p.limits.desktops === 1 ? "one PC" : `${p.limits.desktops} PCs`}.`}
                </p>
              </div>
              <ButtonLink href="/pricing/" variant={pro ? "secondary" : "primary"} className="px-3 py-1.5 text-xs">
                <Sparkles className="size-3.5" /> {pro ? "Extend Pro" : "Upgrade to Pro"}
              </ButtonLink>
            </div>

            {!pro && (
              <div className="mt-4 rounded-lg border border-bk-line bg-bk-bg px-3 py-2.5">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-bk-fg">
                  <Sparkles className="size-3.5" /> With Pro
                </div>
                <ul className="grid gap-1 text-sm text-bk-muted sm:grid-cols-2">
                  {WITH_PRO.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Lock className="size-3.5 shrink-0 text-bk-faint" aria-label="Locked on Free" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Usage label="Phone & web messages today" used={p.usage.phoneMessagesToday} limit={p.limits.phoneMessagesPerDay} />
              <Usage label="New sessions from phone & web today" used={p.usage.phoneSessionsToday} limit={p.limits.phoneSessionsPerDay} />
              <Usage label="PCs" used={p.usage.desktops} limit={p.limits.desktops} />
            </div>
            <p className="mt-2 text-xs text-bk-faint">
              {p.resetsAt ? <>Daily limits reset {fullDate(p.resetsAt)}. </> : null}
              {p.ads ? `On Android, watch a short ad for ${p.rewards.hours} h of Pro (${p.rewards.todayCount} of ${p.rewards.maxPerDay} used today).` : "No ads in the Android app."}
            </p>
          </>
        )}

        <div className="mt-5 border-t border-bk-line pt-4">
          <h3 className="text-sm font-medium text-bk-fg">Billing history</h3>
          {history.error && !history.data && <InlineError className="mt-2" error={history.error} message="Couldn't load your payments." onRetry={history.reload} />}
          {!history.error && !history.data && history.loading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-bk-muted">
              <Spinner /> Loading…
            </div>
          )}
          {history.data && orders.length === 0 && <p className="mt-1 text-sm text-bk-faint">No payments yet.</p>}
          {orders.length > 0 && (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead>
                  <tr className="border-b border-bk-line text-left text-xs text-bk-faint">
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">Product</th>
                    <th className="py-2 pr-3 font-medium">Amount</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-bk-line last:border-0" title={`Order ${o.id}`}>
                      <td className="py-2 pr-3 text-bk-muted">{longDate(o.paidAt ?? o.createdAt)}</td>
                      <td className="py-2 pr-3 text-bk-fg">{productLabel(o.productId)}</td>
                      <td className="py-2 pr-3 tabular-nums text-bk-fg">{formatMoney(o.amount, o.currency)}</td>
                      <td className="py-2">
                        <Pill tone={STATUS_TONE[o.status] ?? "neutral"}>{STATUS_LABEL[o.status] ?? o.status}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
