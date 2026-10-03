"use client";

import { useEffect } from "react";
import { useResource } from "./api";
import type { Me } from "./types";

const PROFILE_EVENT = "bk:profile-changed";

/** Tell every mounted useProfile() (e.g. the avatar in the header) to reload GET /v1/me. */
export function notifyProfileChanged(): void {
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

/** GET /v1/me, reloaded when the profile changes in this tab. */
export function useProfile() {
  const res = useResource<Me>("/v1/me");
  const { reload } = res;
  useEffect(() => {
    window.addEventListener(PROFILE_EVENT, reload);
    return () => window.removeEventListener(PROFILE_EVENT, reload);
  }, [reload]);
  return res;
}

export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const DELETE_CONFIRMATION = "DELETE MY ACCOUNT";
