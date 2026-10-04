"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BookOpen, ChevronDown, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Wordmark } from "@/components/site/Logo";
import { ConfigMissing } from "@/components/auth/AuthCard";
import { LoadingState, cx } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { apiRequest, useResource } from "@/lib/api";
import { RealtimeProvider, useLiveState, useRealtime } from "@/lib/realtime";
import { useProfile } from "@/lib/profile";
import { Toaster } from "./Toaster";
import type { Approval } from "@/lib/types";

const TABS = [
  { href: "/sessions/", label: "Sessions", match: ["/sessions", "/session"] },
  { href: "/devices/", label: "Devices", match: ["/devices"] },
  { href: "/approvals/", label: "Approvals", match: ["/approvals"] },
  { href: "/welcome/", label: "Setup", match: ["/welcome"] },
  { href: "/account/", label: "Account", match: ["/account"] },
];

/** Shown only to accounts whose /v1/me says admin: true. */
const ADMIN_TAB = { href: "/admin/", label: "Admin", match: ["/admin"] };

/** Where to go after an intentional sign-out (instead of the sign-in page with ?next=). */
let leaveTarget: string | null = null;

/** Sign out and go to `to` (e.g. "/" after deleting the account). */
export function useLeaveApp(): (to: string) => Promise<void> {
  const { signOut } = useAuth();
  const router = useRouter();
  return useCallback(
    async (to: string) => {
      leaveTarget = to;
      await signOut();
      router.replace(to);
    },
    [signOut, router],
  );
}

/** Redirects to /signin when signed out; renders children once signed in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, emailEnabled, googleEnabled } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "signedOut" || (!emailEnabled && !googleEnabled)) return;
    if (leaveTarget) {
      const to = leaveTarget;
      leaveTarget = null;
      router.replace(to);
      return;
    }
    const next = `${pathname ?? "/sessions/"}${window.location.search}`;
    router.replace(`/signin/?next=${encodeURIComponent(next)}`);
  }, [status, emailEnabled, googleEnabled, pathname, router]);

  if (!emailEnabled && !googleEnabled) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <ConfigMissing />
      </div>
    );
  }
  if (status !== "signedIn") return <LoadingState label={status === "loading" ? "Checking your sign-in…" : "Redirecting to sign in…"} />;
  return <>{children}</>;
}

function LiveIndicator() {
  const state = useLiveState();
  const label = state === "live" ? "Live" : state === "off" ? "Offline" : state === "connecting" ? "Connecting" : "Reconnecting";
  return (
    <span className="hidden items-center gap-1.5 text-xs text-bk-faint sm:inline-flex" title={`Realtime updates: ${label.toLowerCase()}`}>
      <span className={cx("size-1.5 rounded-full", state === "live" ? "bg-bk-ok" : state === "off" ? "bg-bk-faint" : "animate-pulse bg-bk-warn")} />
      {label}
    </span>
  );
}

function UserMenu({ profile }: { profile: ReturnType<typeof useProfile> }) {
  const { user } = useAuth();
  const leave = useLeaveApp();
  const [imgFailed, setImgFailed] = useState(false);
  const avatarUrl = profile.data?.avatarUrl ?? null;
  useEffect(() => setImgFailed(false), [avatarUrl]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const label = profile.data?.name || user?.name || user?.email || "Account";
  const initial = (label.trim()[0] ?? "?").toUpperCase();
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm text-bk-muted hover:bg-bk-raised hover:text-bk-fg"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatarUrl && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="size-7 rounded-full object-cover" referrerPolicy="no-referrer" onError={() => setImgFailed(true)} />
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-bk-raised text-xs font-semibold text-bk-fg">{initial}</span>
        )}
        <span className="hidden max-w-40 truncate md:inline">{label}</span>
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-bk-line bg-bk-panel p-1.5 shadow-xl">
          <div className="border-b border-bk-line px-3 py-2.5">
            <div className="truncate text-sm text-bk-fg">{profile.data?.name || user?.name || "Signed in"}</div>
            {user?.email && <div className="truncate text-xs text-bk-faint">{user.email}</div>}
            <div className="mt-1 text-[11px] text-bk-faint">{user?.provider === "google" ? "Google account" : "Email account"}</div>
          </div>
          <Link href="/account/" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-bk-muted hover:bg-bk-raised hover:text-bk-fg">
            <UserRound className="size-4" /> Account
          </Link>
          {profile.data?.admin === true && (
            <Link href="/admin/" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-bk-muted hover:bg-bk-raised hover:text-bk-fg">
              <ShieldCheck className="size-4" /> Admin
            </Link>
          )}
          <Link href="/docs/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-bk-muted hover:bg-bk-raised hover:text-bk-fg">
            <BookOpen className="size-4" /> Docs
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void leave("/signin/")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-bk-muted hover:bg-bk-raised hover:text-bk-fg"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/** True once this page load has sent the browser's time zone (PATCH /v1/me { timeZone }). */
let timeZoneSent = false;

/** Coding-time weeks, months and night hours are counted in the user's time zone; send it once per load. */
function useSendTimeZone() {
  const { getToken } = useAuth();
  useEffect(() => {
    if (timeZoneSent) return;
    let timeZone: string | undefined;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    if (!timeZone) return;
    timeZoneSent = true;
    void (async () => {
      try {
        await apiRequest("PATCH", "/v1/me", await getToken(), { body: { timeZone } });
      } catch {
        // Not critical: statistics fall back to UTC. Try again on the next page load.
        timeZoneSent = false;
      }
    })();
  }, [getToken]);
}

function ShellFrame({ children }: { children: ReactNode }) {
  useSendTimeZone();
  const pathname = usePathname() ?? "";
  const profile = useProfile();
  const tabs = profile.data?.admin === true ? [...TABS, ADMIN_TAB] : TABS;
  const approvals = useResource<Approval[]>("/v1/approvals?status=PENDING");
  useRealtime((e) => {
    if (e.type.startsWith("approval.") || (e.type === "ready" && e.payload?.reconnect)) approvals.reload();
  });
  const pending = approvals.data?.length ?? 0;
  const isActive = (match: string[]) => match.some((m) => pathname === m || pathname.startsWith(`${m}/`));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-bk-line bg-bk-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="BambooKit home" className="mr-2 shrink-0">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-1 text-sm sm:flex">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5",
                  isActive(t.match) ? "bg-bk-raised text-bk-fg" : "text-bk-muted hover:text-bk-fg",
                )}
              >
                {t.label}
                {t.href === "/approvals/" && pending > 0 && (
                  <span className="rounded-full bg-bk-warn/15 px-1.5 text-[11px] font-semibold text-bk-warn">{pending}</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LiveIndicator />
            <UserMenu profile={profile} />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-bk-line px-3 py-1.5 text-sm sm:hidden">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cx(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5",
                isActive(t.match) ? "bg-bk-raised text-bk-fg" : "text-bk-muted",
              )}
            >
              {t.label}
              {t.href === "/approvals/" && pending > 0 && <span className="rounded-full bg-bk-warn/15 px-1.5 text-[11px] font-semibold text-bk-warn">{pending}</span>}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <Toaster />
    </div>
  );
}

/** Signed-in app shell: auth guard, realtime stream and app navigation. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <RealtimeProvider>
        <ShellFrame>{children}</ShellFrame>
      </RealtimeProvider>
    </RequireAuth>
  );
}
