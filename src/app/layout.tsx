import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BambooKit — AI coding on your PC, controlled from your phone", template: "%s · BambooKit" },
  description:
    "BambooKit is an AI software-engineering workspace for Windows with a phone remote: chat with agents, review diffs, approve commands and stop or continue work from anywhere.",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  openGraph: { title: "BambooKit", description: "AI coding on your PC, controlled from your phone.", images: ["/icon.png"] },
};

export const viewport: Viewport = { themeColor: "#121212", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
