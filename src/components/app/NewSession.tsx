"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CircleCheck, Lock, Plus, X } from "lucide-react";
import { Button, Card, Notice, Spinner, cx } from "@/components/ui";
import { InlineError } from "@/components/ErrorInfo";
import { LimitReached, QuotaNote, useFreeQuota } from "./PlanLimits";
import { apiRequestFull, useResource } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usePlan } from "@/lib/plan";
import type { Device, Project } from "@/lib/types";

const TEXT_MAX = 20_000;

/** "New session" with today's free allowance under it; shows a lock when none are left. */
export function NewSessionButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const quota = useFreeQuota("sessions");
  const locked = quota !== null && quota.left === 0;
  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="primary" aria-expanded={open} onClick={onToggle} className="px-3 py-1.5 text-sm" title={locked ? "Today's free new sessions are used up" : undefined}>
        {locked ? <Lock className="size-4" /> : <Plus className="size-4" />} New session
      </Button>
      {locked ? <span className="text-xs text-bk-warn">0 of {quota.max} left today</span> : <QuotaNote metric="sessions" />}
    </div>
  );
}

interface SeedModel {
  providerID: string;
  modelID: string;
}

/**
 * Starts a session on the PC that owns a project (POST /v1/projects/:id/sessions). New sessions from
 * the website count toward the free daily allowance like the phone's.
 *
 * Reused by the "Open in my BambooKit" clone flow: pass `seedText` (and optionally `seedModel`) to
 * prefill the first message, `intro`/`heading` to explain the panel, and `onCreated` to route to the
 * new session on success instead of showing the in-place "started" notice.
 */
export function NewSessionPanel({
  onClose,
  defaultProjectId,
  desktops,
  seedText,
  seedModel,
  intro,
  heading = "New session",
  submitLabel = "Start session",
  onCreated,
}: {
  onClose: () => void;
  defaultProjectId?: string;
  desktops: Device[];
  seedText?: string;
  seedModel?: SeedModel | null;
  intro?: ReactNode;
  heading?: string;
  submitLabel?: string;
  onCreated?: (result: { id: string | null }) => void;
}) {
  const { getToken } = useAuth();
  const { plan, bump, applyLimit } = usePlan();
  const quota = useFreeQuota("sessions");
  const projects = useResource<Project[]>("/v1/projects");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [text, setText] = useState(seedText ?? "");
  const [useModel, setUseModel] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [limitResetsAt, setLimitResetsAt] = useState<string | null>(null);
  const [started, setStarted] = useState<{ pc: string; queued: boolean } | null>(null);

  const online = useMemo(() => new Map(desktops.map((d) => [d.id, d.online])), [desktops]);
  const list = useMemo(() => (projects.data ?? []).filter((p) => p.status !== "archived"), [projects.data]);
  useEffect(() => {
    if (!projectId && list.length) setProjectId(list[0].id);
  }, [list, projectId]);

  const locked = quota !== null && quota.left === 0;
  const resetsAt = limitResetsAt ?? plan?.resetsAt ?? null;
  const project = list.find((p) => p.id === projectId);
  const trimmed = text.trim();
  const tooLong = trimmed.length > TEXT_MAX;

  const start = async () => {
    if (!project || !trimmed || tooLong || sending || locked) return;
    setSending(true);
    setError(null);
    try {
      const body: { text: string; model?: SeedModel } = { text: trimmed };
      if (seedModel && useModel) body.model = seedModel;
      const res = await apiRequestFull<{ data?: { id?: string | null } | null; deviceOnline?: boolean } | null>(
        "POST",
        `/v1/projects/${encodeURIComponent(project.id)}/sessions`,
        await getToken(),
        { body },
      );
      bump("sessions");
      if (onCreated) {
        onCreated({ id: res?.data?.id ?? null });
        return;
      }
      setText("");
      setStarted({ pc: project.deviceName ?? "Your PC", queued: res?.deviceOnline === false });
    } catch (err) {
      const limit = applyLimit(err);
      if (limit) setLimitResetsAt(limit.resetsAt);
      else setError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="mb-5 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-medium text-bk-fg">
          {locked ? <Lock className="size-4 text-bk-warn" /> : <Plus className="size-4" />} {heading}
        </h2>
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClose} aria-label="Close">
          <X className="size-3.5" />
        </Button>
      </div>

      {intro && <div className="mb-3 text-sm text-bk-muted">{intro}</div>}

      {started && (
        <Notice tone="ok" className="mb-3" icon={<CircleCheck className="size-4" />}>
          {started.queued
            ? `${started.pc} is offline. It starts the session when BambooKit on it reconnects.`
            : `Asked ${started.pc} to start the session. It appears in the list in a moment.`}
        </Notice>
      )}

      {locked ? (
        <LimitReached resetsAt={resetsAt}>
          The free plan includes {quota?.max ?? 3} new sessions a day from your phone and this website. Sessions you start in BambooKit Desktop on your PC
          don&apos;t count.{trimmed ? " Your prompt is kept here." : ""}
        </LimitReached>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void start();
          }}
        >
          {projects.error && !projects.data ? (
            <InlineError error={projects.error} message="Couldn't load your projects." onRetry={projects.reload} />
          ) : !projects.data ? (
            <div className="flex items-center gap-2 text-sm text-bk-muted">
              <Spinner /> Loading your projects…
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-bk-muted">No projects yet. Open a folder in BambooKit Desktop on your PC first; its projects appear here.</p>
          ) : (
            <>
              <label className="block">
                <span className="mb-1 block text-xs text-bk-faint">Project</span>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-lg border border-bk-line bg-bk-panel px-3 py-2 text-sm text-bk-fg focus:border-bk-muted focus:outline-none"
                >
                  {list.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.deviceName ? ` · ${p.deviceName}` : ""}
                      {online.get(p.deviceId) ? "" : " (offline)"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-bk-faint">First message</span>
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setError(null);
                  }}
                  rows={3}
                  placeholder="What should the agent do?"
                  className={cx(
                    "w-full resize-y rounded-lg border bg-bk-panel px-3 py-2 text-sm text-bk-fg placeholder:text-bk-faint focus:outline-none",
                    tooLong ? "border-bk-err/60" : "border-bk-line focus:border-bk-muted",
                  )}
                />
              </label>
              {seedModel && (
                <label className="flex items-center gap-2 text-xs text-bk-muted">
                  <input type="checkbox" checked={useModel} onChange={(e) => setUseModel(e.target.checked)} className="accent-bk-accent" />
                  Use the shared session&apos;s model (<span className="font-mono">{seedModel.modelID}</span>)
                </label>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-bk-faint">
                  {tooLong
                    ? <span className="text-bk-err">Up to {TEXT_MAX.toLocaleString()} characters.</span>
                    : project && !online.get(project.deviceId)
                      ? `${project.deviceName ?? "That PC"} is offline; it starts the session when it reconnects.`
                      : "The PC that owns the project creates the session in its folder."}
                </span>
                <div className="flex items-center gap-3">
                  <QuotaNote metric="sessions" />
                  <Button type="submit" variant="primary" className="px-3 py-1.5 text-xs" disabled={!project || !trimmed || tooLong || sending}>
                    {sending ? <Spinner className="size-3.5" /> : <Plus className="size-3.5" />} {submitLabel}
                  </Button>
                </div>
              </div>
            </>
          )}
          <InlineError error={error} onRetry={() => void start()} />
        </form>
      )}
    </Card>
  );
}
