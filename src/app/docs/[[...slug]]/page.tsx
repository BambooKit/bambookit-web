import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { Markdown, docHeadings } from "@/components/site/Markdown";
import { ORDERED_DOCS, SECTIONS, findDoc, type DocPage } from "@/content/docs";
import { cx } from "@/components/ui";
import { LatestReleases } from "@/components/Releases";

type Params = { slug?: string[] };

const href = (d: DocPage) => `/docs/${d.slug ? `${d.slug}/` : ""}`;

export function generateStaticParams() {
  return ORDERED_DOCS.map((d) => ({ slug: d.slug ? [d.slug] : [] }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = findDoc((slug ?? []).join("/"));
  return { title: doc ? `${doc.title} — Docs` : "Docs", description: doc?.summary };
}

function Nav({ current }: { current: string }) {
  return (
    <nav className="space-y-6 text-sm">
      {SECTIONS.map((section) => (
        <div key={section}>
          <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-bk-faint">{section}</div>
          <ul className="space-y-0.5">
            {ORDERED_DOCS.filter((d) => d.section === section).map((d) => (
              <li key={d.slug}>
                <Link
                  href={href(d)}
                  aria-current={d.slug === current ? "page" : undefined}
                  className={cx(
                    "block rounded-md px-2 py-1.5",
                    d.slug === current ? "bg-bk-raised font-medium text-bk-fg" : "text-bk-muted hover:bg-bk-raised/50 hover:text-bk-fg",
                  )}
                >
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default async function DocsPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const current = (slug ?? []).join("/");
  const doc = findDoc(current);
  if (!doc) notFound();
  const index = ORDERED_DOCS.indexOf(doc);
  const prev = ORDERED_DOCS[index - 1];
  const next = ORDERED_DOCS[index + 1];
  const headings = docHeadings(doc.body);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:py-12">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
            <Nav current={current} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <details className="group mb-6 rounded-xl border border-bk-line bg-bk-panel md:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm">
              <span>
                <span className="text-bk-faint">Docs / </span>
                {doc.title}
              </span>
              <ChevronDown className="size-4 text-bk-faint transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-bk-line p-3">
              <Nav current={current} />
            </div>
          </details>

          <article className="max-w-3xl">
            <div className="text-xs font-medium uppercase tracking-wider text-bk-faint">{doc.section}</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{doc.title}</h1>
            {doc.summary && <p className="mt-3 text-lg leading-relaxed text-bk-muted">{doc.summary}</p>}
            {(doc.slug === "install" || doc.slug === "updates") && (
              <div id="downloads" className="mt-6 scroll-mt-20">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-bk-faint">Latest versions</div>
                <LatestReleases />
              </div>
            )}
            <Markdown source={doc.body} />
          </article>

          <div className="mt-14 grid max-w-3xl gap-3 border-t border-bk-line pt-6 sm:grid-cols-2">
            {prev ? (
              <Link href={href(prev)} className="group rounded-xl border border-bk-line p-4 hover:bg-bk-panel">
                <div className="flex items-center gap-1.5 text-xs text-bk-faint">
                  <ArrowLeft className="size-3.5" /> Previous
                </div>
                <div className="mt-1 font-medium text-bk-muted group-hover:text-bk-fg">{prev.title}</div>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link href={href(next)} className="group rounded-xl border border-bk-line p-4 text-right hover:bg-bk-panel">
                <div className="flex items-center justify-end gap-1.5 text-xs text-bk-faint">
                  Next <ArrowRight className="size-3.5" />
                </div>
                <div className="mt-1 font-medium text-bk-muted group-hover:text-bk-fg">{next.title}</div>
              </Link>
            )}
          </div>
        </main>

        {headings.length > 1 && (
          <aside className="hidden w-48 shrink-0 xl:block">
            <div className="sticky top-20 text-sm">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-bk-faint">On this page</div>
              <ul className="space-y-1.5 border-l border-bk-line">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-3 text-bk-muted hover:border-bk-muted hover:text-bk-fg">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
