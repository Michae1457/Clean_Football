import { createSupabaseAnonClient, hasSupabaseAnonConfig } from "@/lib/db";
import {
  formatBriefDateFromDateString,
  formatBriefDisplayDate,
  getAppDateString
} from "@/lib/datetime";
import { dailyBrief as mockDailyBrief } from "@/lib/mock-data";
import type { DailyBrief } from "@/lib/types";

type DailyBriefRow = {
  brief_date: string;
  title: string;
  summary: string;
  bullets: unknown;
  generated_at: string | null;
};

export async function getTodayBrief(
  date = getAppDateString()
): Promise<DailyBrief | null> {
  if (!hasSupabaseAnonConfig()) {
    return mockDailyBrief;
  }

  try {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("daily_briefs")
      .select("brief_date, title, summary, bullets, generated_at")
      .eq("brief_date", date)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? toDailyBrief(data as DailyBriefRow) : null;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to load daily brief.");
  }
}

function toDailyBrief(row: DailyBriefRow): DailyBrief {
  return {
    bullets: toBullets(row.bullets),
    date: row.generated_at
      ? formatBriefDisplayDate(row.generated_at)
      : formatBriefDateFromDateString(row.brief_date),
    summary: row.summary,
    title: row.title
  };
}

function toBullets(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}
