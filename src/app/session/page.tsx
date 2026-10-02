import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { SessionView } from "@/components/app/SessionView";
import { LoadingState } from "@/components/ui";

export const metadata: Metadata = { title: "Session", robots: { index: false } };

/** /session/?id=<session id> — a static page; the id is read on the client. */
export default function SessionPage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState />}>
        <SessionView />
      </Suspense>
    </AppShell>
  );
}
