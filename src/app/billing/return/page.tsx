import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { BillingReturnView } from "@/components/app/BillingReturnView";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

export default function BillingReturnPage() {
  return (
    <AppShell>
      <BillingReturnView />
    </AppShell>
  );
}
