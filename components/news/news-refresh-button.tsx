"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsRefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  async function refreshNews() {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setMessage("");

    try {
      const response = await fetch("/api/news/refresh", {
        method: "POST"
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        retryAfterSeconds?: number;
      };

      if (response.status === 429) {
        setMessage(
          `刚刷新过，约 ${payload.retryAfterSeconds ?? 300} 秒后再试。`
        );
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error ?? `Refresh failed: ${response.status}`);
      }

      setMessage("已刷新");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("刷新失败");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button
        aria-label="刷新新闻"
        disabled={isRefreshing}
        onClick={refreshNews}
        size="sm"
        type="button"
        variant="quiet"
      >
        <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
        <span className="hidden sm:inline">刷新新闻</span>
        <span className="sm:hidden">刷新</span>
      </Button>
      {message ? <span className="text-xs text-muted">{message}</span> : null}
    </div>
  );
}
