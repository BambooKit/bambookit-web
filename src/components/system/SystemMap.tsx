"use client";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Live BambooKit system map. Draws the architecture graph served by the BambooKit API
 * (GET /v1/architecture, the same graph Desktop and Android draw) and refreshes it from the
 * account's realtime stream. Nothing on this page is computed or invented client-side.
 */

type Status = "online" | "offline" | "active" | "idle" | "warning" | "error" | "unknown";
type ArchNode = {
  id: string;
  kind: string;
  label: string;
  status: Status;
  detail: string;
  layer: number;
  metrics?: Record<string, string | number | boolean | null>;
  link?: { type: string; id?: string };
};
type Architecture = {
  generatedAt: string;
  focusDesktopId: string | null;
  focusSessionId?: string;
  nodes: ArchNode[];
  edges: Array<{ from: string; to: string; state: "live" | "idle" | "down" }>;
  pendingApprovals: number;
};
type Approval = { id: string; title: string; permission: string; patterns: string[]; sessionTitle: string | null; status: string };
type Change = { file: string; status: string; additions: number; deletions: number };

// Theme classes only (see globals.css); listed in full so Tailwind generates them.
const DOT: Record<Status, string> = {
  online: "fill-bk-ok",
  active: "fill-bk-accent",
  warning: "fill-bk-warn",
  error: "fill-bk-err",
  idle: "fill-bk-muted",
  offline: "fill-bk-faint",
  unknown: "fill-bk-faint",
};
const RING: Record<Status, string> = {
  online: "stroke-bk-ok",
  active: "stroke-bk-accent",
  warning: "stroke-bk-warn",
  error: "stroke-bk-err",
  idle: "stroke-bk-line",
  offline: "stroke-bk-line",
  unknown: "stroke-bk-line",
};
const BG: Record<Status, string> = {
  online: "bg-bk-ok",
  active: "bg-bk-accent",
  warning: "bg-bk-warn",
  error: "bg-bk-err",
  idle: "bg-bk-muted",
  offline: "bg-bk-faint",
  unknown: "bg-bk-faint",
};
const LABEL: Record<Status, string> = {
  online: "Online",
  active: "Active",
  warning: "Needs attention",
  error: "Error",
  idle: "Idle",
  offline: "Offline",
  unknown: "Not reported",
};

const W = 1100;
const NODE_W = 172;
const NODE_H = 54;
const ROW_H = 104;

function layout(graph: Architecture) {
  const layers = new Map<number, ArchNode[]>();
  for (const n of graph.nodes) layers.set(n.layer, [...(layers.get(n.layer) ?? []), n]);
  const order = [...layers.keys()].sort((a, b) => a - b);
  const pos = new Map<string, { x: number; y: number }>();
  order.forEach((layer, row) => {
    const items = layers.get(layer)!;
    const gap = W / (items.length + 1);
    items.forEach((n, i) => pos.set(n.id, { x: gap * (i + 1), y: 40 + row * ROW_H }));
  });
  return { pos, height: 40 + order.length * ROW_H };
}

const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function SystemMap(props: { apiUrl: string; supabaseUrl: string | null; supabaseKey: string | null }) {
  const supabase = useMemo<SupabaseClient | null>(
    () =>
      props.supabaseUrl && props.supabaseKey
        ? createClient(props.supabaseUrl, props.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } })
        : null,
    [props.supabaseUrl, props.supabaseKey],
  );
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return setReady(true);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase)
    return (
      <Notice title="Web sign-in is not configured on this deployment">
        Set <code>SUPABASE_URL</code> and <code>SUPABASE_PUBLISHABLE_KEY</code> (the public anon key) in the web service environment.
      </Notice>
    );
  if (!ready) return <p className="text-sm text-bk-muted">Loading…</p>;
  if (!session) return <SignIn supabase={supabase} />;
  return <LiveMap apiUrl={props.apiUrl} supabase={supabase} email={session.user.email ?? ""} />;
}

function Notice(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-bk-line bg-bk-panel p-5">
      <h1 className="text-lg font-semibold">{props.title}</h1>
      <p className="mt-2 text-sm text-bk-muted">{props.children}</p>
    </div>
  );
}

