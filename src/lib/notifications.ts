"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppNotification } from "./types";

export type BrowserPermission = "default" | "granted" | "denied";

const PERMISSION_EVENT = "bk:notification-permission";

function supported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

function currentPermission(): BrowserPermission {
  return supported() ? (Notification.permission as BrowserPermission) : "denied";
}

/** Browser Notification permission, shared by every component that uses it. */
export function useBrowserNotifications() {
  const [isSupported, setSupported] = useState(false);
  const [permission, setPermission] = useState<BrowserPermission>("default");
  useEffect(() => {
    setSupported(supported());
    setPermission(currentPermission());
    const sync = () => setPermission(currentPermission());
    window.addEventListener(PERMISSION_EVENT, sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener(PERMISSION_EVENT, sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const request = useCallback(async () => {
    if (!supported()) return;
    try {
      await Notification.requestPermission();
    } catch {
      // Older browsers use a callback form; the permission is re-read below either way.
    }
    window.dispatchEvent(new Event(PERMISSION_EVENT));
  }, []);
  return { supported: isSupported, permission, request };
}

/** Where a notification should take the user. */
export function notificationHref(n: AppNotification): string | null {
  const sessionId = typeof n.data?.sessionId === "string" ? n.data.sessionId : null;
  if (n.type === "question.asked" || n.type === "approval.required") return "/approvals/";
  if (n.type === "achievement.unlocked") return "/account/#achievements";
  if (sessionId) return `/session/?id=${encodeURIComponent(sessionId)}`;
  return null;
}

export function notificationTone(type: string): "warn" | "ok" | "err" | "neutral" {
  if (type === "question.asked" || type === "approval.required") return "warn";
  if (type === "session.completed" || type === "achievement.unlocked") return "ok";
  if (type === "session.failed") return "err";
  return "neutral";
}

/** Show a system notification when permission was granted. Returns false when it couldn't. */
export function showBrowserNotification(n: AppNotification, onClick: () => void): boolean {
  if (!supported() || Notification.permission !== "granted") return false;
  try {
    const note = new Notification(n.title || "BambooKit", { body: n.body ?? undefined, tag: n.id, icon: "/icon.png" });
    note.onclick = () => {
      window.focus();
      onClick();
      note.close();
    };
    return true;
  } catch {
    // Some mobile browsers only allow notifications from a service worker.
    return false;
  }
}
