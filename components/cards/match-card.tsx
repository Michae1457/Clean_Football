import { Clock3 } from "lucide-react";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusLabel = {
  cancelled: "取消",
  scheduled: "未开赛",
  live: "进行中",
  finished: "完场",
  postponed: "延期"
};

export function MatchCard({ match }: { match: Match }) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-muted">{match.competition}</span>
        <span
          className={cn(
            "rounded-full border px-2 py-1 text-[11px] font-medium",
            match.status === "live"
              ? "border-accent text-accent"
              : "text-muted"
          )}
        >
          {statusLabel[match.status]}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <p className="min-w-0 break-words text-sm font-semibold leading-snug text-text sm:text-base">
          {match.homeTeam}
        </p>
        <div className="min-w-14 rounded-lg border px-2 py-2 text-center font-mono text-xs font-semibold text-text sm:min-w-16 sm:px-3 sm:text-sm">
          {match.score ?? match.kickoff}
        </div>
        <p className="min-w-0 break-words text-right text-sm font-semibold leading-snug text-text sm:text-base">
          {match.awayTeam}
        </p>
      </div>
      {match.note ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Clock3 className="size-4" />
          <span>{match.note}</span>
        </div>
      ) : null}
    </article>
  );
}
