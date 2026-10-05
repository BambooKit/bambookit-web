import { ApiError, lastSeenApiVersion } from "./api";
import { WEB_VERSION } from "./config";
import type { ApiMeta } from "./types";

/**
 * Plain-language explanations and copyable technical details for the ⓘ view on error states.
 * Only request facts are included (method, path, status, code, request ID, versions); never tokens,
 * request bodies or response data.
 */

export type ErrorAction = "retry" | "refresh" | "signin" | "update-desktop";

export interface Explanation {
  what: string;
  why: string[];
  actions: ErrorAction[];
}

type Details = Record<string, unknown>;

function detailsOf(err: unknown): Details {
  const d = err instanceof ApiError ? err.details : undefined;
  return d && typeof d === "object" && !Array.isArray(d) ? (d as Details) : {};
}

function str(v: unknown): string | null {
  return typeof v === "string" && v ? v : typeof v === "number" ? String(v) : null;
}

export function errorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || "Something went wrong.";
  return "Something went wrong.";
}

export function explainError(err: unknown): Explanation {
  if (!(err instanceof ApiError)) {
    return {
      what: errorMessage(err),
      why: typeof err === "string" ? ["The website checked this in your browser before sending anything, or a step outside the BambooKit service failed."] : ["Something failed in your browser while handling the request."],
      actions: ["retry", "refresh"],
    };
  }
  const d = detailsOf(err);
  const status = err.status;
  const code = err.code;
  const what = err.message;

  if (code === "DESKTOP_UPDATE_REQUIRED") {
    const device = str(d.device) ?? "your PC";
    const current = str(d.currentVersion);
    const required = str(d.requiredVersion);
    return {
      what,
      why: [
        `${device} runs BambooKit Desktop ${current ? `v${current}` : "of an unknown version"}, and this feature needs ${required ? `v${required} or newer` : "a newer version"}.`,
        ...(str(d.reason) ? [String(d.reason)] : []),
        "Older desktops don't understand the newer request, so it wasn't sent to the PC.",
      ],
      actions: ["update-desktop", "retry"],
    };
  }
  if (code === "PAYMENT_PROVIDER_ERROR") {
    const hint = str(d.hint);
    const env = str(d.environment);
    return {
      what,
      why: [
        ...(hint ? [hint] : []),
        `The payment provider (Cashfree${env ? `, ${env}` : ""}) rejected or didn't answer the checkout request. Nothing was charged.`,
        ...(str(d.providerMessage) ? [`Cashfree said: ${String(d.providerMessage)}`] : []),
      ],
      actions: ["retry"],
    };
  }
  if (code === "PLAN_LIMIT") {
    return {
      what,
      why: ["The free plan's daily allowance for this is used up. It resets at midnight in your time zone.", "Pro removes the daily limits."],
      actions: ["refresh"],
    };
  }
  if (code === "ROUTE_NOT_FOUND") {
    const api = str(d.apiVersion) ?? err.apiVersion;
    return {
      what: "The BambooKit service doesn't know this request.",
      why: [
        `The website (v${WEB_VERSION}) and the BambooKit service${api ? ` (API ${api})` : ""} may be different versions: one was updated before the other.`,
        "A cached copy of the website may be out of date.",
      ],
      actions: ["refresh", "retry"],
    };
  }
  if (code === "NETWORK" || status === 0) {
    return {
      what,
      why: [
        "Your device may be offline or on a network that blocks the BambooKit service.",
        "The hosted service may be starting up after a quiet period (this can take up to a minute) or briefly unavailable.",
        "A browser extension (ad or privacy blocker) may have blocked the request.",
      ],
      actions: ["retry", "refresh"],
    };
  }
  if (code === "DESKTOP_OFFLINE") {
    return { what, why: ["BambooKit Desktop on that PC is closed, the PC is asleep or off, or it lost its internet connection.", "This information is stored on the PC and is read live from it."], actions: ["retry"] };
  }
  if (code === "DESKTOP_TIMEOUT") {
    return { what, why: ["The PC is online but busy or on a slow connection.", "Large projects take longer to read."], actions: ["retry"] };
  }
  if (code === "DESKTOP_ERROR") {
    return { what, why: ["BambooKit Desktop on your PC received the request but couldn't complete it (for example, a file was moved or deleted)."], actions: ["retry"] };
  }
  if (status === 401 || code === "UNAUTHORIZED" || code === "INVALID_TOKEN") {
    return { what, why: ["Your sign-in expired or was signed out on another device."], actions: ["signin", "refresh"] };
  }
  if (status === 403) {
    return { what, why: ["Your account doesn't have access to this item, or the device it belongs to was revoked."], actions: ["refresh"] };
  }
  if (code === "NO_RELEASE") {
    return { what, why: ["No release has been published for this platform yet."], actions: ["retry"] };
  }
  if (code === "UPDATE_SOURCE_UNAVAILABLE" || code === "INVALID_RELEASE") {
    return { what, why: ["The BambooKit service reads releases from GitHub, which didn't answer or returned an unexpected release."], actions: ["retry"] };
  }
  if (status === 404) {
    return { what, why: ["It was deleted, for example on your PC.", "The link may be from another account or out of date."], actions: ["refresh"] };
  }
  if (status === 409) {
    return { what, why: ["It was changed at the same time on another device, or it was already answered."], actions: ["refresh", "retry"] };
  }
  if (status === 400 || status === 413 || status === 422) {
    return { what, why: ["The service didn't accept what was sent. The website may be older than the service; refreshing loads the newest version."], actions: ["refresh", "retry"] };
  }
  if (status === 429) {
    return { what, why: ["Too many requests in a short time. Wait a moment."], actions: ["retry"] };
  }
  if (status >= 500) {
    return { what, why: ["The BambooKit service had a problem or is restarting. It is usually temporary."], actions: ["retry", "refresh"] };
  }
  return { what, why: ["The BambooKit service couldn't complete the request."], actions: ["retry", "refresh"] };
}

