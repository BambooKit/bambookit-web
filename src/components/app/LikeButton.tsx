"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cx } from "@/components/ui";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Session } from "@/lib/types";

/**
 * Like / unlike a session. Updates right away through `onChange` and rolls back if the
 * request fails. The server's answer (also sent as session.updated) is passed on too.
 */
export function LikeButton({
  session,
  onChange,
  className,
}: {
  session: Pick<Session, "id" | "starred" | "title">;
  onChange: (starred: boolean, server?: Session) => void;
  className?: string;
}) {
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const starred = !!session.starred;
  const label = starred ? "Unlike session" : "Like session";

  const toggle = async () => {
    if (busy) return;
    const next = !starred;
    setBusy(true);
    setError(null);
    onChange(next);
    try {
      const server = await apiRequest<Session>("PATCH", `/v1/sessions/${encodeURIComponent(session.id)}`, await getToken(), { body: { starred: next } });
      onChange(server?.starred ?? next, server ?? undefined);
    } catch (err) {
      onChange(starred);
      setError(err instanceof ApiError ? err.message : "Couldn't save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle();
      }}
      aria-pressed={starred}
      aria-label={error ? `${label}. ${error}` : label}
      title={error ? `Couldn't ${starred ? "unlike" : "like"}: ${error}` : label}
      disabled={busy}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-md p-1.5 transition-colors hover:bg-bk-raised disabled:cursor-wait",
        error ? "text-bk-warn" : starred ? "text-bk-err" : "text-bk-faint hover:text-bk-muted",
        className,
      )}
    >
      <Heart className={cx("size-4", starred && "fill-current")} />
    </button>
  );
}
