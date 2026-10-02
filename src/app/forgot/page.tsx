import type { Metadata } from "next";
import { Forgot } from "@/components/auth/Forgot";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ForgotPage() {
  return <Forgot />;
}
