"use client";

import { useEffect, useState } from "react";
import { Crown, LogOut, Trash2, UserPlus, Users, X } from "lucide-react";
import { Button, Spinner, cx } from "@/components/ui";
import { InlineError } from "@/components/ErrorInfo";
import { apiRequest, useResource } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRealtime } from "@/lib/realtime";
import type { CollaboratorsResponse, Session, SessionCollaborator, SessionOwner } from "@/lib/types";

/** The DELETE :collabId for a collaborator: their user id once linked, otherwise the invited email. */
function collabId(c: SessionCollaborator): string {
  return c.userId ?? c.email;
}

function roleLabel(role: "chat" | "viewer"): string {
  return role === "chat" ? "Can chat" : "View only";
}

/** Round avatar with an initial fallback when there's no photo or it fails to load. */
function Avatar({ src, name, className }: { src: string | null; name: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initial = (name?.trim()[0] ?? "?").toUpperCase();
  useEffect(() => setFailed(false), [src]);
  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={cx("rounded-full object-cover", className)} />;
  }
  return <span className={cx("grid place-items-center rounded-full bg-bk-raised text-[11px] font-semibold text-bk-fg", className)}>{initial}</span>;
}

function AddPeople({ sessionId, onChanged }: { sessionId: string; onChanged: () => void }) {
  const { getToken } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"chat" | "viewer">("chat");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const add = async () => {
    const value = email.trim();
    if (!value || sending) return;
    setSending(true);
    setError(null);
    try {
      await apiRequest("POST", `/v1/sessions/${encodeURIComponent(sessionId)}/collaborators`, await getToken(), { body: { email: value, role } });
      setEmail("");
      onChanged();
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      className="space-y-2 border-t border-bk-line px-4 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        void add();
      }}
    >
      <span className="block text-xs font-medium uppercase tracking-wider text-bk-faint">Add people</span>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="name@example.com"
          className="min-w-0 flex-1 rounded-lg border border-bk-line bg-bk-bg px-3 py-2 text-sm text-bk-fg placeholder:text-bk-faint focus:border-bk-muted focus:outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "chat" | "viewer")}
          aria-label="Role"
          className="rounded-lg border border-bk-line bg-bk-panel px-3 py-2 text-sm text-bk-fg focus:border-bk-muted focus:outline-none"
        >
          <option value="chat">Can chat</option>
          <option value="viewer">View only</option>
        </select>
        <Button type="submit" variant="primary" className="px-3 py-2 text-xs" disabled={!email.trim() || sending}>
          {sending ? <Spinner className="size-3.5" /> : <UserPlus className="size-3.5" />} Invite
        </Button>
      </div>
      <p className="text-xs text-bk-faint">They can view this session live. &ldquo;Can chat&rdquo; also lets them send messages (counted against their own daily limit).</p>
      <InlineError error={error} onRetry={() => void add()} />
    </form>
  );
}

function OwnerRow({ owner }: { owner: SessionOwner }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Avatar src={owner.avatar} name={owner.name || owner.email} className="size-9" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-bk-fg">{owner.name || owner.email || "Owner"}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-bk-accent/40 bg-bk-accent/10 px-2 py-0.5 text-[11px] font-medium text-bk-accent">
            <Crown className="size-3" /> Owner
          </span>
        </div>
        {owner.name && owner.email && <div className="truncate text-xs text-bk-faint">{owner.email}</div>}
      </div>
    </li>
  );
}

function CollaboratorRow({
  c,
  sessionId,
  isOwner,
  onChanged,
}: {
  c: SessionCollaborator;
  sessionId: string;
  isOwner: boolean;
  onChanged: () => void;
}) {
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const canRemove = isOwner || c.you;

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await apiRequest("DELETE", `/v1/sessions/${encodeURIComponent(sessionId)}/collaborators/${encodeURIComponent(collabId(c))}`, await getToken());
      onChanged();
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar src={c.avatar} name={c.name || c.email} className="size-9" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-bk-fg">{c.name || c.email}</span>
            {c.you && <span className="rounded-full border border-bk-line bg-bk-raised px-1.5 py-0.5 text-[10px] font-medium text-bk-muted">You</span>}
            {c.pending && <span className="rounded-full border border-bk-warn/40 bg-bk-warn/10 px-1.5 py-0.5 text-[10px] font-medium text-bk-warn">Pending</span>}
          </div>
          <div className="truncate text-xs text-bk-faint">
            {roleLabel(c.role)}
            {c.name && c.email ? ` · ${c.email}` : ""}
          </div>
        </div>
        {canRemove && (
          <Button variant="ghost" className="px-2 py-1 text-xs" disabled={busy} onClick={() => void remove()} aria-label={c.you ? "Leave session" : "Remove"}>
            {busy ? <Spinner className="size-3.5" /> : c.you ? <LogOut className="size-3.5" /> : <Trash2 className="size-3.5" />}
            {c.you ? "Leave" : ""}
          </Button>
        )}
      </div>
      <InlineError error={error} onRetry={() => void remove()} className="mt-2" />
    </li>
  );
}

