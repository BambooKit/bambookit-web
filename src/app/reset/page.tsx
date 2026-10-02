import type { Metadata } from "next";
import { Reset } from "@/components/auth/Reset";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPage() {
  return <Reset />;
}
