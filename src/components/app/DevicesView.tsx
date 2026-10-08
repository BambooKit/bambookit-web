"use client";

import { useState } from "react";
import { Coffee, Lock, Monitor, Smartphone, TriangleAlert } from "lucide-react";
import { ButtonLink, Card, EmptyState, ErrorState, LoadingState, Notice, OnlineDot, PageHeader, Pill, Spinner, cx } from "@/components/ui";
import { InlineError } from "@/components/ErrorInfo";
import { apiRequestFull } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLiveDevices, useNow } from "@/lib/live";
import { FALLBACK_REQUIREMENTS, useMeta } from "@/lib/compat";
import { DesktopUpdateNotice } from "./DesktopUpdateNotice";
import { fullDate, timeAgo } from "@/lib/format";
import type { ApprovalMode, Device } from "@/lib/types";

const APPROVAL_MODES: Array<{ value: ApprovalMode; label: string; hint: string }> = [
  { value: "ask", label: "Ask", hint: "Ask before every file edit and command." },
  { value: "edits", label: "Auto mode", hint: "Approve file edits automatically; still ask for commands." },
  { value: "all", label: "Auto-approve", hint: "Approve edits and commands automatically." },
];

/** Keep-awake ☕ toggle and approval-mode control for one PC. Both reflect settings from device.updated. */
function PcControls({ d }: { d: Device }) {
  const { getToken } = useAuth();
  const settings = d.settings ?? {};
  const [busy, setBusy] = useState<"awake" | "mode" | null>(null);
  const [error, setError] = useState<unknown>(null);

  const send = async (which: "awake" | "mode", type: string, payload: unknown) => {
    setBusy(which);
    setError(null);
    try {
      await apiRequestFull("POST", `/v1/devices/${encodeURIComponent(d.id)}/commands`, await getToken(), { body: { type, payload } });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  const hasAwake = settings.keepAwake !== undefined;
  const hasMode = settings.approvalMode !== undefined;
  const hasRemote = settings.allowRemoteControl !== undefined;
  if (!hasAwake && !hasMode && !hasRemote) return null;

  const keepAwake = !!settings.keepAwake;
  const mode = settings.approvalMode ?? "ask";
  const offTitle = d.online ? undefined : `${d.name} is offline`;

  return (
    <div className="mt-3 space-y-3 border-t border-bk-line pt-3">
      {hasAwake && (
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-sm text-bk-muted">
            <Coffee className="size-4 text-bk-faint" /> Keep awake
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={keepAwake}
            disabled={busy === "awake" || !d.online}
            title={offTitle ?? (keepAwake ? "Let this PC sleep normally" : "Keep this PC awake while agents run")}
            onClick={() => void send("awake", "SET_KEEP_AWAKE", { on: !keepAwake })}
            className={cx(
              "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
              keepAwake ? "bg-bk-accent" : "bg-bk-line",
            )}
          >
            <span className={cx("inline-block size-4 rounded-full bg-bk-bg transition-transform", keepAwake ? "translate-x-4" : "translate-x-0.5")} />
            {busy === "awake" && <Spinner className="absolute -right-5 size-3.5 text-bk-faint" />}
          </button>
        </div>
      )}

      {hasMode && (
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-sm text-bk-muted">Approvals</span>
            {busy === "mode" && <Spinner className="size-3.5 text-bk-faint" />}
          </div>
          <div className="inline-flex w-full rounded-lg border border-bk-line bg-bk-bg p-0.5" role="group" aria-label="Approval mode">
            {APPROVAL_MODES.map((m) => {
              const active = mode === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  disabled={!!busy || !d.online || active}
                  title={offTitle ?? m.hint}
                  onClick={() => void send("mode", "SET_APPROVAL_MODE", { mode: m.value })}
                  className={cx(
                    "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed",
                    active ? "bg-bk-raised text-bk-fg" : "text-bk-muted hover:text-bk-fg disabled:opacity-50",
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          {mode === "all" && (
            <Notice tone="warn" icon={<TriangleAlert className="size-4" />} className="mt-2">
              Auto-approve runs the agent&apos;s edits <span className="font-medium">and</span> commands without asking. Use it only when you trust the session.
            </Notice>
          )}
        </div>
      )}

      {hasRemote && (
        <div className="flex items-center justify-between gap-2 text-xs text-bk-faint">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3.5" /> Remote control
          </span>
          <Pill tone={settings.allowRemoteControl ? "warn" : "neutral"}>{settings.allowRemoteControl ? "On" : "Off"}</Pill>
        </div>
      )}

      <InlineError error={error} message={error ? "Couldn't reach your PC. Try again." : null} />
    </div>
  );
}

function DeviceCard({ d, now }: { d: Device; now: number }) {
  const meta = useMeta();
  const features = Object.keys(meta?.desktopRequirements ?? FALLBACK_REQUIREMENTS);
  const Icon = d.kind === "desktop" ? Monitor : Smartphone;
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-bk-line bg-bk-raised text-bk-muted">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{d.name}</span>
            <OnlineDot online={d.online} />
          </div>
          <div className="mt-0.5 text-xs text-bk-faint">
            {[d.platform, d.appVersion && `v${d.appVersion}`, d.kind === "desktop" && d.protocol ? `protocol ${d.protocol}` : null].filter(Boolean).join(" · ") || (d.kind === "desktop" ? "PC" : "Phone")}
          </div>
        </div>
        <span className={d.online ? "text-xs text-bk-ok" : "text-xs text-bk-faint"} title={fullDate(d.lastSeenAt)}>
          {d.online ? "Online" : `Seen ${timeAgo(d.lastSeenAt, now)}`}
        </span>
      </div>
      <div className="mt-3 border-t border-bk-line pt-3 text-xs text-bk-muted">
        {d.linkedDevices.length > 0 ? (
          <>
            <span className="text-bk-faint">{d.kind === "desktop" ? "Paired phones: " : "Paired with: "}</span>
            {d.linkedDevices.map((l) => l.name).join(", ")}
          </>
        ) : (
          <span className="text-bk-faint">{d.kind === "desktop" ? "No phone paired" : "Not paired with a PC"}</span>
        )}
      </div>
      {d.kind === "desktop" && <PcControls d={d} />}
      {d.kind === "desktop" && <DesktopUpdateNotice device={d} features={features} className="mt-3" />}
    </Card>
  );
}

export function DevicesView() {
  const devices = useLiveDevices();
  const now = useNow();
  const header = (
    <PageHeader
      title="Devices"
      description="PCs and phones signed in to your account. Rename, unpair or revoke them in BambooKit Desktop or the phone app."
    />
  );
  if (devices.error && !devices.data) {
    return (
      <>
        {header}
        <ErrorState error={devices.error} onRetry={devices.reload} />
      </>
    );
  }
  if (!devices.data) {
    return (
      <>
        {header}
        <LoadingState slow={devices.slow} />
      </>
    );
  }
  const desktops = devices.data.filter((d) => d.kind === "desktop");
  const mobiles = devices.data.filter((d) => d.kind === "mobile");
  return (
    <>
      {header}
      {devices.data.length === 0 ? (
        <EmptyState icon={<Monitor className="size-7" />} title="No devices yet" action={<ButtonLink href="/welcome/" variant="primary">Set up BambooKit</ButtonLink>}>
          Sign in to BambooKit Desktop on your PC with this account to add it here.
        </EmptyState>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-medium text-bk-muted">PCs · {desktops.length}</h2>
            {desktops.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {desktops.map((d) => (
                  <DeviceCard key={d.id} d={d} now={now} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-bk-faint">No PC yet. Install BambooKit Desktop and sign in.</p>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-sm font-medium text-bk-muted">Phones · {mobiles.length}</h2>
            {mobiles.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {mobiles.map((d) => (
                  <DeviceCard key={d.id} d={d} now={now} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-bk-faint">
                No phone yet. In BambooKit Desktop open the BambooKit menu → Add mobile device, then scan the QR code with the Android app.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
