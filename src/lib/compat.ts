"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiGet, safePath } from "./api";
import type { ApiMeta, Device } from "./types";

/**
 * Service info and desktop compatibility. GET /v1/meta tells which BambooKit Desktop release each
 * feature needs; GET /v1/devices tells which capabilities each PC has. Together they let the site say
 * "Update BambooKit Desktop" before a request fails with 426 DESKTOP_UPDATE_REQUIRED.
 */

/** Used when /v1/meta can't be read (older API or offline); mirrors the API's requirements. */
export const FALLBACK_REQUIREMENTS: ApiMeta["desktopRequirements"] = {
  providers: { capability: "relay.providers", since: "1.0.3", reason: "Listing AI providers and models from the phone needs the newer desktop." },
  todos: { capability: "relay.todos", since: "1.0.3", reason: "Showing the agent's todo list needs the newer desktop." },
  approval: { capability: "relay.approval", since: "1.0.3", reason: "Showing the full request (command, proposed diff) needs the newer desktop." },
  history: { capability: "relay.history", since: "1.0.3", reason: "Session history and before/after views need the newer desktop." },
  fileversions: { capability: "relay.fileversions", since: "1.0.3", reason: "Before/after file views need the newer desktop." },
  tree: { capability: "relay.tree", since: "1.0.2", reason: "Browsing project files needs the newer desktop." },
  file: { capability: "relay.file", since: "1.0.2", reason: "Viewing project files needs the newer desktop." },
};

let metaPromise: Promise<ApiMeta> | null = null;

/** GET /v1/meta once per page load (public, no sign-in). A failed read can be retried later. */
export function loadMeta(): Promise<ApiMeta> {
  if (!metaPromise) {
    metaPromise = apiGet<ApiMeta>("/v1/meta", null).catch((err) => {
      metaPromise = null;
      throw err;
    });
  }
  return metaPromise;
}

export function useMeta(): ApiMeta | null {
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  useEffect(() => {
    let alive = true;
    loadMeta()
      .then((m) => alive && setMeta(m))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return meta;
}

export interface PublicResource<T> {
  data: T | undefined;
  error: ApiError | null;
  loading: boolean;
  reload: () => void;
}

/** Load a public API path (no sign-in needed), e.g. /v1/releases/latest. */
export function usePublicResource<T>(path: string): PublicResource<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    apiGet<T>(path, null, ctrl.signal)
      .then((result) => {
        if (ctrl.signal.aborted) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (ctrl.signal.aborted || (err as Error)?.name === "AbortError") return;
        setError(err instanceof ApiError ? err : new ApiError(0, "UNKNOWN", (err as Error)?.message ?? "Something went wrong.", { method: "GET", path: safePath(path) }));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [path, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}

/** Compares dotted versions numerically ("1.0.10" > "1.0.9"). */
export function compareVersions(a: string | null | undefined, b: string | null | undefined): number {
  const pa = String(a ?? "0").split(/[.+-]/).map((x) => Number.parseInt(x, 10) || 0);
  const pb = String(b ?? "0").split(/[.+-]/).map((x) => Number.parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

export interface MissingFeature {
  feature: string;
  capability: string;
  since: string;
  reason: string;
}

/**
 * Features (of `features`) this desktop can't do yet. Unknown when the API doesn't report
 * capabilities (older API): then nothing is reported missing and the request decides.
 */
export function missingFeatures(device: Pick<Device, "kind" | "capabilities"> | null | undefined, features: string[], meta: ApiMeta | null): MissingFeature[] {
  if (!device || device.kind !== "desktop" || !Array.isArray(device.capabilities)) return [];
  const reqs = meta?.desktopRequirements ?? FALLBACK_REQUIREMENTS;
  const have = new Set(device.capabilities);
  return features.flatMap((feature) => {
    const r = reqs[feature];
    return r && !have.has(r.capability) ? [{ feature, ...r }] : [];
  });
}
