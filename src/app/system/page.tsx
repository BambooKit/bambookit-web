import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/Chrome";
import { SystemMap } from "@/components/system/SystemMap";

// Read at request time so a deployment can be configured without a rebuild.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "System map", robots: { index: false } };

export default function SystemPage() {
  const apiUrl = (
    process.env.BAMBOOKIT_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === "production" ? "https://bambookit-api.onrender.com" : "http://localhost:8080")
  ).replace(/\/+$/, "");
  // Supabase project URL and publishable (anon) key are public by design; they come from the environment.
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const supabaseKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-5">
        <SystemMap apiUrl={apiUrl} supabaseUrl={supabaseUrl} supabaseKey={supabaseKey} />
      </main>
    </>
  );
}
