"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Check, CheckCheck, CircleHelp, ShieldAlert, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { Button, EmptyState, ErrorState, LoadingState, Notice, PageHeader, Pill, Spinner, cx } from "@/components/ui";
import { ApiError, apiRequestFull, useResource } from "@/lib/api";
import { InlineError } from "@/components/ErrorInfo";
import { useAuth } from "@/lib/auth";
import { useRealtime } from "@/lib/realtime";
import { useNow } from "@/lib/live";
import { fullDate, timeAgo } from "@/lib/format";
import type { Approval, ApprovalResolver, Question } from "@/lib/types";

export function approvalTone(status: string): "warn" | "ok" | "err" | "neutral" {
  const s = status.toUpperCase();
  if (s === "PENDING" || s === "RESPONDING") return "warn";
  if (s === "APPROVED" || s === "ANSWERED") return "ok";
  if (s === "REJECTED") return "err";
  return "neutral";
}

/** How a resolved request was answered, worded for a sentence ("approved on your PC"). */
export function resolverLabel(by: ApprovalResolver | null | undefined): string | null {
  switch (by) {
    case "phone":
      return "on your phone";
    case "web":
      return "from the web";
    case "pc":
      return "on your PC";
    case "auto":
      return "automatically";
    default:
      return null;
  }
}

export function isQuestion(a: Approval): boolean {
  return a.kind === "question";
}

/** Short status label, worded for the kind of request. */
export function approvalStatusLabel(a: Approval): string {
  const s = a.status.toUpperCase();
  if (s === "PENDING") return isQuestion(a) ? "needs an answer" : "waiting";
  if (s === "RESPONDING") return "sending to PC";
  if (isQuestion(a)) return s === "APPROVED" || s === "ANSWERED" ? "answered" : s === "REJECTED" ? "dismissed" : s.toLowerCase();
  if (s === "APPROVED") return a.resolvedBy === "auto" ? "auto-approved" : a.reply === "always" ? "always allowed" : "approved";
  if (s === "REJECTED") return "rejected";
  return s.toLowerCase();
}

/** One-line summary of a request, for lists and the timeline. */
export function approvalSummary(a: Approval): string {
  if (isQuestion(a)) return a.questions?.[0]?.question || a.title || "Question from the agent";
  return a.title || a.permission;
}

function friendlyError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === "APPROVAL_NOT_PENDING") return "This request was already answered, possibly on another device.";
    return err.message;
  }
  return (err as Error)?.message || "Something went wrong. Try again.";
}

function Patterns({ patterns }: { patterns: string[] }) {
  if (patterns.length === 0) return null;
  return (
    <div className="mt-2">
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-bk-faint">Applies to</div>
      <div className="flex flex-wrap gap-1.5">
        {patterns.map((p, i) => (
          <code key={i} className="max-w-full break-all rounded border border-bk-line bg-bk-bg px-1.5 py-0.5 font-mono text-[11px] text-bk-muted">
            {p}
          </code>
        ))}
      </div>
    </div>
  );
}

