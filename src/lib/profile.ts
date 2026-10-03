"use client";

import { useEffect } from "react";
import { useResource } from "./api";
import { useRealtime } from "./realtime";
import type { Me } from "./types";

const PROFILE_EVENT = "bk:profile-changed";

/**
 * Tell every mounted useProfile() (e.g. the avatar in the header) that the profile changed.
 * Pass the new profile when known so it is applied without a refetch.
 */
export function notifyProfileChanged(profile?: Me | null): void {
  window.dispatchEvent(new CustomEvent<Me | null>(PROFILE_EVENT, { detail: profile ?? null }));
}

function isProfile(value: unknown): value is Me {
  return !!value && typeof value === "object" && typeof (value as Me).id === "string";
}

/** GET /v1/me, kept current by local changes in this tab and by 'profile.updated' from any device. */
export function useProfile() {
  const res = useResource<Me>("/v1/me");
  const { reload, setData } = res;
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Me | null>).detail;
      if (isProfile(detail)) setData((d) => ({ ...d, ...detail }));
      else reload();
    };
    window.addEventListener(PROFILE_EVENT, onChange);
    return () => window.removeEventListener(PROFILE_EVENT, onChange);
  }, [reload, setData]);
  useRealtime((e) => {
    if (e.type === "profile.updated") {
      if (isProfile(e.payload)) setData((d) => ({ ...d, ...(e.payload as Me) }));
      else reload();
    }
  });
  return res;
}

export const NICKNAME_MAX = 40;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const DELETE_CONFIRMATION = "DELETE MY ACCOUNT";