function SignIn({ supabase }: { supabase: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="mx-auto mt-10 flex max-w-sm flex-col gap-3 rounded-lg border border-bk-line bg-bk-panel p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setBusy(false);
        if (error) setError(error.message);
      }}
    >
      <h1 className="text-lg font-semibold">Sign in to see your live system</h1>
      <p className="text-sm text-bk-muted">Use the same BambooKit account as on your PC and phone.</p>
      <input className="rounded-md border border-bk-line bg-bk-bg px-3 py-2 text-sm" type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="rounded-md border border-bk-line bg-bk-bg px-3 py-2 text-sm" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-bk-err">{error}</p>}
      <button className="rounded-md bg-bk-accent px-3 py-2 text-sm font-medium text-bk-bg disabled:opacity-50" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function LiveMap({ apiUrl, supabase, email }: { apiUrl: string; supabase: SupabaseClient; email: string }) {
  const [graph, setGraph] = useState<Architecture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState<"connecting" | "connected" | "offline">("connecting");
  const [desktopId, setDesktopId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);
  const desktopRef = useRef(desktopId);
  desktopRef.current = desktopId;

  const token = useCallback(async () => (await supabase.auth.getSession()).data.session?.access_token ?? null, [supabase]);

  const call = useCallback(
    async <T,>(method: string, path: string, body?: unknown): Promise<T> => {
      const t = await token();
      if (!t) throw new Error("Signed out");
      const res = await fetch(`${apiUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${t}`, ...(body ? { "Content-Type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? json?.message ?? `HTTP ${res.status}`);
      return (json.data ?? json) as T;
    },
    [apiUrl, token],
  );

  const load = useCallback(async () => {
    try {
      const q = desktopRef.current ? `?desktopId=${encodeURIComponent(desktopRef.current)}` : "";
      setGraph(await call<Architecture>("GET", `/v1/architecture${q}`));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, [call]);

  useEffect(() => {
    void load();
  }, [load, desktopId]);

  // Realtime: the account's event stream marks this browser as a connected web client
  // and tells us when anything changes; the graph itself is always re-read from the API.
  useEffect(() => {
    let stopped = false;
    let controller: AbortController | null = null;
    let after: string | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void load(), 400);
    };
    const run = async () => {
      let backoff = 1000;
      while (!stopped) {
        try {
          const t = await token();
          if (!t) return;
          controller = new AbortController();
          const res = await fetch(`${apiUrl}/v1/realtime/stream?client=web${after ? `&after=${after}` : ""}`, {
            headers: { Authorization: `Bearer ${t}`, Accept: "text/event-stream" },
            signal: controller.signal,
            cache: "no-store",
          });
          if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);
          setLive("connected");
          backoff = 1000;
          refresh();
          const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
          let buf = "";
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += value;
            let i: number;
            while ((i = buf.indexOf("\n\n")) >= 0) {
              const frame = buf.slice(0, i);
              buf = buf.slice(i + 2);
              let type = "message";
              for (const line of frame.split("\n")) {
                if (line.startsWith("event:")) type = line.slice(6).trim();
                else if (line.startsWith("id:")) after = line.slice(3).trim();
              }
              if (type !== "ping" && type !== "ready") refresh();
            }
          }
        } catch {
          if (stopped) return;
        }
        setLive("offline");
        refresh();
        await new Promise((r) => setTimeout(r, backoff));
        backoff = Math.min(backoff * 2, 30_000);
        setLive("connecting");
      }
    };
    void run();
    // Slow safety refresh for state the stream can't announce (e.g. a PC that lost power).
    const poll = setInterval(() => void load(), 30_000);
    return () => {
      stopped = true;
      controller?.abort();
      clearInterval(poll);
      if (timer) clearTimeout(timer);
    };
  }, [apiUrl, token, load]);

  const laid = useMemo(() => (graph ? layout(graph) : null), [graph]);
  const node = graph?.nodes.find((n) => n.id === selected) ?? null;
  const connected = useMemo(() => {
    const s = new Set<string>();
    if (!graph || !selected) return s;
    for (const e of graph.edges) if (e.from === selected || e.to === selected) s.add(e.from).add(e.to);
    return s;
  }, [graph, selected]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">System map</h1>
          <p className="text-sm text-bk-muted">
            {email} · realtime {live}
            {graph && ` · updated ${new Date(graph.generatedAt).toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Btn onClick={() => setZoom((z) => Math.min(2.5, z * 1.2))} label="Zoom in">+</Btn>
          <Btn onClick={() => setZoom((z) => Math.max(0.4, z / 1.2))} label="Zoom out">−</Btn>
          <Btn onClick={() => (setZoom(1), setPan({ x: 0, y: 0 }))} label="Reset view">Fit</Btn>
          <Btn onClick={() => void supabase.auth.signOut()} label="Sign out">Sign out</Btn>
        </div>
      </div>
      {error && <p className="text-sm text-bk-err">{error}</p>}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div
          className="relative h-[620px] flex-1 touch-none overflow-hidden rounded-lg border border-bk-line bg-bk-panel"
          onWheel={(e) => setZoom((z) => Math.max(0.4, Math.min(2.5, z * (e.deltaY < 0 ? 1.1 : 0.9))))}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) d.moved = true;
            if (d.moved) setPan({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y });
          }}
          onPointerUp={() => setTimeout(() => (drag.current = null))}
          onPointerLeave={() => (drag.current = null)}
        >
          {!laid ? (
            <p className="p-6 text-sm text-bk-muted">{error ? "" : "Loading the live system map…"}</p>
          ) : (
            <svg
              viewBox={`0 0 ${W} ${laid.height}`}
              className="h-full w-full select-none"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center top" }}
              onClick={() => !drag.current?.moved && setSelected(null)}
            >
              {graph!.edges.map((e) => {
                const a = laid.pos.get(e.from);
                const b = laid.pos.get(e.to);
                if (!a || !b) return null;
                const hot = selected && (e.from === selected || e.to === selected);
                const cls = hot ? "stroke-bk-fg" : e.state === "live" ? "stroke-bk-accent" : e.state === "down" ? "stroke-bk-err" : "stroke-bk-line";
                return (
                  <path
                    key={`${e.from}-${e.to}`}
                    d={`M ${a.x} ${a.y + NODE_H / 2} C ${a.x} ${a.y + NODE_H / 2 + 30}, ${b.x} ${b.y - NODE_H / 2 - 30}, ${b.x} ${b.y - NODE_H / 2}`}
                    fill="none"
                    className={cls}
                    strokeWidth={hot ? 2.5 : e.state === "live" ? 1.8 : 1.2}
                    strokeDasharray={e.state === "down" ? "4 4" : e.state === "live" ? "6 6" : undefined}
                    opacity={selected && !hot ? 0.35 : 1}
                  >
                    {e.state === "live" && <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" />}
                  </path>
                );
              })}
              {graph!.nodes.map((n) => {
                const p = laid.pos.get(n.id)!;
                const dim = selected && !connected.has(n.id);
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x - NODE_W / 2}, ${p.y - NODE_H / 2})`}
                    className="cursor-pointer"
                    opacity={dim ? 0.45 : 1}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      if (!drag.current?.moved) setSelected(n.id);
                    }}
                  >
                    <rect width={NODE_W} height={NODE_H} rx={8} className={`fill-bk-raised ${selected === n.id ? "stroke-bk-fg" : RING[n.status]}`} strokeWidth={selected === n.id ? 2 : 1} />
                    <circle cx={14} cy={16} r={4.5} className={DOT[n.status]}>
                      {n.status === "active" && <animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite" />}
                    </circle>
                    <text x={26} y={20} className="fill-bk-fg" fontSize={12.5} fontWeight={600}>{short(n.label, 22)}</text>
                    <text x={12} y={40} className="fill-bk-muted" fontSize={10.5}>{short(n.detail, 30)}</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
        <aside className="w-full shrink-0 rounded-lg border border-bk-line bg-bk-panel p-4 lg:w-80">
          {!node ? (
            <p className="text-sm text-bk-muted">Select a node to see its live details. Drag to pan, scroll to zoom.</p>
          ) : (
            <NodePanel key={node.id + (graph?.generatedAt ?? "")} node={node} graph={graph!} call={call} reload={load} onFocusDesktop={setDesktopId} />
          )}
        </aside>
      </div>
    </div>
  );
}

