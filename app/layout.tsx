import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/navigation/app-shell";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Clean Football",
  description: "中文优先、少噪音、不赌球的足球信息 PWA",
  icons: {
    icon: "/clean-football-logo.svg"
  },
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
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
