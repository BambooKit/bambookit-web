"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeader, Pill, cx } from "@/components/ui";
import { useResource } from "@/lib/api";
import { useRealtime } from "@/lib/realtime";
import { useNow } from "@/lib/live";
import { fullDate, timeAgo } from "@/lib/format";
import type { Approval } from "@/lib/types";

export function approvalTone(status: string): "warn" | "ok" | "err" | "neutral" {
  const s = status.toUpperCase();
  if (s === "PENDING" || s === "RESPONDING") return "warn";
  if (s === "APPROVED") return "ok";
  if (s === "REJECTED") return "err";
  return "neutral";
}

export function ApprovalsView() {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const approvals = useResource<Approval[]>(tab === "pending" ? "/v1/approvals?status=PENDING" : "/v1/approvals");
  const now = useNow();
  useRealtime((e) => {
    if (e.type.startsWith("approval.") || (e.type === "ready" && e.payload?.reconnect)) approvals.reload();
  });

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Permission requests from the agent. Answer them in BambooKit Desktop or on your phone; this list is view only."
      />
      <div className="mb-4 inline-flex rounded-lg border border-bk-line bg-bk-panel p-0.5 text-sm">
        {(["pending", "all"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cx("rounded-md px-3 py-1.5", tab === t ? "bg-bk-raised text-bk-fg" : "text-bk-muted hover:text-bk-fg")}
          >
            {t === "pending" ? "Waiting" : "Recent"}
          </button>
        ))}
      </div>
      {approvals.error && !approvals.data ? (
        <ErrorState message={approvals.error.message} onRetry={approvals.reload} />
      ) : !approvals.data ? (
        <LoadingState slow={approvals.slow} />
      ) : approvals.data.length === 0 ? (
        <EmptyState icon={<ShieldCheck className="size-7" />} title={tab === "pending" ? "Nothing waiting for approval" : "No approvals yet"}>
          When the agent asks for permission to run a command or edit a file, the request shows up here.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-bk-line overflow-hidden rounded-xl border border-bk-line bg-bk-panel">
          {approvals.data.map((a) => (
            <li key={a.id} className="px-4 py-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-bk-fg">{a.title || a.permission}</span>
                    <Pill tone={approvalTone(a.status)}>{a.status.toLowerCase()}</Pill>
                    <Pill>{a.permission}</Pill>
                  </div>
                  {a.patterns.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {a.patterns.map((p, i) => (
                        <code key={i} className="max-w-full truncate rounded border border-bk-line bg-bk-bg px-1.5 py-0.5 font-mono text-[11px] text-bk-muted">
                          {p}
                        </code>
                      ))}
                    </div>
                  )}
                  <div className="mt-1.5 text-xs text-bk-faint">
                    <Link href={`/session/?id=${encodeURIComponent(a.sessionId)}`} className="hover:text-bk-fg">
                      {a.sessionTitle || "Session"}
                    </Link>
                    {a.projectName && <> · {a.projectName}</>}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-bk-faint" title={fullDate(a.createdAt)}>
                  {timeAgo(a.createdAt, now)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
