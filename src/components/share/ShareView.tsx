"use client";

import { useEffect, useState } from "react";
import { Brain, ChevronRight, Wrench } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { RichText } from "@/components/app/RichText";
import { Button, LoadingState, cx } from "@/components/ui";
import { API_URL } from "@/lib/config";

type Item = { type: string; data: any };

type State = { kind: "loading" } | { kind: "missing" } | { kind: "error"; message: string } | { kind: "ok"; items: Item[] };

/** The share id is the last path segment (/share/<id>, via the host's rewrite) or ?id=<id>. */
function shareIdFromLocation(): string | null {
  const segments = window.location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const fromPath = last && last !== "share" && last !== "index.html" ? decodeURIComponent(last) : null;
  const id = fromPath ?? new URLSearchParams(window.location.search).get("id");
  return id && /^[\w-]{4,40}$/.test(id) ? id : null;
}

async function load(id: string): Promise<Item[] | null> {
  const res = await fetch(`${API_URL}/api/share/${encodeURIComponent(id)}/data`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`The BambooKit service answered with an error (${res.status}).`);
  const body = await res.json();
  return Array.isArray(body) ? (body as Item[]) : Array.isArray(body?.data) ? (body.data as Item[]) : [];
}

function Tool({ p }: { p: any }) {
  const status = String(p.state?.status ?? "");
  const title = p.state?.title || p.state?.input?.command || p.state?.input?.filePath || "";
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-bk-line bg-bk-bg/60 px-3 py-1.5 font-mono text-xs">
      <Wrench className="size-3.5 shrink-0 text-bk-faint" />
      <span className="shrink-0 text-bk-fg">{String(p.tool ?? "tool")}</span>
      <span className="min-w-0 flex-1 truncate text-bk-muted">{String(title)}</span>
      <span className={cx("shrink-0", status === "error" ? "text-bk-err" : status === "completed" ? "text-bk-ok" : "text-bk-warn")}>{status}</span>
    </div>
  );
}

function Transcript({ items }: { items: Item[] }) {
  const session = items.find((i) => i.type === "session")?.data ?? {};
  const messages = items
    .filter((i) => i.type === "message")
    .map((i) => i.data)
    .sort((a, b) => (a?.time?.created ?? 0) - (b?.time?.created ?? 0));
  const parts = items.filter((i) => i.type === "part").map((i) => i.data);
  const diff: any[] = items.find((i) => i.type === "session_diff")?.data ?? [];

  return (
    <>
      <div className="text-xs font-medium uppercase tracking-wider text-bk-faint">Shared session</div>
      <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight">{String(session.title || "Session")}</h1>
      <div className="mt-8 space-y-5">
        {messages.map((m) => {
          const own = parts.filter((p) => p?.messageID === m.id).sort((a, b) => String(a.id).localeCompare(String(b.id)));
          const visible = own.filter((p) => ((p.type === "text" || p.type === "reasoning") && !p.synthetic && !p.ignored && String(p.text ?? "").trim()) || p.type === "tool");
          if (!visible.length) return null;
          const user = m.role === "user";
          return (
            <div key={m.id} className={user ? "flex justify-end" : "flex gap-3"}>
              {!user && (
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-bk-line bg-bk-panel text-[10px] font-semibold text-bk-muted">AI</div>
              )}
              <div
                className={
                  user
                    ? "max-w-[92%] rounded-2xl rounded-br-md border border-bk-line bg-bk-raised px-4 py-2.5 sm:max-w-[80%]"
                    : "min-w-0 flex-1 space-y-2"
                }
              >
                {!user && m.modelID && <div className="font-mono text-[11px] text-bk-faint">{String(m.modelID)}</div>}
                {visible.map((p) =>
                  p.type === "tool" ? (
                    <Tool key={p.id} p={p} />
                  ) : p.type === "reasoning" ? (
                    <details key={p.id} className="group rounded-lg border border-bk-line bg-bk-bg/40 text-xs">
                      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-1.5 text-bk-faint">
                        <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" />
                        <Brain className="size-3.5" /> Thinking
                      </summary>
                      <div className="border-t border-bk-line px-3 py-2 text-bk-muted">
                        <RichText text={String(p.text ?? "")} />
                      </div>
                    </details>
                  ) : (
                    <RichText key={p.id} text={String(p.text ?? "")} className="text-bk-fg" />
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
      {diff.length > 0 && (
        <div className="mt-10 overflow-hidden rounded-xl border border-bk-line bg-bk-panel">
          <div className="border-b border-bk-line px-4 py-2.5 text-sm text-bk-muted">
            {diff.length} file{diff.length === 1 ? "" : "s"} changed
          </div>
          {diff.map((f) => (
            <div key={String(f.file)} className="flex justify-between gap-3 border-b border-bk-line px-4 py-1.5 font-mono text-xs last:border-0">
              <span className="min-w-0 truncate">{String(f.file)}</span>
              <span className="shrink-0">
                <span className="text-bk-ok">+{Number(f.additions) || 0}</span> <span className="text-bk-err">−{Number(f.deletions) || 0}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-10 text-center text-xs text-bk-faint">Shared from BambooKit Desktop</p>
    </>
  );
}

export function ShareView() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = shareIdFromLocation();
    if (!id) {
      setState({ kind: "missing" });
      return;
    }
    let cancelled = false;
    const run = async (initial: boolean) => {
      try {
        const items = await load(id);
        if (cancelled) return;
        setState(items ? { kind: "ok", items } : { kind: "missing" });
      } catch (err) {
        if (!cancelled && initial) setState({ kind: "error", message: (err as Error)?.message || "Can't reach the BambooKit service." });
      }
    };
    void run(true);
    // Shared sessions update while the author keeps working; refresh while the tab is visible.
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void run(false);
    }, 20_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tick]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-10 sm:px-6">
        {state.kind === "loading" && <LoadingState label="Loading shared session…" />}
        {state.kind === "missing" && (
          <div className="py-10 text-center">
            <h1 className="text-2xl font-semibold">This shared session does not exist</h1>
            <p className="mt-2 text-bk-muted">The link may be wrong, or the session was unpublished.</p>
          </div>
        )}
        {state.kind === "error" && (
          <div className="py-10 text-center">
            <h1 className="text-2xl font-semibold">Couldn&apos;t load this shared session</h1>
            <p className="mt-2 text-bk-muted">{state.message}</p>
            <Button className="mt-5" onClick={() => setTick((t) => t + 1)}>
              Retry
            </Button>
          </div>
        )}
        {state.kind === "ok" && <Transcript items={state.items} />}
      </main>
      <SiteFooter />
    </>
  );
}
