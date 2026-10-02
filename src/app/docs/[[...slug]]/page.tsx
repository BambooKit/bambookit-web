import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { Markdown } from "@/components/site/Markdown";
import { DOCS, SECTIONS, findDoc } from "@/content/docs";

type Params = { slug?: string[] };

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug ? [d.slug] : [] }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = findDoc((slug ?? []).join("/"));
  return { title: doc ? `${doc.title} — Docs` : "Docs" };
}

export default async function DocsPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const current = (slug ?? []).join("/");
  const doc = findDoc(current);
  if (!doc) notFound();
  const index = DOCS.indexOf(doc);
  const prev = DOCS[index - 1];
  const next = DOCS[index + 1];

  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex max-w-6xl gap-10 px-5 py-10">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="sticky top-20 space-y-6 text-sm">
            {SECTIONS.map((section) => (
              <div key={section}>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-bk-faint">{section}</div>
                <ul className="space-y-1">
                  {DOCS.filter((d) => d.section === section).map((d) => (
                    <li key={d.slug}>
                      <Link
                        href={`/docs${d.slug ? `/${d.slug}` : ""}`}
                        className={`block rounded px-2 py-1 ${d.slug === current ? "bg-bk-raised text-bk-fg" : "text-bk-muted hover:text-bk-fg"}`}
                      >
                        {d.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 max-w-3xl flex-1">
          <div className="mb-2 text-xs uppercase tracking-wider text-bk-faint">{doc.section}</div>
          <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
          <Markdown source={doc.body} />
          <div className="mt-12 flex justify-between border-t border-bk-line pt-6 text-sm">
            {prev ? <Link href={`/docs${prev.slug ? `/${prev.slug}` : ""}`} className="text-bk-muted hover:text-bk-fg">← {prev.title}</Link> : <span />}
            {next ? <Link href={`/docs/${next.slug}`} className="text-bk-muted hover:text-bk-fg">{next.title} →</Link> : <span />}
          </div>
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
