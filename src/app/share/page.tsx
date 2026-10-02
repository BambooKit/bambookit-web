import type { Metadata } from "next";
import { ShareView } from "@/components/share/ShareView";

export const metadata: Metadata = { title: "Shared session", robots: { index: false } };

/**
 * Public share viewer. One static page serves every share link: the host rewrites
 * /share/* to /share/index.html and the client reads the id from the URL.
 */
export default function SharePage() {
  return <ShareView />;
}
