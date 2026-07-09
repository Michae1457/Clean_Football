import { createSupabaseAnonClient, hasSupabaseAnonConfig } from "@/lib/db";
import {
  addDaysToDateString,
  formatAppTime,
  getAppDateString,
  getUtcQueryWindow
} from "@/lib/datetime";
import {
  matchesByDay as mockMatchesByDay,
  todayMatches as mockTodayMatches
} from "@/lib/mock-data";
import type { Match, MatchStatus } from "@/lib/types";

export type MatchDayLabel = "昨日" | "今日" | "明日";

type MatchRow = {
  id: string;
  external_id: string | null;
  competition: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  status: MatchStatus;
  score_home: number | null;
  score_away: number | null;
  stage: string | null;
  matchday: number | null;
};

const dayLabels = ["昨日", "今日", "明日"] as const;

export async function getMatchesByDay(
  anchorDate = getAppDateString()
): Promise<Record<MatchDayLabel, Match[]>> {
  if (!hasSupabaseAnonConfig()) {
    return mockMatchesByDay as Record<MatchDayLabel, Match[]>;
  }

  try {
    const supabase = createSupabaseAnonClient();
    const { start, end } = getUtcQueryWindow(anchorDate);
    const { data, error } = await supabase
      .from("matches")
      .select(
        "id, external_id, competition, home_team, away_team, kickoff_at, status, score_home, score_away, stage, matchday"
      )
      .gte("kickoff_at", start)
      .lte("kickoff_at", end)
      .order("kickoff_at", { ascending: true });

    if (error) {
      throw error;
    }

    return groupMatchesByDay((data ?? []) as MatchRow[], anchorDate);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to load matches.");
  }
}

export async function getTodayMatches(anchorDate = getAppDateString()) {
  if (!hasSupabaseAnonConfig()) {
    return mockTodayMatches;
  }

  const matchesByDay = await getMatchesByDay(anchorDate);
  return matchesByDay["今日"];
}

function groupMatchesByDay(rows: MatchRow[], anchorDate: string) {
  const targetDates: Record<MatchDayLabel, string> = {
    今日: anchorDate,
    明日: addDaysToDateString(anchorDate, 1),
    昨日: addDaysToDateString(anchorDate, -1)
  };
  const grouped: Record<MatchDayLabel, Match[]> = {
    今日: [],
    明日: [],
    昨日: []
  };

  for (const row of rows) {
    const localDate = getAppDateString(new Date(row.kickoff_at));
    const label = dayLabels.find((day) => targetDates[day] === localDate);

    if (label) {
      grouped[label].push(toMatch(row));
    }
  }

  return grouped;
}

function toMatch(row: MatchRow): Match {
  const hasScore = row.score_home !== null && row.score_away !== null;

  return {
    awayTeam: row.away_team,
    competition: row.competition,
    homeTeam: row.home_team,
    id: row.external_id ?? row.id,
    kickoff: kickoffLabel(row),
    note: matchNote(row),
    score: hasScore ? `${row.score_home}-${row.score_away}` : undefined,
    status: row.status
  };
}

function kickoffLabel(row: MatchRow) {
  if (row.status === "finished") {
    return "完场";
  }

  if (row.status === "postponed") {
    return "延期";
  }

  if (row.status === "cancelled") {
    return "取消";
  }

  return formatAppTime(row.kickoff_at);
}

function matchNote(row: MatchRow) {
  const parts = [row.stage, row.matchday ? `第 ${row.matchday} 轮` : null].filter(
    Boolean
  );

  return parts.length > 0 ? parts.join(" · ") : undefined;
}
