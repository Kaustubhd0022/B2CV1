import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { currentSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "TattvaCo", template: "%s · TattvaCo" },
  description: "Discover the relationships, context and living meaning within India's cultural universe.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5ef",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession().catch(() => null);
  return (
    <html lang={session?.language ?? "en"} className={fontVariables}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