function Btn(props: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={props.label} title={props.label} onClick={props.onClick} className="rounded-md border border-bk-line px-2.5 py-1 text-bk-muted hover:text-bk-fg">
      {props.children}
    </button>
  );
}

function NodePanel(props: {
  node: ArchNode;
  graph: Architecture;
  call: <T>(method: string, path: string, body?: unknown) => Promise<T>;
  reload: () => Promise<void>;
  onFocusDesktop: (id: string) => void;
}) {
  const { node, graph, call } = props;
  const [approvals, setApprovals] = useState<Approval[] | null>(null);
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const sessionId = node.link?.type === "session" || node.link?.type === "changes" ? node.link.id : undefined;
  const showChanges = sessionId && ["files", "git", "sessions", "agent", "project"].includes(node.id);

  useEffect(() => {
    if (node.id === "approvals") call<Approval[]>("GET", "/v1/approvals?status=PENDING").then(setApprovals, (e) => setMsg(e.message));
    if (showChanges) call<Change[]>("GET", `/v1/sessions/${sessionId}/changes`).then(setChanges, (e) => setMsg(e.message));
  }, [node.id, sessionId, showChanges, call]);

  const act = async (fn: () => Promise<unknown>, done: string) => {
    setMsg(null);
    try {
      await fn();
      setMsg(done);
      await props.reload();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const metrics = Object.entries(node.metrics ?? {}).filter(([k, v]) => v !== null && v !== "" && !["opencodeSessionId", "sessionId", "directory"].includes(k));

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className={`size-2.5 rounded-full ${BG[node.status]}`} />
        <span className="font-semibold">{node.label}</span>
      </div>
      <span className="text-xs text-bk-muted">{LABEL[node.status]}</span>
      <p className="break-words text-bk-muted">{node.detail}</p>
      {metrics.length > 0 && (
        <dl className="flex flex-col gap-1 border-t border-bk-line pt-2 text-xs">
          {metrics.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-bk-faint">{k}</dt>
              <dd className="truncate text-bk-fg">{String(v)}</dd>
            </div>
          ))}
        </dl>
      )}

      {node.kind === "desktop" && node.link?.id && node.link.id !== graph.focusDesktopId && (
        <Action onClick={() => props.onFocusDesktop(node.link!.id!)}>Show this PC&apos;s engine</Action>
      )}

      {node.id === "agent" && node.status === "active" && sessionId && (
        <Action onClick={() => act(() => call("POST", `/v1/sessions/${sessionId}/commands`, { type: "ABORT", payload: {} }), "Stop sent to the PC.")}>Stop the agent</Action>
      )}

      {node.id === "approvals" && (
        <div className="flex flex-col gap-2 border-t border-bk-line pt-2">
          {approvals === null ? (
            <p className="text-bk-muted">Loading approvals…</p>
          ) : approvals.length === 0 ? (
            <p className="text-bk-muted">Nothing is waiting for approval.</p>
          ) : (
            approvals.map((a) => (
              <div key={a.id} className="flex flex-col gap-2 rounded-md border border-bk-line p-2">
                <span className="font-medium">{a.title}</span>
                <span className="text-xs text-bk-muted">
                  {a.permission}
                  {a.sessionTitle ? ` · ${a.sessionTitle}` : ""}
                </span>
                {a.patterns.length > 0 && <code className="break-all text-xs text-bk-muted">{a.patterns.join(", ")}</code>}
                {a.status === "PENDING" && (
                  <div className="flex gap-1">
                    {(["once", "always", "reject"] as const).map((reply) => (
                      <Action key={reply} onClick={() => act(() => call("POST", `/v1/approvals/${a.id}/respond`, { reply }), "Decision sent to the PC.")}>
                        {reply === "once" ? "Allow once" : reply === "always" ? "Always" : "Deny"}
                      </Action>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showChanges && (
        <div className="flex flex-col gap-1 border-t border-bk-line pt-2">
          <span className="text-xs uppercase tracking-wider text-bk-faint">Changed files</span>
          {changes === null ? (
            <p className="text-bk-muted">Loading…</p>
          ) : changes.length === 0 ? (
            <p className="text-bk-muted">No file changes in this session yet.</p>
          ) : (
            changes.map((c) => (
              <div key={c.file} className="flex justify-between gap-2 text-xs">
                <span className="truncate font-mono">{c.file}</span>
                <span className="shrink-0">
                  <span className="text-bk-ok">+{c.additions}</span> <span className="text-bk-err">−{c.deletions}</span>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {(node.link?.type === "session" || node.link?.type === "changes") && (
        <p className="text-xs text-bk-faint">Open this session in BambooKit Desktop or on your phone to chat, review diffs and rewind.</p>
      )}
      {node.link?.type === "devices" && <a className="text-bk-accent underline" href="/docs/phone">How to add a device</a>}
      {node.link?.type === "api" && <a className="text-bk-accent underline" href="/docs">BambooKit docs</a>}
      {msg && <p className="text-xs text-bk-muted">{msg}</p>}
    </div>
  );
}

function Action(props: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={props.onClick} className="rounded-md border border-bk-line px-2.5 py-1 text-xs text-bk-fg hover:bg-bk-raised">
      {props.children}
    </button>
  );
}
