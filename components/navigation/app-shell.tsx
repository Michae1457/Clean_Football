"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Newspaper, Settings, Sparkles, Trophy } from "lucide-react";
import { NewsRefreshButton } from "@/components/news/news-refresh-button";
import { cn } from "@/lib/utils";

const pageMeta: Record<string, { title: string; eyebrow?: string }> = {
  "/today": { title: "今日", eyebrow: "9 点简报" },
  "/matches": { title: "赛程", eyebrow: "昨日 / 今日 / 明日" },
  "/news": { title: "新闻", eyebrow: "中文摘要流" },
  "/agent": { title: "聊球" },
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
  const meta =
    pageMeta[pathname] ??
    (pathname.startsWith("/news/") ? pageMeta["/news"] : pageMeta["/today"]);
  const showNewsRefresh = pathname === "/news";
  const pageKey = getPageKey(pathname);
  const showStatusDot = pageKey !== "settings";

  return (
    <div className="app-frame fixed inset-0 mx-auto flex w-full min-w-0 max-w-3xl flex-col overflow-hidden px-4">
      <header
        className={cn(
          "pitch-header chrome-rail z-20 -mx-4 shrink-0 border-b px-6 pb-6 pt-[calc(env(safe-area-inset-top)+1.35rem)] backdrop-blur",
          `pitch-header--${pageKey}`
        )}
      >
        <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-4">
          <div className="min-w-0">
            {meta.eyebrow ? (
              <p className="text-sm font-semibold text-muted">{meta.eyebrow}</p>
            ) : null}
            <div
              className={cn(
                "flex items-center gap-3",
                meta.eyebrow && "mt-1"
              )}
            >
              <h1 className="text-4xl font-black leading-none text-text">
                {meta.title}
              </h1>
              {showStatusDot ? <span aria-hidden className="status-dot" /> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            {showNewsRefresh ? <NewsRefreshButton /> : null}
            <Link
              aria-label="打开设置"
              className={cn(
                "interactive-control stadium-button inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border text-muted hover:border-accent hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                pathname === "/settings" && "border-accent text-text"
              )}
              href="/settings"
            >
              <Settings className="size-6" />
            </Link>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "min-h-0 min-w-0 flex-1 overscroll-contain",
          pathname === "/agent"
            ? "flex overflow-hidden pt-4"
            : "overflow-y-auto py-5"
        )}
      >
        {children}
      </main>

      <nav className="chrome-rail -mx-4 shrink-0 border-t px-3 pb-[var(--app-bottom-safe-padding)] pt-2 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/today" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                className={cn(
                  "interactive-control flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-muted hover:bg-card hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active && "active-nav bg-card text-text shadow-card"
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

function getPageKey(pathname: string) {
  if (pathname.startsWith("/matches")) {
    return "matches";
  }

  if (pathname.startsWith("/news")) {
    return "news";
  }

  if (pathname.startsWith("/agent")) {
    return "agent";
  }

  if (pathname.startsWith("/settings")) {
    return "settings";
  }

  return "today";
}
