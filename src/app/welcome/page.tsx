import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { WelcomeView } from "@/components/app/WelcomeView";

export const metadata: Metadata = { title: "Set up BambooKit", robots: { index: false } };

export default function WelcomePage() {
  return (
    <AppShell>
      <WelcomeView />
    </AppShell>
  );
}
