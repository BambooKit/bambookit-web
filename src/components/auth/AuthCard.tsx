"use client";

import Link from "next/link";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { CircleAlert, Lock } from "lucide-react";
import { SiteHeader } from "@/components/site/Chrome";
import { Mark } from "@/components/site/Logo";
import { Button, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import type { Device } from "@/lib/types";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="bk-glow flex min-h-[calc(100vh-3.5rem)] items-start justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <Mark size={40} className="text-bk-fg" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-bk-muted">{subtitle}</p>}
          </div>
          <div className="rounded-2xl border border-bk-line bg-bk-panel p-5 shadow-2xl sm:p-6">{children}</div>
          {footer && <div className="mt-5 text-center text-sm text-bk-muted">{footer}</div>}
        </div>
      </main>
    </>
  );
}

export function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm text-bk-muted">
        {label}
        {hint}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-bk-line bg-bk-bg px-3 py-2 text-sm text-bk-fg placeholder:text-bk-faint focus:border-bk-muted focus:outline-none"
      />
    </label>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-bk-err/30 bg-bk-err/5 px-3 py-2 text-sm text-bk-err">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <Button type="submit" variant="primary" disabled={busy} className="w-full py-2.5">
      {busy && <Spinner />}
      {children}
    </Button>
  );
}

/** Shown when the deployment was built without Supabase settings. */
export function ConfigMissing() {
  return (
    <div className="rounded-2xl border border-bk-line bg-bk-panel p-6 text-center">
      <Lock className="mx-auto size-6 text-bk-faint" />
      <h2 className="mt-3 font-medium">Sign-in is not configured on this deployment</h2>
      <p className="mt-1.5 text-sm text-bk-muted">
        This copy of the site was built without sign-in settings, so accounts are unavailable here. Docs and install instructions still work.
      </p>
      <div className="mt-4 flex justify-center gap-2 text-sm">
        <Link href="/docs/" className="underline underline-offset-2 hover:text-bk-fg">Docs</Link>
        <span className="text-bk-faint">·</span>
        <Link href="/docs/install/" className="underline underline-offset-2 hover:text-bk-fg">Install</Link>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="currentColor" d="M21.8 10.2H12v3.9h5.6c-.5 2.5-2.6 3.9-5.6 3.9a6 6 0 1 1 0-12c1.5 0 2.8.5 3.8 1.4l2.9-2.9A10 10 0 1 0 22 12c0-.6-.1-1.2-.2-1.8z" />
    </svg>
  );
}

/** "Continue with Google". Rendered only when Firebase is configured for this build. */
export function GoogleButton({ onSignedIn }: { onSignedIn: () => void }) {
  const { googleEnabled, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!googleEnabled) return null;
  return (
    <div className="space-y-3">
      <Button
        className="w-full py-2.5"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await signInWithGoogle();
            onSignedIn();
          } catch (err: any) {
            const code = String(err?.code ?? "");
            if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
              setError(code === "auth/popup-blocked" ? "Your browser blocked the Google window. Allow pop-ups and try again." : "Google sign-in failed. Try again.");
            }
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? <Spinner /> : <GoogleG />} Continue with Google
      </Button>
      {error && <FormError>{error}</FormError>}
      <div className="flex items-center gap-3 text-xs text-bk-faint">
        <span className="h-px flex-1 bg-bk-line" /> or <span className="h-px flex-1 bg-bk-line" />
      </div>
    </div>
  );
}

/** Only same-site relative paths are accepted as ?next= targets. */
export function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if (/^\/(signin|signup|forgot|reset)\b/.test(next)) return null;
  return next;
}

/** Where to go after signing in: ?next=, else /welcome when the account has no PC yet, else /sessions. */
export async function landingAfterSignIn(getToken: () => Promise<string | null>, next: string | null): Promise<string> {
  const target = safeNext(next);
  if (target) return target;
  try {
    const devices = await apiGet<Device[]>("/v1/devices", await getToken());
    return devices.some((d) => d.kind === "desktop") ? "/sessions/" : "/welcome/";
  } catch {
    return "/sessions/";
  }
}
