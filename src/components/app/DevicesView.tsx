"use client";

import { Monitor, Smartphone } from "lucide-react";
import { ButtonLink, Card, EmptyState, ErrorState, LoadingState, OnlineDot, PageHeader } from "@/components/ui";
import { useLiveDevices, useNow } from "@/lib/live";
import { FALLBACK_REQUIREMENTS, useMeta } from "@/lib/compat";
import { DesktopUpdateNotice } from "./DesktopUpdateNotice";
import { fullDate, timeAgo } from "@/lib/format";
import type { Device } from "@/lib/types";

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
