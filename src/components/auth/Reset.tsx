"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { AuthLayout, ConfigMissing, Field, FormError, SubmitButton } from "./AuthCard";
import { ButtonLink, LoadingState, Notice } from "@/components/ui";
import { useAuth } from "@/lib/auth";

/** Error returned by Supabase in the redirect URL (e.g. an expired link). */
function linkError(): string | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const desc = params.get("error_description") ?? query.get("error_description");
  return desc ? desc.replace(/\+/g, " ") : null;
}

export function Reset() {
  const { status, emailEnabled, supabase, user } = useAuth();
  const [urlError, setUrlError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => setUrlError(linkError()), []);

  if (!emailEnabled) {
    return (
      <AuthLayout title="Choose a new password">
        <ConfigMissing />
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Password updated">
        <div className="space-y-4 text-center">
          <CircleCheck className="mx-auto size-8 text-bk-ok" />
          <p className="text-sm text-bk-muted">Your new password is set. Use it in BambooKit Desktop and on your phone too.</p>
          <ButtonLink href="/sessions/" variant="primary" className="w-full">
            Go to sessions
          </ButtonLink>
        </div>
      </AuthLayout>
    );
  }

  if (status === "loading") {
    return (
      <AuthLayout title="Choose a new password">
        <LoadingState label="Checking your reset link…" />
      </AuthLayout>
    );
  }

  if (status === "signedOut" || user?.provider !== "email") {
    return (
      <AuthLayout
        title="This reset link can't be used"
        footer={
          <Link href="/signin/" className="text-bk-fg underline underline-offset-2">
            Back to sign in
          </Link>
        }
      >
        <div className="space-y-4">
          <Notice tone="warn">
            {user?.provider === "google"
              ? "You're signed in with Google, which manages your password."
              : (urlError ?? "The link is invalid or has expired. Reset links work once, for a limited time.")}
          </Notice>
          {user?.provider !== "google" && (
            <ButtonLink href="/forgot/" variant="primary" className="w-full">
              Send a new link
            </ButtonLink>
          )}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle={user?.email ? `For ${user.email}` : undefined}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!supabase) return;
          if (password.length < 8) return setError("Use at least 8 characters.");
          if (password !== confirm) return setError("The two passwords don't match.");
          setBusy(true);
          setError(null);
          const { error } = await supabase.auth.updateUser({ password });
          setBusy(false);
          if (error) setError(error.message);
          else setDone(true);
        }}
      >
        <Field label="New password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Field label="Confirm new password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && <FormError>{error}</FormError>}
        <SubmitButton busy={busy}>Set new password</SubmitButton>
      </form>
    </AuthLayout>
  );
}