/** Technical facts as label/value rows. */
export function technicalRows(err: unknown, meta: ApiMeta | null): Array<[string, string]> {
  const rows: Array<[string, string]> = [];
  const add = (label: string, value: unknown) => {
    const v = str(value);
    if (v) rows.push([label, v]);
  };
  if (err instanceof ApiError) {
    const d = detailsOf(err);
    if (err.method || err.path) rows.push(["Request", `${err.method ?? "?"} ${err.path ?? "?"}`]);
    rows.push(["Status", err.status ? String(err.status) : "no response"]);
    add("Code", err.code);
    add("Request ID", err.requestId);
    add("Time", err.at);
    add("Website version", WEB_VERSION);
    add("API version", err.apiVersion ?? str(d.apiVersion) ?? lastSeenApiVersion() ?? meta?.apiVersion ?? "unknown");
    add("API protocol", str(d.apiProtocol) ?? (meta ? String(meta.protocol) : null));
    if (err.code === "DESKTOP_UPDATE_REQUIRED") {
      add("Device", d.device);
      add("Desktop version", d.currentVersion ?? "unknown");
      add("Required version", d.requiredVersion);
      add("Capability", d.capability);
      add("Desktop protocol", d.desktopProtocol);
    }
    if (err.code === "PAYMENT_PROVIDER_ERROR") {
      add("Provider status", d.providerStatus);
      add("Provider code", d.providerCode);
      add("Provider type", d.providerType);
      add("Provider message", d.providerMessage);
      add("Environment", d.environment);
      add("Hint", d.hint);
    }
    if (err.code === "PLAN_LIMIT") {
      add("Limit", d.limit);
      add("Max", d.max);
      add("Used", d.used);
      add("Resets at", d.resetsAt);
    }
    if (err.code === "ROUTE_NOT_FOUND") {
      add("Route", d.method && d.path ? `${d.method} ${d.path}` : null);
    }
  } else {
    add("Error", errorMessage(err));
    add("Time", new Date().toISOString());
    add("Website version", WEB_VERSION);
    add("API version", lastSeenApiVersion() ?? meta?.apiVersion ?? "unknown");
  }
  if (typeof navigator !== "undefined") add("Browser", navigator.userAgent);
  return rows;
}

export function diagnosticsText(err: unknown, meta: ApiMeta | null): string {
  const ex = explainError(err);
  const lines = ["BambooKit error details", "", `What happened: ${ex.what}`, "", "Why it may have happened:", ...ex.why.map((w) => `- ${w}`), "", "Technical details:"];
  for (const [k, v] of technicalRows(err, meta)) lines.push(`${k}: ${v}`);
  return lines.join("\n");
}
