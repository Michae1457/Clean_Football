import { MatchDayTabs } from "@/components/matches/match-day-tabs";
import { getMatchesByDay } from "@/lib/match-repository";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const matchesByDay = await getMatchesByDay();

  return <MatchDayTabs matchesByDay={matchesByDay} />;
}
