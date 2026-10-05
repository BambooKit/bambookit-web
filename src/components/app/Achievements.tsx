"use client";

import { useMemo, useState } from "react";
import { cx } from "@/components/ui";
import { fullDate } from "@/lib/format";
import type { Achievement, AchievementSummary, AchievementTier, AchievementTierName } from "@/lib/types";

const TIER_ORDER: AchievementTierName[] = ["bronze", "silver", "gold", "platinum", "diamond"];
const TIER_LABEL: Record<AchievementTierName, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum", diamond: "Diamond" };
const TIER_MEDAL: Record<AchievementTierName, string> = { bronze: "🥉", silver: "🥈", gold: "🥇", platinum: "💎", diamond: "💠" };
const TIER_POINTS: Record<AchievementTierName, number> = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };

const full = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

/** 1,240 / 10,000 below 100,000; 250K / 1.2M above. Hours may carry one decimal. */
export function formatCount(v: number): string {
  const x = Number(v) || 0;
  return Math.abs(x) >= 100_000 ? compact.format(x) : full.format(x);
}

/** Coding time on old APIs ("ms" unit) as "12 h 5 min". */
function msLabel(ms: number): string {
  const minutes = Math.floor((Number(ms) || 0) / 60_000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? (m ? `${full.format(h)} h ${m} min` : `${full.format(h)} h`) : `${m} min`;
}

/** "1,240 / 10,000 lines" (unit omitted for the old "count" unit; old "ms" shown as durations). */
function amount(value: number, target: number, unit: string): string {
  if (unit === "ms") return `${msLabel(value)} / ${msLabel(target)}`;
  const u = unit && unit !== "count" ? ` ${unit}` : "";
  return `${formatCount(value)} / ${formatCount(target)}${u}`;
}

function thresholdLabel(threshold: number, unit: string): string {
  if (unit === "ms") return msLabel(threshold);
  return unit && unit !== "count" ? `${formatCount(threshold)} ${unit}` : formatCount(threshold);
}

const dateOnly = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
};

/** The achievement as the tiered UI sees it, whatever shape the API sent. */
interface View {
  a: Achievement;
  emoji: string;
  trackable: boolean;
  value: number;
  tiers: AchievementTier[] | null;
  tier: AchievementTierName | null;
  next: AchievementTierName | null;
  progress: number;
  target: number;
  unlocked: boolean;
}

function view(a: Achievement): View {
  const tiers = Array.isArray(a.tiers) && a.tiers.length ? a.tiers : null;
  const trackable = a.trackable !== false;
  const value = Number(a.value ?? a.progress) || 0;
  let tier: AchievementTierName | null = a.tier ?? null;
  let next: AchievementTierName | null = a.nextTier ?? null;
  if (tiers) {
    const reached = tiers.filter((t) => t.unlocked);
    if (a.tier === undefined) tier = reached.length ? reached[reached.length - 1].name : null;
    if (a.nextTier === undefined) next = tiers.find((t) => !t.unlocked)?.name ?? null;
  }
  return {
    a,
    emoji: a.emoji || "🏆",
    trackable,
    value,
    tiers,
    tier,
    next,
    progress: Number(a.progress) || 0,
    target: Number(a.target) || 0,
    unlocked: tiers ? tier !== null : !!a.unlocked,
  };
}

const maxed = (v: View) => (v.tiers ? v.next === null && v.tier !== null : v.unlocked);
const ratio = (v: View) => (v.target > 0 ? Math.min(1, v.progress / v.target) : 0);
const rank = (v: View) => (v.tier ? TIER_ORDER.indexOf(v.tier) + 1 : v.unlocked ? 1 : 0);

type Filter = "all" | "unlocked" | "progress" | "untracked";
const FILTERS: Array<{ id: Filter; label: string; test: (v: View) => boolean }> = [
  { id: "all", label: "All", test: () => true },
  { id: "unlocked", label: "Unlocked", test: (v) => v.unlocked },
  { id: "progress", label: "In progress", test: (v) => v.trackable && !maxed(v) && v.progress > 0 },
  { id: "untracked", label: "Not tracked", test: (v) => !v.trackable },
];

