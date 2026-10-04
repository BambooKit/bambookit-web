"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { API_URL, CLIENT_HEADER } from "./config";
import { useAuth } from "./auth";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Request facts kept with an error for the ⓘ diagnostics. Never holds tokens or request bodies. */
export interface ApiErrorContext {
  method?: string;
  /** API path without query values that could be sensitive. */
  path?: string;
  requestId?: string | null;
  /** From the X-BambooKit-API response header. */
  apiVersion?: string | null;
  details?: unknown;
  at?: string;
}

export class ApiError extends Error {
  method?: string;
  path?: string;
  requestId?: string | null;
  apiVersion?: string | null;
  details?: unknown;
  at: string;
  constructor(
    public status: number,
    public code: string,
    message: string,
    context: ApiErrorContext = {},
  ) {
    super(message);
    this.method = context.method;
    this.path = context.path;
    this.requestId = context.requestId ?? null;
    this.apiVersion = context.apiVersion ?? null;
    this.details = context.details;
    this.at = context.at ?? new Date().toISOString();
  }
}

/** The API version from the most recent response (X-BambooKit-API), for diagnostics. */
let lastApiVersion: string | null = null;
export function lastSeenApiVersion(): string | null {
  return lastApiVersion;
}

const SECRET_PARAM = /^(token|access_token|refresh_token|code|key|signature|sig|password|secret)$/i;

/** The path with any credential-like query values replaced, safe to show and copy. */
export function safePath(path: string): string {
  const q = path.indexOf("?");
  if (q === -1) return path;
  const params = new URLSearchParams(path.slice(q + 1));
  for (const k of [...params.keys()]) if (SECRET_PARAM.test(k)) params.set(k, "[hidden]");
  const rest = params.toString();
  return rest ? `${path.slice(0, q)}?${decodeURIComponent(rest)}` : path.slice(0, q);
}

/** Call a BambooKit API path and unwrap `{ data }`. Errors become ApiError with the API's code and message. */
export async function apiRequest<T>(method: Method, path: string, token: string | null, options: { body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const body = await apiRequestFull<{ data: T }>(method, path, token, options);
  return body?.data as T;
}

/** Like apiRequest, but returns the whole JSON body (e.g. `{ data, deviceOnline }`). */
export async function apiRequestFull<T>(method: Method, path: string, token: string | null, options: { body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  let res: Response;
  const hasBody = options.body !== undefined;
  const ctx: ApiErrorContext = { method, path: safePath(path), apiVersion: lastApiVersion };
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...CLIENT_HEADER,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      signal: options.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK", "Can't reach the BambooKit service. Check your connection and try again.", ctx);
  }
  const version = res.headers.get("X-BambooKit-API");
  if (version) lastApiVersion = version;
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON response (e.g. a proxy error page).
  }
  if (!res.ok || body?.error) {
    const code = body?.error?.code ?? (res.status === 401 ? "UNAUTHORIZED" : `HTTP_${res.status}`);
    const message =
      body?.error?.message ??
      (res.status === 401 ? "Your sign-in has expired. Sign in again." : `The BambooKit service answered with an error (${res.status}).`);
    throw new ApiError(res.status, code, message, {
      ...ctx,
      apiVersion: version,
      requestId: body?.requestId ?? res.headers.get("X-Request-Id"),
      details: body?.error?.details,
    });
  }
  return body as T;
}

/** GET a BambooKit API path and unwrap `{ data }`. */
export function apiGet<T>(path: string, token: string | null, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>("GET", path, token, { signal });
}

export interface Resource<T> {
  data: T | undefined;
  error: ApiError | null;
  loading: boolean;
  /** True when the request has been pending for a while (the hosted API may be waking up). */
  slow: boolean;
  reload: () => void;
  setData: Dispatch<SetStateAction<T | undefined>>;
}

/** Load an authenticated API resource. Pass null to skip. `reload()` refetches without clearing data. */
export function useResource<T>(path: string | null): Resource<T> {
  const { getToken, status } = useAuth();
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [slow, setSlow] = useState(false);
  const [tick, setTick] = useState(0);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!path || status !== "signedIn") return;
    if (lastPath.current !== path) {
      lastPath.current = path;
      setData(undefined);
    }
    const ctrl = new AbortController();
    setLoading(true);
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 4000);
    (async () => {
      try {
        const token = await getToken();
        const result = await apiGet<T>(path, token, ctrl.signal);
        if (ctrl.signal.aborted) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (ctrl.signal.aborted || (err as Error)?.name === "AbortError") return;
        setError(err instanceof ApiError ? err : new ApiError(0, "UNKNOWN", (err as Error)?.message ?? "Something went wrong.", { method: "GET", path: safePath(path) }));
      } finally {
        clearTimeout(slowTimer);
        if (!ctrl.signal.aborted) {
          setLoading(false);
          setSlow(false);
        }
      }
    })();
    return () => {
      clearTimeout(slowTimer);
      ctrl.abort();
    };
  }, [path, status, tick, getToken]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, slow, reload, setData };
}
