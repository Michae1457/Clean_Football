"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Newspaper, Settings, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const pageMeta: Record<string, { title: string; eyebrow: string }> = {
  "/today": { title: "今日", eyebrow: "9 点简报" },
  "/matches": { title: "赛程", eyebrow: "昨日 / 今日 / 明日" },
  "/news": { title: "新闻", eyebrow: "中文摘要流" },
  "/agent": { title: "聊球", eyebrow: "只基于已有信息" },
  "/settings": { title: "设置", eyebrow: "主题与关注项" }
};

const navItems = [
  { href: "/today", label: "今日", icon: Sparkles },
  { href: "/matches", label: "赛程", icon: Trophy },
  { href: "/news", label: "新闻", icon: Newspaper },
  { href: "/agent", label: "聊球", icon: MessageCircle }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? pageMeta["/today"];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4">
      <header className="sticky top-0 z-20 -mx-4 border-b bg-background/88 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">{meta.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-text">
              {meta.title}
            </h1>
          </div>
          <Link
            aria-label="打开设置"
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              pathname === "/settings" && "border-accent text-text"
            )}
            href="/settings"
          >
            <Settings className="size-5" />
          </Link>
        </div>
      </header>

      <main
        className={cn(
          "flex-1",
          pathname === "/agent"
            ? "flex min-h-0 overflow-hidden pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-4"
            : "pb-24 pt-5"
        )}
      >
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/92 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-muted transition-colors hover:bg-card hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active && "bg-card text-text shadow-card"
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className={cn("size-5", active && "text-accent")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
