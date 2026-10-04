"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, Camera, Check, CircleCheck, LogOut, MailWarning, Pencil, Trash2, TriangleAlert, X } from "lucide-react";
import { useLeaveApp } from "./AppShell";
import { Button, Card, ErrorState, LoadingState, Notice, PageHeader, Pill, Spinner, cx } from "@/components/ui";
import { ApiError, apiRequest } from "@/lib/api";
import { InlineError } from "@/components/ErrorInfo";
import { useAuth } from "@/lib/auth";
import { fullDate, plural, timeAgo } from "@/lib/format";
import { useLiveDevices, useNow } from "@/lib/live";
import { LatestReleases } from "@/components/Releases";
import { ProfileStats } from "./ProfileStats";
import { AVATAR_MAX_BYTES, AVATAR_TYPES, DELETE_CONFIRMATION, NICKNAME_MAX, notifyProfileChanged, useProfile } from "@/lib/profile";
import { useBrowserNotifications } from "@/lib/notifications";
import type { AvatarUpload, Me } from "@/lib/types";

function providerLabel(provider: string | null | undefined): string {
  if (provider === "google") return "Google";
  if (provider === "email") return "Email & password";
  return "Other";
}

function friendlyError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === "STORAGE_NOT_CONFIGURED") return "Profile photos aren't available yet: cloud storage isn't set up on the BambooKit service.";
    if (err.code === "DELETION_NOT_CONFIGURED") return "Account deletion isn't set up on the BambooKit service yet. Nothing was deleted.";
    return err.message;
  }
  return (err as Error)?.message || "Something went wrong. Try again.";
}

class UploadError extends Error {}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm text-bk-muted">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-bk-fg">{children}</dd>
    </div>
  );
}

function Avatar({ me, size = 72 }: { me: Me; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [me.avatarUrl]);
  const initial = ((me.name || me.email || "?").trim()[0] ?? "?").toUpperCase();
  if (me.avatarUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={me.avatarUrl}
        alt="Profile photo"
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full border border-bk-line object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span className="grid shrink-0 place-items-center rounded-full border border-bk-line bg-bk-raised text-2xl font-semibold text-bk-fg" style={{ width: size, height: size }}>
      {initial}
    </span>
  );
}

