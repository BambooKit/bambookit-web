"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DownloadCloud, LogIn } from "lucide-react";
import { Button, ButtonLink, Card, Spinner } from "@/components/ui";
import { InlineError } from "@/components/ErrorInfo";
import { NewSessionPanel } from "@/components/app/NewSession";
import { useLiveDevices } from "@/lib/live";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PlanProvider } from "@/lib/plan";

/** GET /v1/shares/:id/import-preview */
interface ImportPreview {
  title: string | null;
  projectName: string | null;
  model: { providerID: string; modelID: string } | null;
  promptCount: number;
  seedPrompt: string;
  context: string;
}

/** Builds the seed first message for the cloned session from the share preview. */
function buildSeed(p: ImportPreview): string {
  const title = p.title?.trim() || "session";
  const context = (p.context?.trim() || p.seedPrompt?.trim() || "").trim();
  return `Continuing a shared BambooKit session: ${title}.\n\nEarlier conversation for context:\n${context}\n\n---\nContinue from here.`;
}

/** The New Session panel, prefilled from the share preview, with the plan context it needs. */
function ImportPanel({ preview, onClose }: { preview: ImportPreview; onClose: () => void }) {
  const router = useRouter();
  const devices = useLiveDevices();
  const desktops = (devices.data ?? []).filter((d) => d.kind === "desktop");
  return (
    <PlanProvider>
      <NewSessionPanel
        onClose={onClose}
        desktops={desktops}
        seedText={buildSeed(preview)}
        seedModel={preview.model}
        heading="Open in my BambooKit"
        submitLabel="Create session"
        intro={
          <>
            This creates a new session in your own account on a PC you pick, seeded with the shared conversation as its
            opening context. The original owner&apos;s PC is never contacted. Edit the first message if you like.
          </>
        }
        onCreated={({ id }) => router.push(id ? `/session/?id=${encodeURIComponent(id)}` : "/sessions/")}
      />
    </PlanProvider>
  );
}

/** Shown to signed-in viewers: loads the import preview, then opens the prefilled New Session panel. */
function SignedInImport({ shareId }: { shareId: string }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);

  const open = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ImportPreview>(`/v1/shares/${encodeURIComponent(shareId)}/import-preview`, await getToken());
      setPreview(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (preview) return <ImportPanel preview={preview} onClose={() => setPreview(null)} />;

  return (
    <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
      <p className="min-w-0 flex-1 text-sm text-bk-muted">
        Clone this session into your own BambooKit account and continue it on your own PC.
      </p>
      <Button variant="primary" onClick={() => void open()} disabled={loading}>
        {loading ? <Spinner className="size-4" /> : <DownloadCloud className="size-4" />} Open in my BambooKit
      </Button>
      <InlineError error={error} message="Couldn't load this shared session for import." onRetry={() => void open()} className="w-full" />
    </Card>
  );
}

/** Top-of-share-page call to action. Signed in → import; signed out → sign in and come back here. */
export function ShareImport({ shareId }: { shareId: string }) {
  const { status } = useAuth();
  if (status === "loading") return null;
  if (status === "signedOut") {
    const next = `/share/?id=${encodeURIComponent(shareId)}`;
    return (
      <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="min-w-0 flex-1 text-sm text-bk-muted">Sign in to clone this session into your own BambooKit account.</p>
        <ButtonLink href={`/signin/?next=${encodeURIComponent(next)}`} variant="primary">
          <LogIn className="size-4" /> Sign in to open in your BambooKit
        </ButtonLink>
      </Card>
    );
  }
  return <SignedInImport shareId={shareId} />;
}
