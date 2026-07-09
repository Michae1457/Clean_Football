import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/navigation/app-shell";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Clean Football"
  },
  title: "Clean Football",
  description: "中文优先、少噪音、不赌球的足球信息 PWA",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/clean-football-logo.svg"
  },
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://clean-football.vercel.app"
  ),
  openGraph: {
    description: "每天早上整理赛程、赛果、重点新闻和可信聊球助手。",
    images: ["/clean-football-logo.svg"],
    title: "Clean Football"
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F7F8" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <PwaProvider />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
