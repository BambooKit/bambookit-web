import { Suspense } from "react";
import type { Metadata } from "next";
import { DesktopCallback } from "@/components/auth/DesktopCallback";

export const metadata: Metadata = { title: "Signing in to BambooKit Desktop", robots: { index: false } };

export default function DesktopCallbackPage() {
  return (
    <Suspense>
      <DesktopCallback />
    </Suspense>
  );
}
