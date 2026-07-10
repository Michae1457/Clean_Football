"use client";

import { useState } from "react";
import { MatchCard } from "@/components/cards/match-card";
import { EmptyState } from "@/components/ui/page-state";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

const days = ["昨日", "今日", "明日"] as const;

export function MatchDayTabs({
  matchesByDay
}: {
  matchesByDay: Record<(typeof days)[number], Match[]>;
}) {
  const [activeDay, setActiveDay] = useState<(typeof days)[number]>("今日");
  const matches = matchesByDay[activeDay];

  return (
    <div className="space-y-5">
      <div className="match-surface grid grid-cols-3 gap-2 rounded-lg border bg-card p-1.5">
        {days.map((day) => (
          <button
            className={cn(
              "interactive-control h-12 rounded-lg text-sm font-bold text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              activeDay === day && "active-tab text-black hover:text-black"
            )}
            key={day}
            onClick={() => setActiveDay(day)}
            type="button"
          >
            {day}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-text">{activeDay}</h2>
          <span className="text-sm text-muted">{matches.length} 场</span>
        </div>
        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <EmptyState
            description={`${activeDay}没有可靠入库的比赛。`}
            title="暂无赛程数据"
          />
        )}
      </section>
    </div>
  );
}
