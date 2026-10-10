"use client";

import { useRef, useState } from "react";
import { CircleCheck, Eye, Laptop, Lock, SendHorizontal } from "lucide-react";
import { Button, Spinner, cx } from "@/components/ui";
import { InlineError } from "@/components/ErrorInfo";
import { LimitReached, QuotaNote, useFreeQuota } from "./PlanLimits";
import { apiRequestFull } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usePlan } from "@/lib/plan";
import type { Session } from "@/lib/types";

const TEXT_MAX = 20_000;

/**
 * Chat composer for a continued session (SEND_MESSAGE). Messages from the website count toward the
 * free daily allowance like the phone's; at 0 the input locks, and a 402 PLAN_LIMIT keeps the text.
 */
export function Composer({ session, pcName }: { session: Session; pcName: string }) {
  const { getToken } = useAuth();
  const { plan, bump, applyLimit } = usePlan();
  const quota = useFreeQuota("messages");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [limitResetsAt, setLimitResetsAt] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);

  const role = session.role ?? "owner";

  // Viewers are read-only; the owner can grant chat access.
  if (role === "viewer") {
    return (
      <div className="flex items-start gap-2 border-t border-bk-line bg-bk-bg/40 px-4 py-3 text-xs text-bk-muted">
        <Eye className="mt-0.5 size-3.5 shrink-0 text-bk-faint" />
        <span>View only — ask the owner for chat access.</span>
      </div>
    );
  }

  // The owner must continue the session on their PC once before it can be chatted in remotely.
  // Chat collaborators can't do that themselves, so the composer stays available for them.
  if (role === "owner" && !session.remote) {
    return (
      <div className="flex items-start gap-2 border-t border-bk-line bg-bk-bg/40 px-4 py-3 text-xs text-bk-muted">
        <Laptop className="mt-0.5 size-3.5 shrink-0 text-bk-faint" />
        <span>Press Continue on PC above once, then you can chat in this session from here.</span>
      </div>
    );
  }

  const locked = quota !== null && quota.left === 0;
  const resetsAt = limitResetsAt ?? plan?.resetsAt ?? null;
  const trimmed = text.trim();
  const tooLong = trimmed.length > TEXT_MAX;

  const send = async () => {
    if (!trimmed || tooLong || sending || locked) return;
    setSending(true);
    setError(null);
    setQueued(false);
    try {
      const res = await apiRequestFull<{ deviceOnline?: boolean } | null>("POST", `/v1/sessions/${encodeURIComponent(session.id)}/commands`, await getToken(), {
        body: { type: "SEND_MESSAGE", payload: { text: trimmed } },
      });
      bump("messages");
      setText("");
      setQueued(res?.deviceOnline === false);
      input.current?.focus();
    } catch (err) {
      const limit = applyLimit(err);
      if (limit) setLimitResetsAt(limit.resetsAt);
      else setError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      className="space-y-2 border-t border-bk-line bg-bk-bg/40 px-4 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      <div className={cx("flex items-end gap-2 rounded-lg border bg-bk-panel px-3 py-2", locked ? "border-bk-line opacity-80" : "border-bk-line focus-within:border-bk-muted")}>
        {locked && <Lock className="mb-1.5 size-4 shrink-0 text-bk-faint" aria-hidden="true" />}
        <textarea
          ref={input}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send();
            }
          }}
          disabled={locked}
          rows={Math.min(6, Math.max(1, text.split("\n").length))}
          aria-label="Message"
          placeholder={locked ? "Daily message limit reached" : `Message the agent on ${pcName}…`}
          className="max-h-48 min-h-6 flex-1 resize-none bg-transparent py-1 text-sm text-bk-fg placeholder:text-bk-faint focus:outline-none disabled:cursor-not-allowed"
        />
        <Button type="submit" variant="primary" className="px-3 py-1.5 text-xs" disabled={locked || sending || !trimmed || tooLong} aria-label="Send">
          {sending ? <Spinner className="size-3.5" /> : locked ? <Lock className="size-3.5" /> : <SendHorizontal className="size-3.5" />} Send
        </Button>
      </div>
      {locked ? (
        <LimitReached resetsAt={resetsAt}>{trimmed ? "Your message is kept here. Send it after the reset, or upgrade to send it now." : null}</LimitReached>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-bk-faint">
            {tooLong ? <span className="text-bk-err">Messages can be up to {TEXT_MAX.toLocaleString()} characters.</span> : "Enter to send, Shift+Enter for a new line."}
          </span>
          <QuotaNote metric="messages" noun="messages" />
        </div>
      )}
      {queued && (
        <p className="flex items-center gap-1.5 text-xs text-bk-muted">
          <CircleCheck className="size-3.5 text-bk-ok" /> {pcName} is offline. It gets the message when BambooKit on it reconnects.
        </p>
      )}
      <InlineError error={error} onRetry={() => void send()} />
    </form>
  );
}
