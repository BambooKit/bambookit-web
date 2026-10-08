"use client";

import { useEffect, useState } from "react";
import { useResource } from "./api";
import { useRealtime } from "./realtime";
import type { Device, Session } from "./types";

function upsert<T extends { id: string }>(list: T[] | undefined, item: T): T[] | undefined {
  if (!list) return list;
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) return [...list, item];
  const next = list.slice();
  next[i] = { ...next[i], ...item };
  return next;
}

/** GET /v1/devices, kept current by device.* and presence events. */
export function useLiveDevices() {
  const res = useResource<Device[]>("/v1/devices");
  const { setData, reload } = res;
  useRealtime((e) => {
    const p = e.payload;
    switch (e.type) {
      case "device.updated":
        // The PC's reported settings changed: `{deviceId, settings}` (no id/kind). Merge them in place.
        if (p?.settings !== undefined && !p?.kind) {
          const id = p?.id ?? p?.deviceId ?? e.deviceId;
          if (id) setData((list) => list?.map((d) => (d.id === id ? { ...d, settings: { ...d.settings, ...p.settings } } : d)));
          else reload();
          break;
        }
      // falls through to the full-device upsert when a complete device is sent
      case "device.status":
      case "device.registered":
        if (p?.id && p?.kind) setData((list) => upsert(list, p as Device));
        else reload();
        break;
      case "device.revoked":
        setData((list) => list?.filter((d) => d.id !== (p?.id ?? e.deviceId)));
        break;
      case "presence.changed":
        if (p?.kind === "mobile" && p?.deviceId) setData((list) => list?.map((d) => (d.id === p.deviceId ? { ...d, online: !!p.online } : d)));
        break;
      case "pairing.completed":
      case "device.unlinked":
        reload();
        break;
      case "ready":
        if (p?.reconnect) reload();
        break;
    }
  });
  return res;
}

export function sortSessions(list: Session[]): Session[] {
  return list.slice().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

/** GET /v1/sessions, kept current by session.updated / session.removed. */
export function useLiveSessions() {
  const res = useResource<Session[]>("/v1/sessions");
  const { setData, reload } = res;
  useRealtime((e) => {
    if (e.type === "session.updated" && e.payload?.id) {
      const s = e.payload as Session;
      if (s.parentOpencodeSessionId) return; // sub-agent sessions are not listed
      setData((list) => {
        const next = upsert(list, s);
        return next && sortSessions(next);
      });
    } else if (e.type === "session.removed") {
      const id = e.payload?.id ?? e.sessionId;
      setData((list) => list?.filter((x) => x.id !== id));
    } else if (e.type === "ready" && e.payload?.reconnect) reload();
  });
  return res;
}

/** Re-render periodically so relative times ("2 min ago") stay fresh. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
