"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import { Check, Copy, Info, LogIn, MonitorUp, RefreshCw, RotateCw, TriangleAlert } from "lucide-react";
import { loadMeta } from "@/lib/compat";
import { diagnosticsText, errorMessage, explainError, technicalRows, type ErrorAction } from "@/lib/diagnostics";
import type { ApiMeta } from "@/lib/types";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const LINK = "inline-flex items-center gap-1.5 rounded-md border border-bk-line bg-bk-panel px-2.5 py-1 text-xs text-bk-fg hover:bg-bk-raised";

function ActionButtons({ actions, onRetry }: { actions: ErrorAction[]; onRetry?: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        if (a === "retry") {
          return onRetry ? (
            <button key={a} type="button" className={LINK} onClick={onRetry}>
              <RefreshCw className="size-3.5" /> Retry
            </button>
          ) : null;
        }
        if (a === "refresh") {
          return (
            <button key={a} type="button" className={LINK} onClick={() => window.location.reload()}>
              <RotateCw className="size-3.5" /> Refresh the page
            </button>
          );
        }
        if (a === "signin") {
          return (
            <Link key={a} href="/signin/" className={LINK}>
              <LogIn className="size-3.5" /> Sign in again
            </Link>
          );
        }
        return (
          <Link key={a} href="/docs/updates/" className={LINK}>
            <MonitorUp className="size-3.5" /> How to update BambooKit Desktop
          </Link>
        );
      })}
    </div>
  );
}

/** The ⓘ panel body: what happened, why, what you can do, and copyable technical details. */
export function ErrorDiagnostics({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [copied, setCopied] = useState<"yes" | "failed" | null>(null);
  useEffect(() => {
    let alive = true;
    loadMeta()
      .then((m) => alive && setMeta(m))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const ex = explainError(error);
  const rows = technicalRows(error, meta);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(diagnosticsText(error, meta));
      setCopied("yes");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <div className="space-y-3 rounded-lg border border-bk-line bg-bk-bg p-3 text-left text-xs text-bk-muted">
      <section>
        <h4 className="mb-1 font-medium text-bk-fg">What happened</h4>
        <p>{ex.what}</p>
      </section>
      <section>
        <h4 className="mb-1 font-medium text-bk-fg">Why it may have happened</h4>
        <ul className="list-disc space-y-0.5 pl-4">
          {ex.why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="mb-1.5 font-medium text-bk-fg">What you can do</h4>
        <ActionButtons actions={ex.actions} onRetry={onRetry} />
      </section>
      <section>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <h4 className="font-medium text-bk-fg">Technical details</h4>
          <button type="button" className={LINK} onClick={() => void copy()}>
            {copied === "yes" ? <Check className="size-3.5 text-bk-ok" /> : <Copy className="size-3.5" />}
            {copied === "yes" ? "Copied" : copied === "failed" ? "Couldn't copy" : "Copy"}
          </button>
        </div>
        <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-0.5 rounded-md border border-bk-line bg-bk-panel p-2 font-mono text-[11px]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-bk-faint">{k}</dt>
              <dd className="break-all text-bk-fg">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-1 text-[11px] text-bk-faint">No sign-in tokens or personal content are included. Share this when you report a problem.</p>
      </section>
    </div>
  );
}

/** A small ⓘ toggle that reveals ErrorDiagnostics below it. */
export function ErrorInfo({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={cx("w-full", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs text-bk-muted underline-offset-2 hover:text-bk-fg hover:underline"
      >
        <Info className="size-3.5" /> {open ? "Hide details" : "Details"}
      </button>
      {open && (
        <div id={id} className="mt-2">
          <ErrorDiagnostics error={error} onRetry={onRetry} />
        </div>
      )}
    </div>
  );
}

/** An inline error message (red notice) with the ⓘ diagnostics. */
export function InlineError({ error, message, onRetry, className, icon }: { error: unknown; message?: ReactNode; onRetry?: () => void; className?: string; icon?: ReactNode }) {
  if (!error) return null;
  return (
    <div className={cx("rounded-lg border border-bk-err/30 bg-bk-err/5 px-3.5 py-2.5 text-sm", className)} role="alert">
      <div className="flex items-start gap-2.5 text-bk-err">
        <span className="mt-0.5 shrink-0">{icon ?? <TriangleAlert className="size-4" />}</span>
        <div className="min-w-0">{message ?? errorMessage(error)}</div>
      </div>
      <ErrorInfo error={error} onRetry={onRetry} className="mt-1.5 pl-6" />
    </div>
  );
}
