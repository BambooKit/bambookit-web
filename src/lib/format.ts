/** Small formatting helpers. */

export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "never";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "unknown";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return new Date(t).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function fullDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : new Date(t).toLocaleString();
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Ensure an internal path ends with "/" (the static export uses trailing slashes). */
export function withSlash(href: string): string {
  if (!href.startsWith("/")) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const rest = cut === -1 ? "" : href.slice(cut);
  return (path.endsWith("/") ? path : `${path}/`) + rest;
}

/** Milliseconds since the epoch for an ISO string or epoch number (seconds are accepted too), else NaN. */
export function toMs(t: string | number | null | undefined): number {
  if (t === null || t === undefined || t === "") return NaN;
  if (typeof t === "number") return t < 1e12 ? t * 1000 : t;
  if (/^\d+$/.test(t)) return toMs(Number(t));
  return Date.parse(t);
}

/** "1 h 5 min", "3 min 20 s", "12 s". */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms) || ms < 0) return "";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 ? `${m} min ${s % 60} s` : `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}

/** Local date and time for a history timestamp, or "" when it is missing. */
export function dateTime(t: string | number | null | undefined): string {
  const ms = toMs(t);
  return Number.isNaN(ms) ? "" : new Date(ms).toLocaleString();
}

/** Local time of day (with the date when it is not today), or "". */
export function clockTime(t: string | number | null | undefined, now = Date.now()): string {
  const ms = toMs(t);
  if (Number.isNaN(ms)) return "";
  const d = new Date(ms);
  const sameDay = new Date(now).toDateString() === d.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
