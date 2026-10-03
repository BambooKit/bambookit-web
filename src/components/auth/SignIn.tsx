"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthLayout, ConfigMissing, Field, FormError, GoogleButton, SubmitButton, landingAfterSignIn } from "./AuthCard";
import { LoadingState, Notice } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export function SignIn() {
  const { status, emailEnabled, googleEnabled, supabase, getToken } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resent, setResent] = useState(false);
  const routing = useRef(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Supabase returns here from confirmation links; an expired or used link carries an error in the URL.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const desc = hash.get("error_description") ?? params.get("error_description");
    if (desc) setLinkError(desc.replace(/\+/g, " "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = async () => {
    if (routing.current) return;
    routing.current = true;
    router.replace(await landingAfterSignIn(getToken, next));
  };

  // Already signed in (or just returned from an email confirmation link): continue.
  useEffect(() => {
    if (status === "signedIn") void go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!emailEnabled && !googleEnabled) {
    return (
      <AuthLayout title="Sign in">
        <ConfigMissing />
      </AuthLayout>
    );
  }
  if (status !== "signedOut") {
    return (
      <AuthLayout title="Sign in">
        <LoadingState label={status === "loading" ? "Checking your sign-in…" : "Signing you in…"} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Sign in to BambooKit"
      subtitle="Use the same account as BambooKit Desktop."
      footer={
        emailEnabled && (
          <>
            New to BambooKit?{" "}
            <Link href={`/signup/${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-bk-fg underline underline-offset-2">
              Create an account
            </Link>
          </>
        )
      }
    >
      <div className="space-y-4">
        {params.get("reset") === "1" && <Notice tone="ok">Password updated. Sign in with your new password.</Notice>}
        {linkError && (
          <Notice tone="warn">
            {linkError}. Verification links work once, for a limited time. Sign in to get a new one, or use Forgot password.
          </Notice>
        )}
        <GoogleButton onSignedIn={() => void go()} />
        {emailEnabled ? (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!supabase) return;
              setBusy(true);
              setError(null);
              setUnconfirmed(false);
              const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
              setBusy(false);
              if (error) {
                if (/confirm/i.test(error.message)) {
                  setUnconfirmed(true);
                  setError("Confirm your email address first. Check your inbox for the link.");
                } else if (/invalid login/i.test(error.message)) setError("Wrong email or password.");
                else setError(error.message);
                return;
              }
              void go();
            }}
          >
            <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Field
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={
                <Link href="/forgot/" className="text-xs text-bk-faint hover:text-bk-fg">
                  Forgot password?
                </Link>
              }
            />
            {error && (
              <FormError>
                {error}
                {unconfirmed && supabase && (
                  <button
                    type="button"
                    className="ml-1 underline underline-offset-2"
                    disabled={resent}
                    onClick={async () => {
                      await supabase.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/signin/` } });
                      setResent(true);
                    }}
                  >
                    {resent ? "Email sent." : "Resend email"}
                  </button>
                )}
              </FormError>
            )}
            <SubmitButton busy={busy}>Sign in</SubmitButton>
          </form>
        ) : (
          <Notice>Email sign-in is not configured on this deployment.</Notice>
        )}
      </div>
    </AuthLayout>
  );
}
