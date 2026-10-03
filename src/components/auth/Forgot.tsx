"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthLayout, ConfigMissing, Field, FormError, SubmitButton } from "./AuthCard";
import { CheckEmail } from "./SignUp";
import { useAuth } from "@/lib/auth";

export function Forgot() {
  const { emailEnabled, supabase } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const send = async (address: string) => {
    if (!supabase) return "Sign-in is not configured.";
    const { error } = await supabase.auth.resetPasswordForEmail(address, { redirectTo: `${window.location.origin}/reset/` });
    return error ? error.message : null;
  };

  if (!emailEnabled) {
    return (
      <AuthLayout title="Reset your password">
        <ConfigMissing />
      </AuthLayout>
    );
  }

  const footer = (
    <Link href="/signin/" className="text-bk-fg underline underline-offset-2">
      Back to sign in
    </Link>
  );

  if (sentTo) {
    return (
      <AuthLayout title="Check your email" footer={footer}>
        <CheckEmail email={sentTo} what="a password reset link" ifAccountExists onResend={() => send(sentTo)} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to choose a new one." footer={footer}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const address = email.trim();
          const err = await send(address);
          setBusy(false);
          if (err) setError(err);
          else setSentTo(address);
        }}
      >
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <FormError>{error}</FormError>}
        <SubmitButton busy={busy}>Send reset link</SubmitButton>
        <p className="text-center text-xs text-bk-faint">Signed in with Google? Your password is managed by Google.</p>
      </form>
    </AuthLayout>
  );
}
