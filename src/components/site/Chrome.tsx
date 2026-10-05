"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Wordmark } from "./Logo";
import { useAuth } from "@/lib/auth";
import { LINKS } from "@/lib/config";
import { cx } from "@/components/ui";

export { LINKS };

const NAV = [
  { href: "/docs/", label: "Docs", match: "/docs" },
  { href: "/docs/install/", label: "Install", match: "/docs/install" },
  { href: "/pricing/", label: "Pricing", match: "/pricing" },
];

function AccountLink({ className }: { className?: string }) {
  const { status } = useAuth();
  if (status === "signedIn") {
    return (
      <Link href="/sessions/" className={cx("inline-flex items-center gap-1.5 rounded-lg bg-bk-accent px-3.5 py-1.5 text-sm font-medium text-bk-bg hover:opacity-90", className)}>
        Sessions <ArrowRight className="size-3.5" />
      </Link>
    );
  }
  return (
    <Link href="/signin/" className={cx("inline-flex items-center rounded-lg border border-bk-line px-3.5 py-1.5 text-sm font-medium text-bk-fg hover:bg-bk-raised", className)}>
      Sign in
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (match: string) =>
    match === "/docs" ? pathname.startsWith("/docs") && !pathname.startsWith("/docs/install") : pathname.startsWith(match);

  return (
    <header className="sticky top-0 z-30 border-b border-bk-line bg-bk-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="BambooKit home" className="shrink-0">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cx("rounded-md px-3 py-1.5", active(n.match) ? "text-bk-fg" : "text-bk-muted hover:text-bk-fg")}
            >
              {n.label}
            </Link>
          ))}
          <a href={LINKS.github} className="rounded-md px-3 py-1.5 text-bk-muted hover:text-bk-fg" rel="noopener noreferrer">
            GitHub
          </a>
          <AccountLink className="ml-2" />
        </nav>
        <button
          type="button"
          className="rounded-md p-2 text-bk-muted hover:bg-bk-raised hover:text-bk-fg sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-bk-line px-4 pb-4 pt-2 sm:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-md px-2 py-2.5 text-bk-muted hover:text-bk-fg">
              {n.label}
            </Link>
          ))}
          <a href={LINKS.github} className="block rounded-md px-2 py-2.5 text-bk-muted hover:text-bk-fg" rel="noopener noreferrer">
            GitHub
          </a>
          <AccountLink className="mt-2 w-full justify-center" />
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-bk-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-bk-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Wordmark />
          <span className="hidden text-xs sm:inline">AI coding on your PC, with your phone as the remote.</span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/docs/" className="hover:text-bk-fg">Docs</Link>
          <Link href="/pricing/" className="hover:text-bk-fg">Pricing</Link>
          <Link href="/security/" className="hover:text-bk-fg">Security</Link>
          <Link href="/privacy/" className="hover:text-bk-fg">Privacy</Link>
          <Link href="/terms/" className="hover:text-bk-fg">Terms</Link>
          <a href={LINKS.discussions} className="hover:text-bk-fg" rel="noopener noreferrer">Support</a>
          <a href={LINKS.bugReport} className="hover:text-bk-fg" rel="noopener noreferrer">Report a bug</a>
          <a href={LINKS.featureRequest} className="hover:text-bk-fg" rel="noopener noreferrer">Feedback</a>
          <a href={LINKS.github} className="hover:text-bk-fg" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-6 text-xs text-bk-faint sm:px-6">
        Created and maintained by Satyam Pote.
      </div>
    </footer>
  );
}
