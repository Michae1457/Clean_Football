"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "白天", icon: Sun },
  { value: "dark", label: "深夜", icon: Moon }
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="match-surface rounded-lg border bg-card p-4">
      <h2 className="text-lg font-semibold text-text">主题</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {themes.map((item) => {
          const Icon = item.icon;
          const active = mounted ? theme === item.value : item.value === "light";

          return (
            <button
              className={cn(
                "interactive-control flex h-16 items-center justify-center gap-2 rounded-lg border bg-background text-sm font-medium text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active && "active-tab border-accent text-text"
              )}
              key={item.value}
              onClick={() => setTheme(item.value)}
              type="button"
            >
              <Icon className={cn("size-5", active && "text-accent")} />
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
