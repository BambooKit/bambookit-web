import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/Chrome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shared session", robots: { index: false } };

const API = (process.env.BAMBOOKIT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

type Item = { type: string; data: any };

async function load(id: string): Promise<Item[] | null> {
  if (!/^[\w-]{4,40}$/.test(id)) return null;
  const res = await fetch(`${API}/api/share/${encodeURIComponent(id)}/data`, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json()) as Item[];
}

/** Text with fenced code blocks; everything else is rendered as plain text (React escapes it). */
function Text({ text }: { text: string }) {
  const parts = String(text ?? "").split("```");
  return (
    <>
      {parts.map((chunk, i) => {
        if (i % 2 === 1) {
          const nl = chunk.indexOf("\n");
          return (
            <pre key={i} className="my-3 overflow-x-auto rounded-md border border-bk-line bg-bk-panel p-3 font-mono text-[13px]">
              <code>{(nl >= 0 ? chunk.slice(nl + 1) : chunk).replace(/\n$/, "")}</code>
            </pre>
          );
        }
        return chunk.split(/\n{2,}/).filter((p) => p.trim()).map((p, j) => (
          <p key={`${i}-${j}`} className="my-2 whitespace-pre-wrap leading-relaxed">{p}</p>
        ));
      })}
    </>
  );
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = await load(id);

  if (!items) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="text-2xl font-semibold">This shared session does not exist</h1>
          <p className="mt-2 text-bk-muted">It may have been unpublished.</p>
        </main>
      </>
    );
  }

  const session = items.find((i) => i.type === "session")?.data ?? {};
  const messages = items.filter((i) => i.type === "message").map((i) => i.data).sort((a, b) => (a?.time?.created ?? 0) - (b?.time?.created ?? 0));
  const parts = items.filter((i) => i.type === "part").map((i) => i.data);
  const diff: any[] = items.find((i) => i.type === "session_diff")?.data ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="text-xs uppercase tracking-wider text-bk-faint">Shared session</div>
        <h1 className="mt-1 text-2xl font-semibold">{session.title || "Session"}</h1>
        <div className="mt-8 space-y-5">
          {messages.map((m) => {
            const own = parts.filter((p) => p.messageID === m.id).sort((a, b) => String(a.id).localeCompare(String(b.id)));
            const visible = own.filter((p) => (p.type === "text" && !p.synthetic && !p.ignored) || p.type === "tool");
            if (!visible.length) return null;
            const user = m.role === "user";
            return (
              <div key={m.id} className={user ? "rounded-lg border border-bk-line bg-bk-raised px-4 py-3" : ""}>
                <div className="mb-1 text-[11px] uppercase tracking-wider text-bk-faint">{user ? "You" : `Agent${m.modelID ? ` · ${m.modelID}` : ""}`}</div>
                {visible.map((p) =>
                  p.type === "tool" ? (
                    <div key={p.id} className="font-mono text-xs text-bk-faint">
                      ▸ {p.tool} {p.state?.title || p.state?.input?.command || p.state?.input?.filePath || ""}{" "}
                      <span className={p.state?.status === "error" ? "text-bk-err" : p.state?.status === "completed" ? "text-bk-ok" : ""}>{p.state?.status}</span>
                    </div>
                  ) : (
                    <div key={p.id} className="text-bk-fg">
                      <Text text={p.text} />
                    </div>
                  ),
                )}
              </div>
            );
          })}
        </div>
        {diff.length > 0 && (
          <div className="mt-10 rounded-lg border border-bk-line">
            <div className="border-b border-bk-line px-4 py-2 text-sm text-bk-muted">{diff.length} file{diff.length === 1 ? "" : "s"} changed</div>
            {diff.map((f) => (
              <div key={f.file} className="flex justify-between border-b border-bk-line px-4 py-1.5 font-mono text-[13px] last:border-0">
                <span className="truncate">{f.file}</span>
                <span><span className="text-bk-ok">+{f.additions}</span> <span className="text-bk-err">−{f.deletions}</span></span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-10 text-center text-xs text-bk-faint">Shared from BambooKit Desktop</p>
      </main>
    </>
  );
}
