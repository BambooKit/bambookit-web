"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MailCheck } from "lucide-react";
import { AuthLayout, ConfigMissing, Field, FormError, GoogleButton, SubmitButton, landingAfterSignIn } from "./AuthCard";
import { Button, LoadingState, Notice } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export function CheckEmail({ email, onResend, what }: { email: string; onResend?: () => Promise<string | null>; what: string }) {
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  return (
    <div className="space-y-4 text-center">
      <MailCheck className="mx-auto size-8 text-bk-ok" />
      <p className="text-sm text-bk-muted">
        We sent {what} to <span className="font-medium text-bk-fg">{email}</span>. Open the link in that email to continue.
      </p>
      <p className="text-xs text-bk-faint">Can&apos;t find it? Check your spam folder.</p>
      {onResend && (
        <Button
          className="w-full"
          disabled={cooldown > 0}
          onClick={async () => {
            const err = await onResend();
            setMessage(err ?? "Sent again.");
            if (!err) setCooldown(60);
          }}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
        </Button>
      )}
      {message && <p className="text-xs text-bk-muted">{message}</p>}
    </div>
  );
}

export function SignUp() {
  const { status, emailEnabled, googleEnabled, supabase, getToken } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const routing = useRef(false);

  const go = async () => {
    if (routing.current) return;
    routing.current = true;
    router.replace(await landingAfterSignIn(getToken, next));
  };

  useEffect(() => {
    if (status === "signedIn") void go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!emailEnabled && !googleEnabled) {
    return (
      <AuthLayout title="Create your account">
        <ConfigMissing />
      </AuthLayout>
    );
  }

  const redirectTo = () => `${window.location.origin}/signin/`;

  if (sentTo && supabase) {
    return (
      <AuthLayout title="Check your email" footer={<Link href="/signin/" className="text-bk-fg underline underline-offset-2">Back to sign in</Link>}>
        <CheckEmail
          email={sentTo}
          what="a confirmation link"
          onResend={async () => {
            const { error } = await supabase.auth.resend({ type: "signup", email: sentTo, options: { emailRedirectTo: redirectTo() } });
            return error ? error.message : null;
          }}
        />
      </AuthLayout>
    );
  }

  if (status !== "signedOut") {
    return (
      <AuthLayout title="Create your account">
        <LoadingState label="Checking your sign-in…" />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One account for BambooKit Desktop, your phone and this site."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin/" className="text-bk-fg underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <GoogleButton onSignedIn={() => void go()} />
        {emailEnabled ? (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!supabase) return;
              if (password.length < 8) {
                setError("Use at least 8 characters for your password.");
                return;
              }
              setBusy(true);
              setError(null);
              const cleanEmail = email.trim();
              const { data, error } = await supabase.auth.signUp({
                email: cleanEmail,
                password,
                options: { emailRedirectTo: redirectTo(), data: name.trim() ? { name: name.trim() } : undefined },
              });
              setBusy(false);
              if (error) {
                setError(/already registered/i.test(error.message) ? "An account with this email already exists. Sign in instead." : error.message);
                return;
              }
              // With email confirmation on, an existing address returns a user without identities.
              if (data.user && data.user.identities && data.user.identities.length === 0) {
                setError("An account with this email already exists. Sign in, or reset your password.");
                return;
              }
              if (data.session) void go();
              else setSentTo(cleanEmail);
            }}
          >
            <Field label="Name (optional)" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Field
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={<span className="text-xs text-bk-faint">8+ characters</span>}
            />
            {error && <FormError>{error}</FormError>}
            <SubmitButton busy={busy}>Create account</SubmitButton>
            <p className="text-center text-xs text-bk-faint">
              By creating an account you agree to the <Link href="/terms/" className="underline underline-offset-2">terms</Link> and{" "}
              <Link href="/privacy/" className="underline underline-offset-2">privacy policy</Link>.
            </p>
          </form>
        ) : (
          <Notice>Email sign-up is not configured on this deployment.</Notice>
        )}
      </div>
    </AuthLayout>
  );
}
