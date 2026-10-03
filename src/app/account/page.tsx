import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { AccountView } from "@/components/app/AccountView";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default function AccountPage() {
  return (
    <AppShell>
      <AccountView />
    </AppShell>
  );
}
