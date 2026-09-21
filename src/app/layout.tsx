import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BambooKit — The AI Agent Control Plane",
  description:
    "Control autonomous coding agents from anywhere—web, mobile, and desktop. BambooKit provides the execution environment, permissions, approvals, observability, and persistence.",
  keywords: [
    "AI Agent",
    "Coding Agent",
    "Agent Control Plane",
    "Developer Infrastructure",
    "BYOK",
    "Agent Replay",
  ],
  authors: [{ name: "BambooKit Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0d0e] text-[#f1f5f9] antialiased selection:bg-[#10b981]/20 selection:text-[#34d399]">
        {children}
      </body>
    </html>
  );
}
