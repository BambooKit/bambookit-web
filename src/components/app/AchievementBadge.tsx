import {
  Award,
  BadgeCheck,
  BookOpen,
  Bot,
  BotMessageSquare,
  Bug,
  BugPlay,
  BrushCleaning,
  CircleCheckBig,
  CloudUpload,
  CodeXml,
  Crosshair,
  Crown,
  Eraser,
  FileMinus,
  FilePlus,
  Files,
  Flame,
  FlaskConical,
  FolderKanban,
  Gauge,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  GitPullRequest,
  Globe,
  Hammer,
  Handshake,
  Hourglass,
  LockKeyhole,
  MessageSquareText,
  MoonStar,
  Package,
  PencilLine,
  Plug,
  Puzzle,
  RefreshCw,
  Rocket,
  ScanEye,
  ShieldCheck,
  Siren,
  Smartphone,
  SquareTerminal,
  Star,
  TestTubeDiagonal,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cx } from "@/components/ui";
import type { AchievementTierName } from "@/lib/types";

/** Shared BambooKit achievement icon mapping (same ids as the API's stats module). */
const ICONS: Record<string, LucideIcon> = {
  "coding-streak": Flame,
  "code-written": CodeXml,
  "code-changes": PencilLine,
  "files-changed": Files,
  "projects-built": Hammer,
  "ai-sessions": Bot,
  "prompts-sent": MessageSquareText,
  "tasks-completed": CircleCheckBig,
  "bugs-fixed": Bug,
  "bug-hunter": BugPlay,
  "tests-run": FlaskConical,
  "tests-passed": BadgeCheck,
  deployments: Rocket,
  "cloud-builder": CloudUpload,
  commits: GitCommitHorizontal,
  "branches-created": GitBranch,
  merges: GitMerge,
  approvals: ShieldCheck,
  "tool-calls": Wrench,
  "agent-tasks": BotMessageSquare,
  "multi-agent": Users,
  integrations: Puzzle,
  "mcp-tools": Plug,
  "terminal-commands": SquareTerminal,
  "packages-installed": Package,
  "long-sessions": Hourglass,
  "coding-time": Timer,
  "night-coder": MoonStar,
  "fast-fix": Zap,
  "one-shot-fix": Crosshair,
  "tasks-without-retry": Trophy,
  "successful-sessions": TrendingUp,
  "code-cleanup": BrushCleaning,
  "code-deleted": Eraser,
  "files-created": FilePlus,
  "files-deleted": FileMinus,
  refactors: RefreshCw,
  "projects-managed": FolderKanban,
  "open-source": Globe,
  "github-stars": Star,
  contributions: Handshake,
  "pull-requests": GitPullRequest,
  "production-fixes": Siren,
  "devices-connected": Smartphone,
  "secure-actions": LockKeyhole,
  "code-reviews": ScanEye,
  documentation: BookOpen,
  experiments: TestTubeDiagonal,
  "speed-builder": Gauge,
  "bambookit-master": Crown,
};

export function achievementIcon(id: string): LucideIcon {
  return ICONS[id] ?? Award;
}

/** Ring, tint and icon colour per tier (static class names so Tailwind sees them). */
const TIER_STYLE: Record<AchievementTierName, string> = {
  bronze: "border-bk-tier-bronze bg-bk-tier-bronze/12 text-bk-tier-bronze",
  silver: "border-bk-tier-silver bg-bk-tier-silver/12 text-bk-tier-silver",
  gold: "border-bk-tier-gold bg-bk-tier-gold/12 text-bk-tier-gold",
  platinum: "border-bk-tier-platinum bg-bk-tier-platinum/12 text-bk-tier-platinum",
  diamond: "bk-badge-diamond text-bk-tier-diamond",
};

/** Solid fill per tier, for medal pips and tier dots. */
export const TIER_FILL: Record<AchievementTierName, string> = {
  bronze: "bg-bk-tier-bronze",
  silver: "bg-bk-tier-silver",
  gold: "bg-bk-tier-gold",
  platinum: "bg-bk-tier-platinum",
  diamond: "bg-linear-to-br from-bk-tier-diamond to-bk-tier-platinum",
};

export type BadgeState =
  | { kind: "tier"; tier: AchievementTierName }
  | { kind: "unlocked" } // older flat API shape, no tiers
  | { kind: "locked" }
  | { kind: "untracked" }
  | { kind: "plain" }; // docs: neutral ring, no state

/**
 * Round achievement badge: 44px on cards (size "md"), 20px in docs tables (size "sm").
 * Tier: ring + soft tint in the current tier colour and a medal pip; locked: muted at 50%;
 * not tracked: dashed ring; diamond: gradient ring with a soft glow.
 */
export function AchievementBadge({
  id,
  state,
  size = "md",
  label,
  className,
}: {
  id: string;
  state: BadgeState;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const Icon = achievementIcon(id);
  const md = size === "md";
  const ring =
    state.kind === "tier"
      ? TIER_STYLE[state.tier]
      : state.kind === "unlocked"
        ? "border-bk-ok bg-bk-ok/10 text-bk-ok"
        : state.kind === "untracked"
          ? "border-dashed border-bk-faint text-bk-faint"
          : state.kind === "locked"
            ? "border-bk-line text-bk-faint opacity-50"
            : "border-bk-line bg-bk-raised text-bk-muted";
  return (
    <span
      className={cx("relative inline-flex shrink-0 align-middle", md ? "size-11" : "size-5", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className={cx("inline-flex size-full items-center justify-center rounded-full", md ? "border-2" : "border", ring)}>
        <Icon className={md ? "size-5" : "size-3"} strokeWidth={md ? 2 : 2.25} aria-hidden="true" />
      </span>
      {md && state.kind === "tier" && (
        <span className={cx("absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-bk-panel", TIER_FILL[state.tier])} aria-hidden="true" />
      )}
    </span>
  );
}