function ProfileCard({ me, onChanged }: { me: Me; onChanged: (patch: Partial<Me> | null) => void }) {
  const { getToken } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState<string | null>(null);
  const storage = me.cloudStorage !== false;

  const upload = async (file: File) => {
    setError(null);
    setDone(null);
    if (!(AVATAR_TYPES as readonly string[]).includes(file.type)) return setError("Choose a JPEG, PNG or WebP image.");
    if (file.size > AVATAR_MAX_BYTES) return setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. Choose one that is 2 MB or smaller.`);
    setBusy("upload");
    try {
      const token = await getToken();
      const target = await apiRequest<AvatarUpload>("POST", "/v1/me/avatar-upload", token, { body: { contentType: file.type, size: file.size } });
      let put: Response;
      try {
        // Straight to storage with the signed URL; no BambooKit credentials are sent.
        put = await fetch(target.url, { method: target.method || "PUT", headers: { "Content-Type": file.type, ...(target.headers ?? {}) }, body: file });
      } catch {
        throw new UploadError(
          "The photo couldn't be sent to cloud storage. The storage service may not accept uploads from this website yet, or your connection dropped. Nothing was changed.",
        );
      }
      if (!put.ok) throw new UploadError(`Cloud storage rejected the photo (error ${put.status}). Nothing was changed. Try again in a moment.`);
      const result = await apiRequest<{ avatarUrl: string | null; profile?: Me }>("POST", "/v1/me/avatar", token, { body: { key: target.key } });
      onChanged(result.profile ?? { avatarUrl: result.avatarUrl, avatarStored: true });
      setDone("Profile photo updated.");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async () => {
    setError(null);
    setDone(null);
    setBusy("remove");
    try {
      const result = await apiRequest<{ profile?: Me } | null>("DELETE", "/v1/me/avatar", await getToken());
      onChanged(result?.profile ?? null);
      setDone("Profile photo removed.");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar me={me} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-semibold text-bk-fg">{me.name || "No name set"}</div>
          {me.email && <div className="truncate text-sm text-bk-muted">{me.email}</div>}
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              ref={input}
              type="file"
              accept={AVATAR_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <Button className="px-3 py-1.5 text-xs" disabled={!storage || busy !== null} onClick={() => input.current?.click()}>
              {busy === "upload" ? <Spinner className="size-3.5" /> : <Camera className="size-3.5" />}
              {me.avatarStored ? "Change photo" : "Upload photo"}
            </Button>
            {me.avatarStored && (
              <Button variant="ghost" className="px-3 py-1.5 text-xs" disabled={busy !== null} onClick={() => void remove()}>
                {busy === "remove" ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />} Remove photo
              </Button>
            )}
          </div>
          <p className="mt-2 text-xs text-bk-faint">
            {storage ? "JPEG, PNG or WebP, up to 2 MB." : "Profile photos aren't available yet: cloud storage isn't set up on the BambooKit service."}
          </p>
        </div>
      </div>
      <InlineError error={error} message={error ? friendlyError(error) : null} className="mt-4" />
      {done && !error && (
        <Notice tone="ok" className="mt-4" icon={<CircleCheck className="size-4" />}>
          {done}
        </Notice>
      )}
    </Card>
  );
}

/** Control characters are not allowed in nicknames (same rule as the API). */
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

function nicknameError(value: string): string | null {
  const v = value.trim();
  if (v.length > NICKNAME_MAX) return `Nicknames can be up to ${NICKNAME_MAX} characters (this one has ${v.length}).`;
  if (CONTROL_CHARS.test(v)) return "The nickname contains characters that can't be used.";
  return null;
}

function NicknameField({ me, onSaved }: { me: Me; onSaved: (profile: Me) => void }) {
  const { getToken } = useAuth();
  const current = me.nickname ?? "";
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!editing) setValue(current);
  }, [current, editing]);

  const invalid = nicknameError(value);
  const unchanged = value.trim() === current;

  const save = async () => {
    setSaved(false);
    if (invalid) return setError(invalid);
    setBusy(true);
    setError(null);
    try {
      const profile = await apiRequest<Me>("PATCH", "/v1/me", await getToken(), { body: { name: value.trim() } });
      onSaved(profile);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <span className="flex flex-wrap items-center gap-2">
        {current ? <span>{current}</span> : <span className="text-bk-faint">Not set</span>}
        <button
          type="button"
          onClick={() => {
            setValue(current);
            setError(null);
            setSaved(false);
            setEditing(true);
          }}
          className="inline-flex items-center gap-1 text-xs text-bk-muted underline-offset-2 hover:text-bk-fg hover:underline"
        >
          <Pencil className="size-3" /> {current ? "Edit" : "Set a nickname"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs text-bk-ok">
            <Check className="size-3" /> Saved
          </span>
        )}
      </span>
    );
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy && !unchanged) void save();
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !busy) setEditing(false);
          }}
          autoFocus
          placeholder="Your nickname"
          aria-label="Nickname"
          aria-invalid={!!invalid}
          className={cx(
            "w-full max-w-xs rounded-lg border bg-bk-bg px-3 py-1.5 text-sm text-bk-fg placeholder:text-bk-faint focus:outline-none",
            invalid ? "border-bk-err/60" : "border-bk-line focus:border-bk-muted",
          )}
        />
        <Button type="submit" variant="primary" className="px-3 py-1.5 text-xs" disabled={busy || unchanged || !!invalid}>
          {busy ? <Spinner className="size-3.5" /> : <Check className="size-3.5" />} Save
        </Button>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" disabled={busy} onClick={() => setEditing(false)}>
          <X className="size-3.5" /> Cancel
        </Button>
      </div>
      <p className={cx("text-xs", invalid ? "text-bk-err" : "text-bk-faint")}>
        {invalid ?? `${value.trim().length}/${NICKNAME_MAX} characters. Shown in BambooKit on all your devices. Leave it empty to use your sign-in name.`}
      </p>
      {error !== invalid && <InlineError error={error} message={error ? friendlyError(error) : null} />}
    </form>
  );
}

function BrowserNotificationsRow() {
  const { supported, permission, request } = useBrowserNotifications();
  if (!supported) return <span className="text-bk-faint">This browser doesn&apos;t support notifications. Alerts still show inside the page.</span>;
  if (permission === "granted") {
    return <span className="text-bk-muted">On. While BambooKit is open in a tab, questions, approvals and finished sessions also show as browser notifications.</span>;
  }
  if (permission === "denied") {
    return <span className="text-bk-muted">Blocked in your browser settings. Alerts still show inside the page while it is open.</span>;
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-bk-muted">Alerts show inside the page while it is open.</span>
      <Button className="px-3 py-1.5 text-xs" onClick={() => void request()}>
        <Bell className="size-3.5" /> Turn on browser notifications
      </Button>
    </span>
  );
}

function VerificationStatus({ me }: { me: Me }) {
  const { supabase } = useAuth();
  const [state, setState] = useState<"idle" | "sending" | "sent" | string>("idle");
  if (me.emailVerified === undefined || me.emailVerified === null) return <span className="text-bk-faint">Unknown</span>;
  if (me.emailVerified) {
    return (
      <Pill tone="ok">
        <CircleCheck className="size-3" /> Verified
      </Pill>
    );
  }
  const canResend = me.provider === "email" && !!supabase && !!me.email;
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Pill tone="warn">
        <MailWarning className="size-3" /> Not verified
      </Pill>
      {canResend &&
        (state === "sent" ? (
          <span className="text-xs text-bk-muted">Check your email for the verification link.</span>
        ) : (
          <button
            type="button"
            className="text-xs text-bk-muted underline underline-offset-2 hover:text-bk-fg disabled:opacity-50"
            disabled={state === "sending"}
            onClick={async () => {
              setState("sending");
              const { error } = await supabase!.auth.resend({ type: "signup", email: me.email!, options: { emailRedirectTo: `${window.location.origin}/signin/` } });
              setState(error ? error.message : "sent");
            }}
          >
            {state === "sending" ? "Sending…" : "Send verification email"}
          </button>
        ))}
      {state !== "idle" && state !== "sending" && state !== "sent" && <InlineError error={state} className="w-full text-xs" />}
    </span>
  );
}

function DangerZone({ me }: { me: Me }) {
  const { getToken } = useAuth();
  const leave = useLeaveApp();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ err: unknown; message: string } | null>(null);
  const available = me.accountDeletion !== false;
  const google = me.provider === "google";
  const ready = typed === DELETE_CONFIRMATION && available && !busy;

  return (
    <Card className="border-bk-err/40">
      <div className="border-b border-bk-err/30 px-4 py-3 sm:px-5">
        <h2 className="font-medium text-bk-err">Danger zone</h2>
      </div>
      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div>
          <h3 className="text-sm font-medium text-bk-fg">Delete account</h3>
          <p className="mt-1 text-sm text-bk-muted">This permanently deletes your BambooKit account. It can&apos;t be undone.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-bk-faint">Deleted</div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-bk-muted">
              <li>{google ? "Your BambooKit sign-in with Google" : "Your sign-in (email and password)"}</li>
              <li>Your profile and profile photo</li>
              <li>The links between your account and your PCs and phones (they are signed out)</li>
              <li>The session list shown here and on your phone, and the saved 7-day cloud copies of session history</li>
              <li>Approval requests, notifications and activity records</li>
              <li>Shared session links</li>
            </ul>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-bk-faint">Not deleted</div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-bk-muted">
              <li>Sessions, chats and project files on your PCs. They stay on your PC; nothing on your PC is deleted.</li>
              <li>BambooKit Desktop and the phone app themselves</li>
              {google && <li>Your Google account</li>}
            </ul>
          </div>
        </div>
        {!available ? (
          <Notice tone="warn">Account deletion isn&apos;t set up on the BambooKit service yet.</Notice>
        ) : (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!ready) return;
              setBusy(true);
              setError(null);
              try {
                await apiRequest("DELETE", "/v1/me", await getToken(), { body: { confirm: DELETE_CONFIRMATION } });
                await leave("/");
              } catch (err) {
                const message = friendlyError(err);
                setError({ err, message: err instanceof ApiError && err.code === "IDENTITY_DELETE_FAILED" && google ? `${message} Signing out and in again usually fixes this.` : message });
                setBusy(false);
              }
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-sm text-bk-muted">
                Type <code className="rounded border border-bk-line bg-bk-bg px-1.5 py-0.5 font-mono text-xs text-bk-fg">{DELETE_CONFIRMATION}</code> to confirm
              </span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                aria-label={`Type ${DELETE_CONFIRMATION} to confirm`}
                className="w-full max-w-sm rounded-lg border border-bk-line bg-bk-bg px-3 py-2 font-mono text-sm text-bk-fg placeholder:text-bk-faint focus:border-bk-err/60 focus:outline-none"
              />
            </label>
            <InlineError error={error?.err} message={error?.message} />
            <Button
              type="submit"
              disabled={!ready}
              className={cx("border-bk-err/50 text-bk-err", ready && "bg-bk-err/10 hover:bg-bk-err/20")}
            >
              {busy ? <Spinner /> : <Trash2 className="size-4" />} Delete my account
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}

export function AccountView() {
  const me = useProfile();
  const { user } = useAuth();
  const leave = useLeaveApp();
  const now = useNow();
  const devices = useLiveDevices();
  const [signingOut, setSigningOut] = useState(false);
  const loaded = !!me.data;

  // Sections load after the page, so scroll to #downloads / #achievements once they exist.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!loaded || !id) return;
    let tries = 0;
    const t = setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 20) {
        clearInterval(t);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
    return () => clearInterval(t);
  }, [loaded]);

  const signOutButton = (
    <Button
      disabled={signingOut}
      onClick={async () => {
        setSigningOut(true);
        await leave("/signin/");
      }}
    >
      {signingOut ? <Spinner /> : <LogOut className="size-4" />} Sign out
    </Button>
  );

  if (me.error && !me.data) {
    return (
      <>
        <PageHeader title="Account" actions={signOutButton} />
        <ErrorState error={me.error} onRetry={me.reload} />
      </>
    );
  }
  if (!me.data) return <LoadingState slow={me.slow} label="Loading your account…" />;

  const m = me.data;
  const provider = m.provider ?? user?.provider;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Account" description="Your BambooKit profile, statistics, downloads and sign-in." actions={signOutButton} />
      <div className="space-y-5">
        <ProfileCard
          me={m}
          onChanged={(patch) => {
            if (!patch) {
              me.reload();
              notifyProfileChanged();
              return;
            }
            me.setData((d) => (d ? { ...d, ...patch } : d));
            notifyProfileChanged(typeof patch.id === "string" ? (patch as Me) : null);
          }}
        />

        <Card>
          <dl className="divide-y divide-bk-line">
            <Row label="Nickname">
              <NicknameField
                me={m}
                onSaved={(profile) => {
                  me.setData((d) => (d ? { ...d, ...profile } : profile));
                  notifyProfileChanged(profile);
                }}
              />
            </Row>
            <Row label="Name shown">{m.name || <span className="text-bk-faint">Not set</span>}</Row>
            <Row label="Email">{m.email || <span className="text-bk-faint">None</span>}</Row>
            <Row label="Sign-in method">
              {providerLabel(provider)}
              {provider === "email" && (
                <Link href="/forgot/" className="ml-3 text-xs text-bk-muted underline underline-offset-2 hover:text-bk-fg">
                  Reset password
                </Link>
              )}
            </Row>
            <Row label="Email verification">
              <VerificationStatus me={m} />
            </Row>
            {m.createdAt && (
              <Row label="Created">
                <span title={fullDate(m.createdAt)}>{fullDate(m.createdAt)}</span>
              </Row>
            )}
            {m.lastActiveAt && (
              <Row label="Last active">
                <span title={fullDate(m.lastActiveAt)}>{timeAgo(m.lastActiveAt, now)}</span>
              </Row>
            )}
            {m.devices !== undefined && (
              <Row label="Devices">
                <Link href="/devices/" className="underline-offset-2 hover:underline">
                  {plural(m.devices, "device")}
                </Link>
              </Row>
            )}
            {m.projects !== undefined && <Row label="Projects">{plural(m.projects, "project")}</Row>}
            <Row label="Browser notifications">
              <BrowserNotificationsRow />
            </Row>
          </dl>
        </Card>

        <ProfileStats now={now} />

        <section id="downloads" className="scroll-mt-20">
          <h2 className="mb-1 font-medium text-bk-fg">Downloads and updates</h2>
          <p className="mb-3 text-sm text-bk-muted">The latest BambooKit releases, and whether your PCs are up to date.</p>
          <LatestReleases desktops={(devices.data ?? []).filter((d) => d.kind === "desktop")} />
        </section>

        <DangerZone me={m} />
      </div>
    </div>
  );
}
