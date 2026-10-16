"use client";

import { Fragment, type ReactNode } from "react";
import { CodeBlock } from "@/components/site/CodeBlock";
import { DownloadButton, LatestReleases } from "@/components/Releases";
import { INSTALL_COMMAND, MAC_INSTALL_COMMAND } from "@/lib/config";
import { useVisitorOS, type VisitorOS } from "@/lib/os";
import type { ReleasePlatform } from "@/lib/types";

const NAMES: Record<ReleasePlatform, string> = { windows: "Windows", mac: "Mac", linux: "Linux", android: "Android" };
const ALL: ReleasePlatform[] = ["windows", "mac", "linux", "android"];

/** The visitor's OS as a release platform, or null for iOS / unknown. */
function platformOf(os: VisitorOS): ReleasePlatform | null {
  return os === "windows" || os === "mac" || os === "linux" || os === "android" ? os : null;
}

function OtherPlatforms({ skip }: { skip: ReleasePlatform[] }) {
  const others = ALL.filter((p) => !skip.includes(p));
  return (
    <p className="mt-3 text-sm text-bk-faint">
      Other platforms:{" "}
      {others.map((p, i) => (
        <Fragment key={p}>
          {i > 0 && " · "}
          <a href="#install" className="text-bk-muted hover:text-bk-fg">
            {NAMES[p]}
          </a>
        </Fragment>
      ))}
    </p>
  );
}

/** The hero's download: one button for the visitor's OS (Windows and Mac when it's unknown or iOS). */
export function HeroDownload() {
  const { os, macArch } = useVisitorOS();
  const mine = platformOf(os);

  if (!mine) {
    return (
      <div className="mt-8">
        <div className="flex flex-wrap gap-3">
          <DownloadButton platform="windows" />
          <DownloadButton platform="mac" alternate={false} />
        </div>
        <OtherPlatforms skip={["windows", "mac"]} />
      </div>
    );
  }

  const label =
    mine === "mac"
      ? `Download for Mac (${macArch === "intel" ? "Intel" : "Apple Silicon"})`
      : mine === "android"
        ? "Download the Android app"
        : `Download for ${NAMES[mine]}`;
  const command = mine === "mac" ? MAC_INSTALL_COMMAND : mine === "windows" ? INSTALL_COMMAND : null;

  return (
    <div className="mt-8 max-w-xl">
      <DownloadButton platform={mine} label={label} macArch={macArch} />
      {command && <CodeBlock code={command} label={mine === "mac" ? "Or in Terminal" : "Or in PowerShell"} />}
      <OtherPlatforms skip={[mine]} />
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
