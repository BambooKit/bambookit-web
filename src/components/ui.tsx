import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { CircleAlert, LoaderCircle, RefreshCw } from "lucide-react";
import type { SessionStatus } from "@/lib/types";
import { ErrorInfo } from "./ErrorInfo";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-bk-accent text-bk-bg hover:opacity-90 disabled:opacity-50",
  secondary: "border border-bk-line bg-bk-panel text-bk-fg hover:bg-bk-raised disabled:opacity-50",
  ghost: "text-bk-muted hover:bg-bk-raised hover:text-bk-fg disabled:opacity-50",
};

const BASE = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed";

export function Button({ variant = "secondary", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" {...props} className={cx(BASE, VARIANTS[variant], className)} />;
}

export function ButtonLink({ variant = "secondary", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={cx(BASE, VARIANTS[variant], className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cx("size-4 animate-spin", className)} aria-hidden="true" />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-xl border border-bk-line bg-bk-panel", className)}>{children}</div>;
}

/** Green/grey presence dot. */
export function OnlineDot({ online, className }: { online: boolean; className?: string }) {
  return (
    <span className={cx("relative inline-flex size-2 shrink-0", className)} aria-label={online ? "online" : "offline"}>
      {online && <span className="absolute inline-flex size-full animate-ping rounded-full bg-bk-ok opacity-50" />}
      <span className={cx("relative inline-flex size-2 rounded-full", online ? "bg-bk-ok" : "bg-bk-faint")} />
    </span>
  );
}

const STATUS: Record<SessionStatus, { label: string; cls: string }> = {
  busy: { label: "Working", cls: "border-bk-ok/40 bg-bk-ok/10 text-bk-ok" },
  retry: { label: "Retrying", cls: "border-bk-warn/40 bg-bk-warn/10 text-bk-warn" },
  error: { label: "Error", cls: "border-bk-err/40 bg-bk-err/10 text-bk-err" },
  idle: { label: "Idle", cls: "border-bk-line bg-bk-raised text-bk-muted" },
};

export function statusLabel(status: SessionStatus): string {
  return (STATUS[status] ?? STATUS.idle).label;
}

export function StatusBadge({ status }: { status: SessionStatus }) {
  const s = STATUS[status] ?? STATUS.idle;
  return (
    <span className={cx("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", s.cls)}>
      {status === "busy" && <span className="size-1.5 animate-pulse rounded-full bg-bk-ok" />}
      {s.label}
    </span>
  );
}

export function Pill({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "warn" | "ok" | "err"; className?: string }) {
  const tones = {
    neutral: "border-bk-line bg-bk-raised text-bk-muted",
    warn: "border-bk-warn/40 bg-bk-warn/10 text-bk-warn",
    ok: "border-bk-ok/40 bg-bk-ok/10 text-bk-ok",
    err: "border-bk-err/40 bg-bk-err/10 text-bk-err",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", tones[tone], className)}>{children}</span>;
}

export function Changes({ additions, deletions, files }: { additions: number; deletions: number; files?: number }) {
  if (!additions && !deletions && !files) return null;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums">
      <span className="text-bk-ok">+{additions}</span>
      <span className="text-bk-err">−{deletions}</span>
      {files !== undefined && <span className="text-bk-faint">· {files} file{files === 1 ? "" : "s"}</span>}
    </span>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-bk-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-bk-line px-6 py-12 text-center">
      {icon && <div className="mb-3 text-bk-faint">{icon}</div>}
      <h3 className="font-medium text-bk-fg">{title}</h3>
      {children && <div className="mt-1 max-w-md text-sm text-bk-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/**
 * A failed load. Pass the error itself (ApiError or anything thrown) as `error` so the ⓘ details can
 * explain it; `message` defaults to the error's message.
 */
export function ErrorState({
  title = "Couldn't load this",
  message,
  error,
  onRetry,
  icon,
}: {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  icon?: ReactNode;
}) {
  const text = message ?? (error instanceof Error ? error.message : typeof error === "string" ? error : "Something went wrong.");
  return (
    <div className="flex flex-col items-center rounded-xl border border-bk-line bg-bk-panel px-6 py-10 text-center">
      <div className="mb-3 text-bk-warn">{icon ?? <CircleAlert className="size-6" />}</div>
      <h3 className="font-medium text-bk-fg">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-bk-muted">{text}</p>
      {onRetry && (
        <Button className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" /> Retry
        </Button>
      )}
      <ErrorInfo error={error ?? text} onRetry={onRetry} className="mt-4 max-w-lg" />
    </div>
  );
}

export function LoadingState({ slow, label = "Loading…" }: { slow?: boolean; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-bk-muted">
      <Spinner className="size-5" />
      <span>{label}</span>
      {slow && <span className="max-w-xs text-center text-xs text-bk-faint">The BambooKit service is waking up. This can take up to a minute after a quiet period.</span>}
    </div>
  );
}

export function Notice({ tone = "neutral", icon, children, className }: { tone?: "neutral" | "warn" | "err" | "ok"; icon?: ReactNode; children: ReactNode; className?: string }) {
  const tones = {
    neutral: "border-bk-line bg-bk-panel text-bk-muted",
    warn: "border-bk-warn/30 bg-bk-warn/5 text-bk-warn",
    err: "border-bk-err/30 bg-bk-err/5 text-bk-err",
    ok: "border-bk-ok/30 bg-bk-ok/5 text-bk-ok",
  };
  return (
    <div className={cx("flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm", tones[tone], className)}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