/** The answers given to a question request, read only. */
function AnsweredQuestions({ questions, answers }: { questions: Question[]; answers: string[][] }) {
  const count = Math.max(questions.length, answers.length);
  return (
    <div className="mt-2 space-y-2.5">
      {Array.from({ length: count }, (_, i) => {
        const q = questions[i];
        const given = answers[i] ?? [];
        return (
          <div key={i}>
            {q?.header && <div className="text-[11px] font-medium uppercase tracking-wide text-bk-faint">{q.header}</div>}
            {q?.question && <p className="whitespace-pre-wrap break-words text-sm text-bk-fg">{q.question}</p>}
            <div className="mt-1 flex flex-wrap gap-1.5">
              {given.length === 0 ? (
                <span className="text-xs text-bk-faint">No answer</span>
              ) : (
                given.map((g, j) => (
                  <span key={j} className="inline-flex max-w-full items-center gap-1 break-words rounded-md border border-bk-ok/30 bg-bk-ok/5 px-2 py-0.5 text-xs text-bk-ok">
                    <Check className="size-3 shrink-0" /> {g}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Shows what each question asks; used when the request can't be answered from here. */
function QuestionList({ questions }: { questions: Question[] }) {
  return (
    <div className="mt-2 space-y-2.5">
      {questions.map((q, i) => (
        <div key={i}>
          {q.header && <div className="text-[11px] font-medium uppercase tracking-wide text-bk-faint">{q.header}</div>}
          <p className="whitespace-pre-wrap break-words text-sm text-bk-fg">{q.question}</p>
          {(q.options?.length ?? 0) > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs text-bk-muted">
              {q.options!.map((o, j) => (
                <li key={j}>
                  {o.label}
                  {o.description && <span className="text-bk-faint"> — {o.description}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

interface QuestionDraft {
  selected: string[];
  custom: string;
}

function draftAnswer(q: Question, d: QuestionDraft): string[] {
  const custom = d.custom.trim();
  const allowCustom = q.custom !== false || (q.options?.length ?? 0) === 0;
  const out = [...d.selected];
  if (allowCustom && custom) {
    if (q.multiple) out.push(custom);
    else return [custom];
  }
  return out;
}

function QuestionForm({
  questions,
  busy,
  onSubmit,
  onDismiss,
}: {
  questions: Question[];
  busy: "answer" | "reject" | null;
  onSubmit: (answers: string[][]) => void;
  onDismiss: () => void;
}) {
  const [drafts, setDrafts] = useState<QuestionDraft[]>(() => questions.map(() => ({ selected: [], custom: "" })));
  const [tried, setTried] = useState(false);
  const uid = useId();
  const answers = questions.map((q, i) => draftAnswer(q, drafts[i] ?? { selected: [], custom: "" }));
  const missing = answers.map((a) => a.length === 0);
  const anyMissing = missing.some(Boolean);

  const update = (i: number, fn: (d: QuestionDraft) => QuestionDraft) => setDrafts((list) => list.map((d, j) => (j === i ? fn(d) : d)));

  return (
    <form
      className="mt-3 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!anyMissing && !busy) onSubmit(answers);
      }}
    >
      {questions.map((q, i) => {
        const d = drafts[i] ?? { selected: [], custom: "" };
        const options = q.options ?? [];
        const allowCustom = q.custom !== false || options.length === 0;
        const name = `${uid}-q${i}`;
        const invalid = tried && missing[i];
        return (
          <fieldset key={i} className={cx("rounded-lg border p-3", invalid ? "border-bk-err/50" : "border-bk-line")} disabled={!!busy}>
            <legend className="px-1">
              {q.header && <span className="text-[11px] font-medium uppercase tracking-wide text-bk-faint">{q.header}</span>}
            </legend>
            <p className="whitespace-pre-wrap break-words text-sm text-bk-fg">{q.question}</p>
            {options.length > 0 && (
              <div className="mt-2 space-y-1">
                {options.map((o, j) => {
                  const checked = d.selected.includes(o.label);
                  return (
                    <label key={j} className={cx("flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-bk-raised", checked && "bg-bk-raised")}>
                      <input
                        type={q.multiple ? "checkbox" : "radio"}
                        name={q.multiple ? undefined : name}
                        checked={checked}
                        onChange={(e) =>
                          update(i, (prev) =>
                            q.multiple
                              ? { ...prev, selected: e.target.checked ? [...prev.selected, o.label] : prev.selected.filter((l) => l !== o.label) }
                              : { selected: [o.label], custom: "" },
                          )
                        }
                        className="mt-0.5 shrink-0 accent-bk-accent"
                      />
                      <span className="min-w-0">
                        <span className="block break-words text-sm text-bk-fg">{o.label}</span>
                        {o.description && <span className="block break-words text-xs text-bk-muted">{o.description}</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            {allowCustom && (
              <input
                value={d.custom}
                onChange={(e) => {
                  const value = e.target.value;
                  update(i, (prev) => ({ selected: q.multiple || !value.trim() ? prev.selected : [], custom: value }));
                }}
                maxLength={2000}
                placeholder={options.length > 0 ? (q.multiple ? "Add your own answer (optional)" : "Or type your own answer") : "Type your answer"}
                aria-label={`Your answer to: ${q.question}`}
                className="mt-2 w-full rounded-lg border border-bk-line bg-bk-bg px-3 py-1.5 text-sm text-bk-fg placeholder:text-bk-faint focus:border-bk-muted focus:outline-none"
              />
            )}
            {invalid && <p className="mt-1.5 text-xs text-bk-err">{options.length > 0 ? (q.multiple ? "Choose at least one option." : "Choose an option.") : "Type an answer."}</p>}
          </fieldset>
        );
      })}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="primary" className="px-3 py-1.5 text-xs" disabled={!!busy || (tried && anyMissing)}>
          {busy === "answer" ? <Spinner className="size-3.5" /> : <Check className="size-3.5" />} Submit {questions.length > 1 ? "answers" : "answer"}
        </Button>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" disabled={!!busy} onClick={onDismiss}>
          {busy === "reject" ? <Spinner className="size-3.5" /> : <X className="size-3.5" />} Dismiss
        </Button>
        {tried && anyMissing && <span className="text-xs text-bk-err">Answer every question before submitting.</span>}
      </div>
    </form>
  );
}

/**
 * One approval: a permission request (Reject / Always / Approve once) or a question (answer / dismiss).
 * `interactive={false}` only shows what was asked and answered.
 */
export function ApprovalItem({
  approval,
  now,
  showSession = true,
  interactive = true,
  onChanged,
}: {
  approval: Approval;
  now: number;
  showSession?: boolean;
  interactive?: boolean;
  onChanged?: () => void;
}) {
  const { getToken } = useAuth();
  const [local, setLocal] = useState<Approval | null>(null);
  const [busy, setBusy] = useState<"once" | "always" | "reject" | "answer" | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [queued, setQueued] = useState(false);
  // A newer copy from the server wins over the local one once it has moved on from PENDING.
  useEffect(() => {
    if (approval.status.toUpperCase() !== "PENDING") setLocal(null);
  }, [approval.status]);

  const a = local ?? approval;
  const question = isQuestion(a);
  const questions = a.questions ?? [];
  const pending = a.status.toUpperCase() === "PENDING";

  const send = async (kind: "once" | "always" | "reject" | "answer", answers?: string[][]) => {
    setBusy(kind);
    setError(null);
    try {
      const token = await getToken();
      const path = `/v1/approvals/${encodeURIComponent(a.id)}/${kind === "answer" ? "answer" : "respond"}`;
      const res = await fetchRespond(path, token, kind === "answer" ? { answers } : { reply: kind });
      if (res.data) setLocal(res.data);
      setQueued(res.deviceOnline === false);
      onChanged?.();
    } catch (err) {
      setError(err);
      if (err instanceof ApiError && err.code === "APPROVAL_NOT_PENDING") onChanged?.();
    } finally {
      setBusy(null);
    }
  };

  const Icon = question ? CircleHelp : ShieldAlert;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Icon className={cx("size-4 shrink-0", pending ? "text-bk-warn" : "text-bk-faint")} />
            <span className="text-[11px] font-medium uppercase tracking-wide text-bk-faint">{question ? "Question" : "Permission"}</span>
            {!question && <Pill>{a.permission}</Pill>}
            <Pill tone={approvalTone(a.status)}>{approvalStatusLabel(a)}</Pill>
          </div>
          {question ? (
            a.title && !questions.some((q) => q.question === a.title) && <p className="mt-1.5 break-words text-sm text-bk-muted">{a.title}</p>
          ) : (
            <p className="mt-1.5 break-words text-sm text-bk-fg">
              {a.title || (
                <>
                  The agent wants <code className="font-mono text-xs">{a.permission}</code> permission.
                </>
              )}
            </p>
          )}
          {!question && <Patterns patterns={a.patterns} />}
          {showSession && (
            <div className="mt-1.5 text-xs text-bk-faint">
              <Link href={`/session/?id=${encodeURIComponent(a.sessionId)}`} className="hover:text-bk-fg">
                {a.sessionTitle || "Session"}
              </Link>
              {a.projectName && <> · {a.projectName}</>}
            </div>
          )}
          {!pending && a.status.toUpperCase() !== "RESPONDING" && (a.resolvedBy || a.resolvedAt) && (
            <div className="mt-1 text-xs text-bk-faint">
              {resolverLabel(a.resolvedBy) ? `Resolved ${resolverLabel(a.resolvedBy)}` : "Resolved"}
              {a.resolvedAt && (
                <span title={fullDate(a.resolvedAt)}> · {timeAgo(a.resolvedAt, now)}</span>
              )}
            </div>
          )}
        </div>
        <span className="shrink-0 text-xs text-bk-faint" title={fullDate(a.createdAt)}>
          {timeAgo(a.createdAt, now)}
        </span>
      </div>

      {question &&
        (a.answers && a.answers.length > 0 ? (
          <AnsweredQuestions questions={questions} answers={a.answers} />
        ) : pending && interactive && questions.length > 0 ? (
          <QuestionForm questions={questions} busy={busy === "answer" || busy === "reject" ? busy : null} onSubmit={(ans) => void send("answer", ans)} onDismiss={() => void send("reject")} />
        ) : questions.length > 0 ? (
          <QuestionList questions={questions} />
        ) : null)}

      {question && pending && interactive && questions.length === 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-bk-muted">This question has no details here. Answer it in BambooKit on your PC, or dismiss it.</span>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" disabled={!!busy} onClick={() => void send("reject")}>
            {busy === "reject" ? <Spinner className="size-3.5" /> : <X className="size-3.5" />} Dismiss
          </Button>
        </div>
      )}

      {!question && pending && interactive && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="ghost" className="px-3 py-1.5 text-xs text-bk-err" disabled={!!busy} onClick={() => void send("reject")}>
            {busy === "reject" ? <Spinner className="size-3.5" /> : <X className="size-3.5" />} Reject
          </Button>
          <Button className="px-3 py-1.5 text-xs" disabled={!!busy} onClick={() => void send("always")} title="Allow this and matching requests without asking again">
            {busy === "always" ? <Spinner className="size-3.5" /> : <CheckCheck className="size-3.5" />} Always
          </Button>
          <Button variant="primary" className="px-3 py-1.5 text-xs" disabled={!!busy} onClick={() => void send("once")}>
            {busy === "once" ? <Spinner className="size-3.5" /> : <Check className="size-3.5" />} Approve once
          </Button>
        </div>
      )}

      {a.status.toUpperCase() === "RESPONDING" && (
        <p className="mt-2 text-xs text-bk-muted">
          {queued ? "Your PC is offline. Your reply is sent when BambooKit on the PC reconnects." : "Sending your reply to your PC…"}
        </p>
      )}
      <InlineError error={error} message={error ? friendlyError(error) : null} className="mt-3" />
    </div>
  );
}

/** POST a reply; the API answers { data, command, deviceOnline }. */
async function fetchRespond(path: string, token: string | null, body: unknown): Promise<{ data: Approval | null; deviceOnline?: boolean }> {
  const res = await apiRequestFull<{ data?: Approval | null; deviceOnline?: boolean } | null>("POST", path, token, { body });
  return { data: res?.data ?? null, deviceOnline: res?.deviceOnline };
}

const TABS = [
  { value: "pending", label: "Pending", query: "?status=pending" },
  { value: "resolved", label: "Resolved", query: "?status=resolved" },
  { value: "all", label: "All", query: "?status=all" },
] as const;

export function ApprovalsView() {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("pending");
  const approvals = useResource<Approval[]>(`/v1/approvals${TABS.find((t) => t.value === tab)!.query}`);
  const now = useNow();
  useRealtime((e) => {
    if (e.type.startsWith("approval.") || e.type === "notification" || (e.type === "ready" && e.payload?.reconnect)) approvals.reload();
  });

  const emptyTitle = tab === "pending" ? "Nothing waiting for you" : tab === "resolved" ? "No resolved requests yet" : "No requests yet";

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Permission requests and questions from the agent. Answer them here, in BambooKit on your PC, or on your phone."
      />
      <div className="mb-4 inline-flex rounded-lg border border-bk-line bg-bk-panel p-0.5 text-sm">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cx("rounded-md px-3 py-1.5", tab === t.value ? "bg-bk-raised text-bk-fg" : "text-bk-muted hover:text-bk-fg")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {approvals.error && !approvals.data ? (
        <ErrorState error={approvals.error} onRetry={approvals.reload} />
      ) : !approvals.data ? (
        <LoadingState slow={approvals.slow} />
      ) : approvals.data.length === 0 ? (
        <EmptyState icon={<ShieldCheck className="size-7" />} title={emptyTitle}>
          {tab === "resolved"
            ? "Requests you have approved, rejected or answered appear here, including the ones your PC approved automatically. Resolved requests are kept for 30 days."
            : "Requests appear here when the agent asks before running a command or editing a file, or when it has a question for you. You can approve, reject or answer them from this page."}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-bk-line overflow-hidden rounded-xl border border-bk-line bg-bk-panel">
          {approvals.data.map((a) => (
            <li key={a.id} className="px-4 py-3.5">
              <ApprovalItem approval={a} now={now} onChanged={approvals.reload} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
