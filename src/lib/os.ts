"use client";

import { useEffect, useState } from "react";

/** The visitor's operating system, as far as the browser tells us. */
export type VisitorOS = "windows" | "mac" | "linux" | "android" | "ios" | "unknown";

/** Mac CPU: "arm" (Apple Silicon), "intel", or null when the browser doesn't say. */
export type MacArch = "arm" | "intel" | null;

export interface Visitor {
  os: VisitorOS;
  macArch: MacArch;
  /** False on the server and the first client render (both show the neutral default). */
  ready: boolean;
}

/** navigator.userAgentData (Chromium only; not in TypeScript's DOM types yet). */
interface UAData {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
}

function uaData(): UAData | undefined {
  return (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
}

/** Detects the OS. Call only in the browser. */
export function detectOS(): VisitorOS {
  const platform = uaData()?.platform?.toLowerCase() ?? "";
  if (platform) {
    if (platform.includes("android")) return "android";
    if (platform.includes("ios")) return "ios";
    if (platform.includes("win")) return "windows";
    if (platform.includes("mac")) return "mac";
    if (platform.includes("chrome os") || platform.includes("chromeos")) return "unknown";
    if (platform.includes("linux")) return "linux";
  }
  const ua = navigator.userAgent ?? "";
  const plat = navigator.platform ?? "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || /iphone|ipad|ipod/i.test(plat)) return "ios";
  // iPadOS reports a Mac user agent; a Mac has no touch screen.
  if (/mac/i.test(plat + ua)) return navigator.maxTouchPoints > 1 ? "ios" : "mac";
  if (/win/i.test(plat + ua)) return "windows";
  if (/cros/i.test(ua)) return "unknown";
  if (/linux|x11/i.test(plat + ua)) return "linux";
  return "unknown";
}

/** Apple Silicon or Intel, when the browser reports the CPU architecture (Chromium); otherwise null. */
export async function detectMacArch(): Promise<MacArch> {
  try {
    const values = await uaData()?.getHighEntropyValues?.(["architecture"]);
    const arch = values?.architecture?.toLowerCase() ?? "";
    if (arch.startsWith("arm")) return "arm";
    if (arch.startsWith("x86")) return "intel";
  } catch {
    // Not allowed or not supported.
  }
  return null;
}

const NEUTRAL: Visitor = { os: "unknown", macArch: null, ready: false };

/**
 * The visitor's OS (and Mac CPU). Renders the neutral default first, so server/static HTML and the first
 * client render match, then updates after mount.
 */
export function useVisitorOS(): Visitor {
  const [visitor, setVisitor] = useState<Visitor>(NEUTRAL);
  useEffect(() => {
    let alive = true;
    const os = detectOS();
    setVisitor({ os, macArch: null, ready: true });
    if (os === "mac") detectMacArch().then((macArch) => alive && macArch && setVisitor({ os, macArch, ready: true }));
    return () => {
      alive = false;
    };
  }, []);
  return visitor;
}
