"use client";

import { Download, ExternalLink, Monitor, RefreshCw, Smartphone } from "lucide-react";
import { RichText } from "@/components/app/RichText";
import { InlineError } from "@/components/ErrorInfo";
import { Button, Card, Pill, Spinner, cx } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { compareVersions, usePublicResource } from "@/lib/compat";
import { fullDate } from "@/lib/format";
import type { Device, Release, ReleasePlatform } from "@/lib/types";

const PLATFORM: Record<ReleasePlatform, { name: string; icon: typeof Monitor; file: string }> = {
  windows: { name: "BambooKit Desktop for Windows", icon: Monitor, file: "installer" },
  android: { name: "BambooKit for Android", icon: Smartphone, file: "APK" },
};

function releaseError(err: ApiError, platform: ReleasePlatform): string {
  if (err.code === "NO_RELEASE") return `No ${platform === "android" ? "Android" : "Windows"} release has been published yet.`;
  if (err.code === "UPDATE_SOURCE_UNAVAILABLE") return "The release server couldn't be reached, so the latest version isn't known right now. Try again in a moment.";
  if (err.code === "ROUTE_NOT_FOUND") return "The BambooKit service doesn't offer release information yet.";
  if (err.status === 0) return "Can't reach the BambooKit service to check the latest version.";
  return `Couldn't check the latest version. ${err.message}`;
}

function size(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function day(iso: string | null): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : new Date(t).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function ReleaseCard({ platform, desktops }: { platform: ReleasePlatform; desktops?: Device[] }) {
  const res = usePublicResource<Release>(`/v1/releases/latest?platform=${platform}`);
  const p = PLATFORM[platform];
  const Icon = p.icon;
  const r = res.data;
  return (
    <Card className="flex min-w-0 flex-col p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-bk-line bg-bk-raised text-bk-muted">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-bk-fg">{p.name}</div>
          {r ? (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-bk-muted">
              <span className="font-mono text-bk-fg">v{r.version}</span>
              {r.publishedAt && <span title={fullDate(r.publishedAt)}>released {day(r.publishedAt)}</span>}
            </div>
          ) : res.loading ? (
            <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-bk-faint">
              <Spinner className="size-3" /> Checking the latest version…
            </div>
          ) : null}
        </div>
        {res.loading && r && <Spinner className="size-3.5 text-bk-faint" />}
      </div>

      {res.error && !r && (
        <InlineError className="mt-4" error={res.error} message={releaseError(res.error, platform)} onRetry={res.reload} />
      )}
      {res.error && !r && (
        <div className="mt-3">
          <Button className="px-3 py-1.5 text-xs" onClick={res.reload}>
            <RefreshCw className="size-3.5" /> Retry
          </Button>
        </div>
      )}

      {r && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {r.download ? (
              <a
                href={r.download.url}
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-bk-accent px-4 py-2 text-sm font-medium text-bk-bg hover:opacity-90"
              >
                <Download className="size-4" /> Download {p.file}
                <span className="text-xs opacity-75">{size(r.download.size)}</span>
              </a>
            ) : (
              <span className="text-xs text-bk-faint">This release has no {p.file} file attached. Open the release page to get it.</span>
            )}
            <a
              href={r.url}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-bk-line bg-bk-panel px-4 py-2 text-sm font-medium text-bk-fg hover:bg-bk-raised"
            >
              <ExternalLink className="size-4" /> Release page
            </a>
          </div>
          {r.download && <div className="mt-1.5 truncate font-mono text-[11px] text-bk-faint">{r.download.name}</div>}

          {desktops && desktops.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-bk-line pt-3 text-xs">
              {desktops.map((d) => {
                const behind = d.appVersion ? compareVersions(d.appVersion, r.version) < 0 : null;
                return (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-bk-muted">
                      {d.name} <span className="font-mono text-bk-faint">{d.appVersion ? `v${d.appVersion}` : "version unknown"}</span>
                    </span>
                    {behind === null ? (
                      <Pill>Unknown</Pill>
                    ) : behind ? (
                      <Pill tone="warn">Update available</Pill>
                    ) : (
                      <Pill tone="ok">Up to date</Pill>
                    )}
                  </li>
                );
              })}
              <li className="text-bk-faint">BambooKit Desktop updates itself when it starts; you can also run the installer above.</li>
            </ul>
          )}

          {r.notes.trim() ? (
            <details className="group mt-4 rounded-lg border border-bk-line bg-bk-bg/50">
              <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-bk-muted hover:text-bk-fg">
                <span className="group-open:hidden">Show release notes</span>
                <span className="hidden group-open:inline">Hide release notes</span>
              </summary>
              <div className="max-h-80 overflow-y-auto border-t border-bk-line px-3 py-2 text-sm">
                <RichText text={r.notes} />
              </div>
            </details>
          ) : (
            <p className="mt-4 text-xs text-bk-faint">No release notes for this version.</p>
          )}
        </>
      )}
    </Card>
  );
}

/** Latest BambooKit releases from GET /v1/releases/latest (public). */
export function LatestReleases({ desktops, className }: { desktops?: Device[]; className?: string }) {
  return (
    <div className={cx("grid gap-4 md:grid-cols-2", className)}>
      <ReleaseCard platform="windows" desktops={desktops} />
      <ReleaseCard platform="android" />
    </div>
  );
}
