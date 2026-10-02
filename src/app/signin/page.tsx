import { Suspense } from "react";
import type { Metadata } from "next";
import { SignIn } from "@/components/auth/SignIn";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
