"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Google sign-in for BambooKit Desktop. Supabase only redirects to addresses it trusts, which always include this
 * site, so the desktop app asks Supabase to come back here; this page hands the one-time authorization code to the
 * sign-in listener the app runs on this computer (http://localhost:<port>). The code is useless on its own: the
 * app exchanges it with a PKCE verifier that never leaves the app.
 */
export function DesktopCallback() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Returning to BambooKit Desktop…");

  useEffect(() => {
    const port = Number(params.get("port"));
    const code = params.get("code");
    const error = params.get("error_description") || params.get("error");
    if (!Number.isInteger(port) || port < 1024 || port > 65535) {
      setMessage("This sign-in link is incomplete. Start Google sign-in again from BambooKit Desktop.");
      return;
    }
    const target = new URL(`http://localhost:${port}/auth/callback`);
    if (code) target.searchParams.set("code", code);
    if (error) target.searchParams.set("error", error);
    window.location.replace(target.toString());
    const timer = setTimeout(() => setMessage("If BambooKit Desktop did not open, return to it — it should be signed in. Otherwise start Google sign-in again there."), 4000);
    return () => clearTimeout(timer);
  }, [params]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-xl font-semibold text-bk-fg">Signing in to BambooKit Desktop</h1>
      <p className="text-bk-muted">{message}</p>
    </main>
  );
}
