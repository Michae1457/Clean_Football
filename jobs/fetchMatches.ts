import { loadEnvConfig } from "@next/env";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/db";
import { isMainModule } from "@/lib/job-entry";
import {
  fetchSportsDbEventsByDate,
  getTrackedLeagueName,
  normalizeSportsDbEvent,
  type NormalizedSportsDbMatch,
  trackedSportsDbLeagues
} from "@/lib/thesportsdb";

loadEnvConfig(process.cwd());

type FetchMatchesOptions = {
  dryRun: boolean;
  date: string;
};

type SyncResult = {
  date: string;
  league: string;
  fetched: number;
  upserted: number;
  error?: string;
};

export async function fetchMatches(options: FetchMatchesOptions) {
  const supabase =
    options.dryRun || !hasSupabaseServiceConfig()
      ? null
      : createSupabaseServiceClient();

  if (!options.dryRun && !supabase) {
    throw new Error(
      "Missing Supabase service config. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or run with --dry-run."
    );
  }

  const dates = getDateWindow(options.date);
  const results: SyncResult[] = [];

  for (const date of dates) {
    for (const league of trackedSportsDbLeagues) {
      try {
        const events = await fetchSportsDbEventsByDate({
          date,
          leagueId: league.id
        });
        const rows = events
          .map(normalizeSportsDbEvent)
          .filter((event): event is NormalizedSportsDbMatch => Boolean(event));

        if (!options.dryRun && rows.length > 0) {
          const { error } = await supabase!
            .from("matches")
            .upsert(rows, { onConflict: "external_id" });

          if (error) {
            throw error;
          }
        }

        results.push({
          date,
          league: league.shortName,
          fetched: events.length,
          upserted: options.dryRun ? 0 : rows.length
        });
      } catch (error) {
        results.push({
          date,
          league: getTrackedLeagueName(league.id),
          fetched: 0,
          upserted: 0,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  return results;
}

function getDateWindow(anchorDate: string) {
  const anchor = parseDateOnly(anchorDate);
  return [-1, 0, 1].map((offset) => formatDate(addDays(anchor, offset)));
}

function parseOptions(argv: string[]): FetchMatchesOptions {
  return {
    dryRun: argv.includes("--dry-run"),
    date: readStringArg(argv, "--date") ?? formatDate(new Date())
  };
}

function readStringArg(argv: string[], name: string) {
  const inline = argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) {
    return inline.split("=")[1];
  }

  const index = argv.indexOf(name);
  if (index >= 0) {
    return argv[index + 1];
  }

  return null;
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const results = await fetchMatches(options);

  console.table(results);

  const failed = results.filter((result) => result.error);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
