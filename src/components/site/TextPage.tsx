import { SiteFooter, SiteHeader } from "./Chrome";
import { Markdown } from "./Markdown";

export function TextPage({ title, updated, body }: { title: string; updated?: string; body: string }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {updated && <p className="mt-1 text-sm text-bk-faint">Last updated {updated}</p>}
        <Markdown source={body} />
      </main>
      <SiteFooter />
    </>
  );
}
