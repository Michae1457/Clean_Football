export type SportsDbLeague = {
  id: string;
  name: string;
  shortName: string;
  priority: number;
};

export type SportsDbEvent = {
  idEvent: string;
  strTimestamp?: string | null;
  strEvent?: string | null;
  strSport?: string | null;
  idLeague?: string | null;
  strLeague?: string | null;
  strSeason?: string | null;
  strHomeTeam?: string | null;
  strAwayTeam?: string | null;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  intRound?: string | null;
  dateEvent?: string | null;
  strTime?: string | null;
  strVenue?: string | null;
  strCountry?: string | null;
  strStatus?: string | null;
  strPostponed?: string | null;
};

export type NormalizedSportsDbMatch = {
  external_id: string;
  competition: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  score_home: number | null;
  score_away: number | null;
  stage: string | null;
  matchday: number | null;
  raw: Record<string, unknown>;
};

export const trackedSportsDbLeagues: SportsDbLeague[] = [
  { id: "4429", name: "FIFA World Cup", shortName: "世界杯", priority: 1 },
  { id: "4480", name: "UEFA Champions League", shortName: "欧冠", priority: 2 },
  { id: "4328", name: "English Premier League", shortName: "英超", priority: 3 },
  { id: "4335", name: "Spanish La Liga", shortName: "西甲", priority: 4 },
  { id: "4332", name: "Italian Serie A", shortName: "意甲", priority: 5 },
  { id: "4331", name: "German Bundesliga", shortName: "德甲", priority: 6 },
  { id: "4334", name: "French Ligue 1", shortName: "法甲", priority: 7 }
];

const baseUrl = "https://www.thesportsdb.com/api/v1/json";

export function getSportsDbApiKey() {
  return process.env.THESPORTSDB_API_KEY || "123";
}

export async function fetchSportsDbEventsByDate({
  date,
  leagueId,
  apiKey = getSportsDbApiKey()
}: {
  date: string;
  leagueId: string;
  apiKey?: string;
}) {
  const url = new URL(`${baseUrl}/${apiKey}/eventsday.php`);
  url.searchParams.set("d", date);
  url.searchParams.set("l", leagueId);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "CleanFootballDemo/0.1 TheSportsDB Client"
    }
  });

  if (!response.ok) {
    throw new Error(`TheSportsDB eventsday failed: ${response.status}`);
  }

  const payload = (await response.json()) as { events?: SportsDbEvent[] | null };
  return payload.events ?? [];
}

export function normalizeSportsDbEvent(
  event: SportsDbEvent
): NormalizedSportsDbMatch | null {
  if (!event.idEvent || !event.strHomeTeam || !event.strAwayTeam) {
    return null;
  }

  const kickoffAt = toKickoffAt(event);

  if (!kickoffAt) {
    return null;
  }

  return {
    external_id: `thesportsdb:${event.idEvent}`,
    competition: toCompetition(event),
    home_team: event.strHomeTeam,
    away_team: event.strAwayTeam,
    kickoff_at: kickoffAt,
    status: toMatchStatus(event),
    score_home: toNullableNumber(event.intHomeScore),
    score_away: toNullableNumber(event.intAwayScore),
    stage: event.strSeason || null,
    matchday: toNullableNumber(event.intRound),
    raw: {
      provider: "thesportsdb",
      ...event
    }
  };
}

export function getTrackedLeagueName(leagueId: string) {
  return (
    trackedSportsDbLeagues.find((league) => league.id === leagueId)?.shortName ??
    leagueId
  );
}

function toKickoffAt(event: SportsDbEvent) {
  if (event.strTimestamp) {
    return new Date(`${event.strTimestamp.replace(/Z$/, "")}Z`).toISOString();
  }

  if (event.dateEvent) {
    return new Date(`${event.dateEvent}T${event.strTime || "00:00:00"}Z`).toISOString();
  }

  return null;
}

function toMatchStatus(event: SportsDbEvent): NormalizedSportsDbMatch["status"] {
  const status = event.strStatus?.toLowerCase() ?? "";
  const hasScore =
    toNullableNumber(event.intHomeScore) !== null &&
    toNullableNumber(event.intAwayScore) !== null;

  if (event.strPostponed?.toLowerCase() === "yes") {
    return "postponed";
  }

  if (["ft", "aet", "pen"].includes(status) || hasScore) {
    return "finished";
  }

  if (["live", "1h", "2h", "ht"].includes(status)) {
    return "live";
  }

  if (["post", "postponed"].includes(status)) {
    return "postponed";
  }

  if (["canc", "cancelled", "canceled"].includes(status)) {
    return "cancelled";
  }

  return "scheduled";
}

function toCompetition(event: SportsDbEvent) {
  const trackedLeague = trackedSportsDbLeagues.find(
    (league) => league.id === event.idLeague
  );

  return trackedLeague?.shortName ?? event.strLeague ?? "足球";
}

function toNullableNumber(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
