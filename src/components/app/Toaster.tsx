"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CircleCheck, CircleHelp, CircleX, ShieldAlert, X } from "lucide-react";
import { cx } from "@/components/ui";
import { useRealtime } from "@/lib/realtime";
import { notificationHref, notificationTone, showBrowserNotification } from "@/lib/notifications";
import type { AppNotification } from "@/lib/types";

const TOAST_MS = 8000;
const MAX_TOASTS = 4;

const ICON = {
  "question.asked": CircleHelp,
  "approval.required": ShieldAlert,
  "session.completed": CircleCheck,
  "session.failed": CircleX,
} as Record<string, typeof Bell>;

const TONE_CLS = {
  warn: "text-bk-warn",
  ok: "text-bk-ok",
  err: "text-bk-err",
  neutral: "text-bk-muted",
};

function isNotification(value: unknown): value is AppNotification {
  return !!value && typeof value === "object" && typeof (value as AppNotification).id === "string" && typeof (value as AppNotification).type === "string";
}

/**
 * Shows realtime 'notification' events while the tab is open: an in-page toast, plus a
 * browser notification when the user has allowed them and the tab isn't in front.
 */
export function Toaster() {
  const router = useRouter();
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const seen = useRef(new Set<string>());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((list) => list.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    const all = timers.current;
    return () => {
      for (const t of all.values()) clearTimeout(t);
      all.clear();
    };
  }, []);

  const open = useCallback(
    (n: AppNotification) => {
      const href = notificationHref(n);
      dismiss(n.id);
      if (href) router.push(href);
    },
    [dismiss, router],
  );

  useRealtime((e) => {
    if (e.type !== "notification" || !isNotification(e.payload)) return;
    const n = e.payload;
    // Events can be replayed after a reconnect; show each notification once.
    if (seen.current.has(n.id)) return;
    seen.current.add(n.id);
    // Ignore old notifications replayed long after they were created.
    const created = Date.parse(n.createdAt);
    if (Number.isFinite(created) && Date.now() - created > 10 * 60_000) return;

    setToasts((list) => [n, ...list.filter((x) => x.id !== n.id)].slice(0, MAX_TOASTS));
    timers.current.set(
      n.id,
      setTimeout(() => dismiss(n.id), TOAST_MS),
    );
    if (document.visibilityState !== "visible" || !document.hasFocus()) showBrowserNotification(n, () => open(n));
  });

  if (toasts.length === 0) return null;
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((n) => {
        const Icon = ICON[n.type] ?? Bell;
        const href = notificationHref(n);
        return (
          <div key={n.id} role="status" className="pointer-events-auto flex items-start gap-3 rounded-xl border border-bk-line bg-bk-panel p-3.5 shadow-xl">
            <Icon className={cx("mt-0.5 size-4 shrink-0", TONE_CLS[notificationTone(n.type)])} />
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => open(n)} disabled={!href}>
              <div className="text-sm font-medium text-bk-fg">{n.title || "BambooKit"}</div>
              {n.body && <div className="mt-0.5 line-clamp-3 break-words text-xs text-bk-muted">{n.body}</div>}
              {href && <div className="mt-1.5 text-[11px] text-bk-faint">{n.type === "question.asked" ? "Answer it" : n.type === "approval.required" ? "Review it" : "Open session"} →</div>}
            </button>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(n.id)} className="shrink-0 rounded p-0.5 text-bk-faint hover:bg-bk-raised hover:text-bk-fg">
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
