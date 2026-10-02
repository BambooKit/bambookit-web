import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { SessionsView } from "@/components/app/SessionsView";

export const metadata: Metadata = { title: "Sessions", robots: { index: false } };

export default function SessionsPage() {
  return (
    <AppShell>
      <SessionsView />
    </AppShell>
  );
}
