import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { AdminView } from "@/components/app/AdminView";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminPage() {
  return (
    <AppShell>
      <AdminView />
    </AppShell>
  );
}
