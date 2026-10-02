import Link from "next/link";
import { Wordmark } from "./Logo";

export const LINKS = {
  github: "https://github.com/BambooKit",
  releases: "https://github.com/BambooKit/bambookit-desktop/releases/latest",
};

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-bk-line bg-bk-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="BambooKit home">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-5 text-sm text-bk-muted">
          <Link href="/docs" className="hover:text-bk-fg">Docs</Link>
          <Link href="/docs/install" className="hover:text-bk-fg">Install</Link>
          <Link href="/security" className="hidden hover:text-bk-fg sm:inline">Security</Link>
          <a href={LINKS.github} className="hover:text-bk-fg">GitHub</a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-bk-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-bk-faint sm:flex-row sm:items-center sm:justify-between">
        <Wordmark />
        <div className="flex gap-5">
          <Link href="/docs" className="hover:text-bk-fg">Docs</Link>
          <Link href="/security" className="hover:text-bk-fg">Security</Link>
          <Link href="/privacy" className="hover:text-bk-fg">Privacy</Link>
          <Link href="/terms" className="hover:text-bk-fg">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
