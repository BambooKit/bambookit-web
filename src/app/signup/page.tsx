import { Suspense } from "react";
import type { Metadata } from "next";
import { SignUp } from "@/components/auth/SignUp";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUp />
    </Suspense>
  );
}
