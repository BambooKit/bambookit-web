"use client";

import { Fragment, type ReactNode } from "react";
import { CodeBlock } from "@/components/site/CodeBlock";
import { DownloadButton, LatestReleases } from "@/components/Releases";
import { INSTALL_COMMAND, MAC_INSTALL_COMMAND } from "@/lib/config";
import { useVisitorOS, type MacArch, type VisitorOS } from "@/lib/os";
import type { ReleasePlatform } from "@/lib/types";

const NAMES: Record<ReleasePlatform, string> = { windows: "Windows", mac: "Mac", linux: "Linux", android: "Android" };
const ALL: ReleasePlatform[] = ["windows", "mac", "linux", "android"];

/** The visitor's OS as a release platform, or null for iOS / unknown. */
function platformOf(os: VisitorOS): ReleasePlatform | null {
  return os === "windows" || os === "mac" || os === "linux" || os === "android" ? os : null;
}

/** Hero download order: the visitor's platform first, then Mac, Windows, Android, Linux. */
const HERO_ORDER: ReleasePlatform[] = ["mac", "windows", "android", "linux"];

function heroLabel(p: ReleasePlatform, macArch: MacArch) {
  if (p === "mac") return macArch === "intel" ? "Download for Mac (Intel)" : "Download for Mac";
  if (p === "android") return "Download for Android";
  return `Download for ${NAMES[p]}`;
}

/**
 * The hero's downloads: Mac, Windows and Android (and Linux) are always on the page; the visitor's own platform is
 * first and highlighted, with its one-line install command underneath.
 */
export function HeroDownload() {
  const { os, macArch } = useVisitorOS();
  const mine = platformOf(os);
  const order = mine ? [mine, ...HERO_ORDER.filter((p) => p !== mine)] : HERO_ORDER;
  const command = mine === "mac" ? MAC_INSTALL_COMMAND : mine === "windows" ? INSTALL_COMMAND : null;

  return (
    <div className="mt-8 max-w-2xl">
      <div className="flex flex-wrap gap-3">
        {order.map((p) => (
          <DownloadButton
            key={p}
            platform={p}
            label={heroLabel(p, macArch)}
            macArch={macArch}
            primary={mine ? p === mine : p === "mac" || p === "windows"}
            alternate={p === mine}
          />
        ))}
      </div>
      {command && <CodeBlock code={command} label={mine === "mac" ? "Or install from Terminal" : "Or install from PowerShell"} />}
    </div>
  );
}

/** Children keyed by platform, with the visitor's OS first (fixed order until it is known). */
export function ByVisitorOS({ items, className }: { items: Record<ReleasePlatform, ReactNode>; className?: string }) {
  const mine = platformOf(useVisitorOS().os);
  const order = mine ? [mine, ...ALL.filter((p) => p !== mine)] : ALL;
  return (
    <div className={className}>
      {order.map((p) => (
        <Fragment key={p}>{items[p]}</Fragment>
      ))}
    </div>
  );
}

/** LatestReleases with the visitor's OS first. */
export function LatestReleasesForVisitor({ className }: { className?: string }) {
  return <LatestReleases className={className} first={platformOf(useVisitorOS().os)} />;
}
