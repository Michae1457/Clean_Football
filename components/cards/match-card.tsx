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
    <article className="match-surface rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-muted">{match.competition}</span>
        <span
          className={cn(
            "rounded-full border bg-background/45 px-2.5 py-1 text-[11px] font-semibold",
            match.status === "live"
              ? "live-status border-accent text-accent"
              : "text-muted"
          )}
        >
          {statusLabel[match.status]}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <p className="min-w-0 break-words text-sm font-semibold leading-snug text-text sm:text-base">
          {match.homeTeam}
        </p>
        <div className="score-chip min-w-16 rounded-lg border border-[color:color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-background/45 px-3 py-2 text-center font-mono text-xs font-bold text-text sm:min-w-16 sm:text-sm">
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
