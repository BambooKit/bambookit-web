"use client";

import Link from "next/link";
import { MonitorUp } from "lucide-react";
import { Notice } from "@/components/ui";
import { compareVersions, missingFeatures, useMeta } from "@/lib/compat";
import type { Device } from "@/lib/types";

/**
 * Says in advance that a PC needs a newer BambooKit Desktop for some features, based on the
 * capabilities the PC reported. Renders nothing when the PC has them all (or doesn't report any).
 */
export function DesktopUpdateNotice({ device, features, className }: { device: Device | null | undefined; features: string[]; className?: string }) {
  const meta = useMeta();
  const missing = missingFeatures(device, features, meta);
  if (!device || missing.length === 0) return null;
  const required = missing.map((m) => m.since).reduce((a, b) => (compareVersions(a, b) >= 0 ? a : b));
  const reasons = [...new Set(missing.map((m) => m.reason))];
  return (
    <Notice tone="warn" icon={<MonitorUp className="size-4" />} className={className}>
      <div className="font-medium">Update BambooKit Desktop on {device.name}</div>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
        {reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="mt-1.5 text-xs">
        {device.name} runs {device.appVersion ? `v${device.appVersion}` : "an older version"}; these need v{required} or newer.{" "}
        <Link href="/docs/updates/" className="underline underline-offset-2">
          How to update
        </Link>
        {" · "}
        <Link href="/account/#downloads" className="underline underline-offset-2">
          Latest version
        </Link>
      </p>
    </Notice>
  );
}