function CollaboratorsDialog({
  data,
  sessionId,
  isOwner,
  onClose,
  onChanged,
}: {
  data: CollaboratorsResponse;
  sessionId: string;
  isOwner: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="People on this session" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-t-2xl border border-bk-line bg-bk-panel shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-bk-line px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-medium text-bk-fg">
            <Users className="size-4" /> People on this session
          </h2>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <ul className="divide-y divide-bk-line">
            <OwnerRow owner={data.owner} />
            {data.collaborators.map((c) => (
              <CollaboratorRow key={collabId(c)} c={c} sessionId={sessionId} isOwner={isOwner} onChanged={onChanged} />
            ))}
          </ul>
          {data.collaborators.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-bk-muted">No collaborators yet. {isOwner ? "Invite someone below." : ""}</p>
          )}
        </div>
        {isOwner && <AddPeople sessionId={sessionId} onChanged={onChanged} />}
      </div>
    </div>
  );
}

/** Header strip: collaborator avatars + an Owner badge; opens a dialog to manage who's on the session. */
export function Collaborators({ session, sessionId }: { session: Session; sessionId: string }) {
  const res = useResource<CollaboratorsResponse>(`/v1/sessions/${encodeURIComponent(sessionId)}/collaborators`);
  const [open, setOpen] = useState(false);
  const isOwner = (session.role ?? "owner") === "owner";

  useRealtime((e) => {
    if (e.type === "collaborators.updated") {
      const sid = e.sessionId ?? e.payload?.sessionId;
      if (sid === sessionId) res.reload();
    } else if (e.type === "ready" && e.payload?.reconnect) res.reload();
  });

  const data = res.data;
  // People to show as avatars: owner first, then collaborators.
  const faces = data ? [{ avatar: data.owner.avatar, name: data.owner.name || data.owner.email }, ...data.collaborators.map((c) => ({ avatar: c.avatar, name: c.name || c.email }))] : [];
  const count = data ? data.collaborators.length : (session.collaboratorCount ?? 0);
  // Hide entirely when there's nothing to manage and the viewer can't add anyone.
  if (!isOwner && count === 0 && !(session.role && session.role !== "owner")) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-bk-line bg-bk-panel px-2 py-1 text-xs text-bk-muted hover:text-bk-fg"
        title="People on this session"
      >
        {faces.length > 0 ? (
          <span className="flex -space-x-2">
            {faces.slice(0, 4).map((f, i) => (
              <Avatar key={i} src={f.avatar} name={f.name} className="size-6 ring-2 ring-bk-panel" />
            ))}
          </span>
        ) : (
          <Users className="size-4" />
        )}
        {isOwner ? (
          <span className="inline-flex items-center gap-1 text-bk-accent">
            <Crown className="size-3" /> Owner
          </span>
        ) : (
          session.role && <span className="capitalize">{session.role === "chat" ? "Collaborator" : "Viewer"}</span>
        )}
        {count > 0 && <span className="tabular-nums">{count}</span>}
      </button>
      {open && data && (
        <CollaboratorsDialog data={data} sessionId={sessionId} isOwner={isOwner} onClose={() => setOpen(false)} onChanged={() => res.reload()} />
      )}
      {open && !data && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="rounded-2xl border border-bk-line bg-bk-panel p-6" onClick={(e) => e.stopPropagation()}>
            {res.error ? (
              <InlineError error={res.error} message="Couldn't load the people on this session." onRetry={res.reload} />
            ) : (
              <div className="flex items-center gap-2 text-sm text-bk-muted">
                <Spinner className="size-4" /> Loading…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
