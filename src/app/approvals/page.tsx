import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ApprovalsView } from "@/components/app/ApprovalsView";

export const metadata: Metadata = { title: "Approvals", robots: { index: false } };

export default function ApprovalsPage() {
  return (
    <AppShell>
      <ApprovalsView />
    </AppShell>
  );
}
