"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { API_URL } from "./config";
import { useAuth } from "./auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Call a BambooKit API path and unwrap `{ data }`. Errors become ApiError with the API's code and message. */
export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  token: string | null,
  options: { body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  let res: Response;
  const hasBody = options.body !== undefined;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      signal: options.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK", "Can't reach the BambooKit service. Check your connection and try again.");
  }
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
    throw new ApiError(res.status, code, message);
  }
  return body?.data as T;
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
        setError(err instanceof ApiError ? err : new ApiError(0, "UNKNOWN", (err as Error)?.message ?? "Something went wrong."));
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
