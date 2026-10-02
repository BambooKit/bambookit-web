import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bambookit-web.onrender.com"),
  title: { default: "BambooKit — AI coding on your PC, with your phone as the remote", template: "%s · BambooKit" },
  description:
    "BambooKit is an AI coding app for Windows with an Android remote. The agent works on your PC, your sessions stay on your PC, and you follow along from your phone or the web.",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  openGraph: { title: "BambooKit", description: "AI coding on your PC, with your phone as the remote.", images: ["/icon.png"] },
};

export const viewport: Viewport = { themeColor: "#121212", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
