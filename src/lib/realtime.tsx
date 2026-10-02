"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { API_URL } from "./config";
import { useAuth } from "./auth";
import type { StreamEvent } from "./types";

export type LiveState = "connecting" | "live" | "reconnecting" | "off";

type Listener = (event: StreamEvent) => void;

interface RealtimeValue {
  state: LiveState;
  subscribe: (listener: Listener) => () => void;
}

const RealtimeContext = createContext<RealtimeValue | null>(null);

/** No bytes for this long means the connection is dead (the API pings every 20 s). */
const WATCHDOG_MS = 50_000;

/**
 * One Server-Sent Events stream per signed-in tab: GET /v1/realtime/stream?client=web.
 * Uses fetch + ReadableStream because EventSource cannot send the Authorization header.
 * Reconnects with exponential backoff and resumes with ?after=<last event id>.
 * Subscribers also receive { type: "ready", payload: { reconnect } } on every (re)connect
 * so they can refetch anything that is not replayed (live chat parts are never stored).
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { status, getToken } = useAuth();
  const [state, setState] = useState<LiveState>("off");
  const listeners = useRef(new Set<Listener>());

  useEffect(() => {
    if (status !== "signedIn") {
      setState("off");
      return;
    }
    let stopped = false;
    let attempt = 0;
    let lastId: number | null = null;
    let connectedOnce = false;
    let ctrl: AbortController | null = null;
    let wakeUp: (() => void) | null = null;

    const emit = (event: StreamEvent) => {
      for (const l of [...listeners.current]) {
        try {
          l(event);
        } catch (err) {
          console.error("realtime listener failed", err);
        }
      }
    };

    const handleBlock = (block: string) => {
      let eventName = "message";
      let id: string | null = null;
      const data: string[] = [];
      for (const line of block.split("\n")) {
        if (!line || line.startsWith(":")) continue;
        const colon = line.indexOf(":");
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? "" : line.slice(colon + 1);
        if (value.startsWith(" ")) value = value.slice(1);
        if (field === "event") eventName = value;
        else if (field === "data") data.push(value);
        else if (field === "id") id = value;
      }
      if (id !== null && /^\d+$/.test(id)) lastId = Number(id);
      if (eventName === "ping") return;
      if (eventName === "ready") {
        attempt = 0;
        setState("live");
        emit({ type: "ready", sessionId: null, deviceId: null, payload: { reconnect: connectedOnce } });
        connectedOnce = true;
        return;
      }
      let parsed: any;
      try {
        parsed = JSON.parse(data.join("\n"));
      } catch {
        return;
      }
      emit({
        type: parsed?.type ?? eventName,
        sessionId: parsed?.sessionId ?? null,
        deviceId: parsed?.deviceId ?? null,
        payload: parsed?.payload ?? null,
      });
    };

    const connect = async () => {
      ctrl = new AbortController();
      const current = ctrl;
      let watchdog: ReturnType<typeof setTimeout> | undefined;
      const bump = () => {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => current.abort(), WATCHDOG_MS);
      };
      try {
        const token = await getToken();
        if (!token || stopped) return;
        const qs = new URLSearchParams({ client: "web" });
        if (lastId !== null) qs.set("after", String(lastId));
        bump();
        const res = await fetch(`${API_URL}/v1/realtime/stream?${qs}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
          cache: "no-store",
          signal: current.signal,
        });
        if (!res.ok || !res.body) throw new Error(`stream answered ${res.status}`);
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        while (!stopped) {
          const { value, done } = await reader.read();
          if (done) break;
          bump();
          buffer += value.replace(/\r/g, "");
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const block = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            handleBlock(block);
          }
        }
      } catch {
        // Fall through to reconnect.
      } finally {
        clearTimeout(watchdog);
      }
    };

    const loop = async () => {
      while (!stopped) {
        setState(connectedOnce ? "reconnecting" : "connecting");
        await connect();
        if (stopped) break;
        setState("reconnecting");
        const delay = Math.min(30_000, 1000 * 2 ** attempt) * (0.75 + Math.random() * 0.5);
        attempt = Math.min(attempt + 1, 6);
        await new Promise<void>((resolve) => {
          const t = setTimeout(resolve, delay);
          wakeUp = () => {
            clearTimeout(t);
            resolve();
          };
        });
        wakeUp = null;
      }
    };

    // Retry right away when the tab becomes visible or the network comes back.
    const nudge = () => {
      if (document.visibilityState === "visible") wakeUp?.();
    };
    window.addEventListener("online", nudge);
    document.addEventListener("visibilitychange", nudge);
    void loop();

    return () => {
      stopped = true;
      ctrl?.abort();
      wakeUp?.();
      window.removeEventListener("online", nudge);
      document.removeEventListener("visibilitychange", nudge);
    };
  }, [status, getToken]);

  const value = useRef<RealtimeValue>({
    state: "off",
    subscribe: (listener) => {
      listeners.current.add(listener);
      return () => listeners.current.delete(listener);
    },
  });
  return <RealtimeContext.Provider value={{ ...value.current, state }}>{children}</RealtimeContext.Provider>;
}

export function useLiveState(): LiveState {
  return useContext(RealtimeContext)?.state ?? "off";
}

/** Subscribe to realtime events while mounted. The handler may change between renders. */
export function useRealtime(handler: Listener): void {
  const ctx = useContext(RealtimeContext);
  const ref = useRef(handler);
  ref.current = handler;
  const subscribe = ctx?.subscribe;
  useEffect(() => {
    if (!subscribe) return;
    return subscribe((e) => ref.current(e));
  }, [subscribe]);
}