/** Summary from the API, or computed from the list for APIs that do not send one. */
function summarize(views: View[], given: AchievementSummary | undefined, streak: { current: number; longest: number } | undefined): AchievementSummary {
  if (given) return given;
  let tiersUnlocked = 0, points = 0, tiersTotal = 0;
  for (const v of views) {
    if (v.tiers) {
      tiersTotal += v.tiers.length;
      for (const t of v.tiers) if (t.unlocked) {
        tiersUnlocked++;
        points += TIER_POINTS[t.name] ?? 0;
      }
    } else {
      tiersTotal++;
      if (v.unlocked) {
        tiersUnlocked++;
        points++;
      }
    }
  }
  return {
    unlocked: views.filter((v) => v.unlocked).length,
    total: views.length,
    tiersUnlocked,
    tiersTotal,
    points,
    currentStreak: streak?.current ?? 0,
    longestStreak: streak?.longest ?? 0,
  };
}

function SummaryTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-bk-line bg-bk-bg/40 px-3 py-2.5">
      <div className="truncate text-xs text-bk-muted">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-bk-fg">{value}</div>
      {sub && <div className="truncate text-[11px] text-bk-faint">{sub}</div>}
    </div>
  );
}

/** Five dots, one per tier, with a hover/focus tooltip listing every threshold and unlock date. */
function TierDots({ v }: { v: View }) {
  const tiers = v.tiers!;
  const unit = v.a.unit;
  const label = `${v.a.title} tiers`;
  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-bk-muted"
        aria-label={`${label}: ${tiers.map((t) => `${TIER_LABEL[t.name]} ${thresholdLabel(t.threshold, unit)}${t.unlocked ? " unlocked" : ""}`).join(", ")}`}
      >
        {tiers.map((t) => (
          <span
            key={t.name}
            className={cx(
              "size-2 rounded-full border",
              t.unlocked ? "border-bk-ok bg-bk-ok" : v.trackable && t.name === v.next ? "border-bk-muted bg-transparent" : "border-bk-line bg-bk-raised",
            )}
          />
        ))}
      </button>
      <div
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full right-0 z-20 mb-1 w-60 rounded-lg border border-bk-line bg-bk-panel p-2.5 text-left opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        <div className="mb-1.5 text-[11px] font-medium text-bk-muted">{label}</div>
        <ul className="space-y-1">
          {tiers.map((t) => (
            <li key={t.name} className="flex items-center justify-between gap-2 text-[11px]">
              <span className={cx("inline-flex items-center gap-1.5", t.unlocked ? "text-bk-fg" : "text-bk-faint")}>
                <span aria-hidden>{TIER_MEDAL[t.name]}</span>
                {TIER_LABEL[t.name]} · {thresholdLabel(t.threshold, unit)}
              </span>
              <span className={cx("shrink-0 tabular-nums", t.unlocked ? "text-bk-ok" : "text-bk-faint")} title={t.unlockedAt ? fullDate(t.unlockedAt) : undefined}>
                {t.unlocked ? (t.unlockedAt ? dateOnly(t.unlockedAt) : "Unlocked") : "Locked"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AchievementCard({ v }: { v: View }) {
  const { a } = v;
  const done = maxed(v);
  const pct = done ? 100 : Math.round(ratio(v) * 100);
  return (
    <li
      className={cx(
        "flex min-w-0 flex-col rounded-lg border px-3 py-2.5",
        !v.trackable ? "border-dashed border-bk-line bg-bk-bg/20 opacity-60" : v.unlocked ? "border-bk-ok/40 bg-bk-ok/5" : "border-bk-line bg-bk-bg/40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className={cx("shrink-0 text-2xl leading-none", !v.unlocked && "grayscale")} aria-hidden>
          {v.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className={cx("text-sm font-medium", v.unlocked ? "text-bk-fg" : "text-bk-muted")}>{a.title}</span>
            {v.tier ? (
              <span className="shrink-0 text-[11px] font-medium text-bk-ok" title={`Current tier: ${TIER_LABEL[v.tier]}`}>
                <span aria-hidden>{TIER_MEDAL[v.tier]}</span> {TIER_LABEL[v.tier]}
              </span>
            ) : !v.tiers && v.unlocked ? (
              <span className="shrink-0 text-[11px] font-medium text-bk-ok">Unlocked</span>
            ) : !v.trackable ? (
              <span className="shrink-0 rounded-full border border-bk-line px-1.5 text-[10px] text-bk-faint">Not tracked</span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-bk-faint">{a.description}</p>
        </div>
      </div>

      <div className="mt-auto pt-2.5">
        {!v.trackable ? (
          <p className="text-[11px] text-bk-faint">{a.reason || "Not tracked yet."}</p>
        ) : (
          <>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-bk-raised"
              role="progressbar"
              aria-label={`${a.title} progress`}
              aria-valuemin={0}
              aria-valuemax={v.target}
              aria-valuenow={Math.min(v.progress, v.target)}
            >
              <div className={cx("h-full rounded-full", v.unlocked ? "bg-bk-ok" : "bg-bk-muted")} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[11px] tabular-nums text-bk-faint">
                {done && v.tiers
                  ? `${formatCount(v.value)} ${a.unit} · all tiers unlocked`
                  : `${amount(v.progress, v.target, a.unit)}${v.next ? ` → ${TIER_LABEL[v.next]}` : ""}`}
              </span>
              {v.tiers ? (
                <TierDots v={v} />
              ) : (
                v.unlocked &&
                a.unlockedAt && (
                  <span className="shrink-0 text-[11px] text-bk-ok" title={fullDate(a.unlockedAt)}>
                    {dateOnly(a.unlockedAt)}
                  </span>
                )
              )}
            </div>
          </>
        )}
        {!v.trackable && v.tiers && (
          <div className="mt-1 flex justify-end">
            <TierDots v={v} />
          </div>
        )}
      </div>
    </li>
  );
}

/** Tiered achievements with a summary header and filters; also renders the older flat shape. */
export function Achievements({
  achievements,
  summary,
  streak,
}: {
  achievements: Achievement[];
  summary?: AchievementSummary;
  streak?: { current: number; longest: number };
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const views = useMemo(
    () =>
      achievements
        .map(view)
        .sort((x, y) => Number(y.trackable) - Number(x.trackable) || rank(y) - rank(x) || ratio(y) - ratio(x)),
    [achievements],
  );
  const s = summarize(views, summary, streak);
  const active = FILTERS.find((f) => f.id === filter)!;
  const shown = views.filter(active.test);

  if (achievements.length === 0) return <p className="text-sm text-bk-faint">No achievements are available yet.</p>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryTile label="Achievements" value={`${formatCount(s.unlocked)} of ${formatCount(s.total)}`} sub="at Bronze or better" />
        <SummaryTile label="Tiers" value={`${formatCount(s.tiersUnlocked)} of ${formatCount(s.tiersTotal)}`} sub="Bronze to Diamond" />
        <SummaryTile label="Points" value={formatCount(s.points)} sub="1 per Bronze … 5 per Diamond" />
        <SummaryTile label="🔥 Streak" value={`${formatCount(s.currentStreak)} ${s.currentStreak === 1 ? "day" : "days"}`} sub={`Best ${formatCount(s.longestStreak)} ${s.longestStreak === 1 ? "day" : "days"}`} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter achievements">
        {FILTERS.map((f) => {
          const count = views.filter(f.test).length;
          const on = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f.id)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                on ? "border-bk-muted bg-bk-raised text-bk-fg" : "border-bk-line text-bk-muted hover:bg-bk-raised hover:text-bk-fg",
              )}
            >
              {f.label}
              <span className="tabular-nums text-bk-faint">{count}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="mt-3 text-sm text-bk-faint">
          {filter === "unlocked" ? "Nothing unlocked yet. Keep coding with BambooKit." : filter === "progress" ? "No achievements in progress." : "Every achievement is tracked."}
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((v) => (
            <AchievementCard key={v.a.id} v={v} />
          ))}
        </ul>
      )}
    </div>
  );
}
