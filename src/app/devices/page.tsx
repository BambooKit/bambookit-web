import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { DevicesView } from "@/components/app/DevicesView";

export const metadata: Metadata = { title: "Devices", robots: { index: false } };

export default function DevicesPage() {
  return (
    <AppShell>
      <DevicesView />
    </AppShell>
  );
}
