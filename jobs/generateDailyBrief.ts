import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnvConfig } from "@next/env";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createChatCompletion, type AiProvider } from "@/lib/ai";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/db";
import { isMainModule } from "@/lib/job-entry";
import {
  addDaysToDateString,
  formatAppTime,
  getAppDateString,
  getUtcQueryWindow
} from "@/lib/datetime";
import {
  articles as mockArticles,
  matchesByDay as mockMatchesByDay,
  todayMatches as mockTodayMatches
} from "@/lib/mock-data";

loadEnvConfig(process.cwd());

type GenerateDailyBriefOptions = {
  date: string;
  dryRun: boolean;
  useAi: boolean;
};

type BriefArticle = {
  source: string;
  title: string;
  summary: string;
  tag: string;
  publishedAt: string;
  url: string | null;
};

type BriefMatch = {
  competition: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  status: string;
  score: string | null;
};

type BriefPreferences = {
  language: string;
  briefTime: string;
  followedLeagues: string[];
  followedTeams: string[];
};

type BriefContext = {
  briefDate: string;
  generatedAt: string;
  preferences: BriefPreferences;
  latestArticles: BriefArticle[];
  todayMatches: BriefMatch[];
  yesterdayResults: BriefMatch[];
};

type GeneratedBrief = {
  title: string;
  summary: string;
  bullets: string[];
  provider: Exclude<AiProvider, "off"> | "fallback";
  model?: string;
};

type ArticleRow = {
  url: string | null;
  title: string;
  summary_zh: string;
  published_at: string | null;
  fetched_at: string;
  tag: string;
  sources: { name: string } | { name: string }[] | null;
};

type MatchRow = {
  competition: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  status: string;
  score_home: number | null;
  score_away: number | null;
};

type PreferenceRow = {
  language: string | null;
  brief_time: string | null;
  followed_leagues: string[] | null;
  followed_teams: string[] | null;
};

export async function generateDailyBrief(options: GenerateDailyBriefOptions) {
  const supabase = hasSupabaseServiceConfig()
    ? createSupabaseServiceClient()
    : null;

  if (!options.dryRun && !supabase) {
    throw new Error(
      "Missing Supabase service config. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or run with --dry-run."
    );
  }

  const context = supabase
    ? await loadBriefContext(supabase, options.date)
    : getMockBriefContext(options.date);
  const brief = await createBrief(context, options.useAi);

  if (!options.dryRun) {
    const { error } = await supabase!.from("daily_briefs").upsert(
      {
        brief_date: options.date,
        bullets: brief.bullets,
        generated_at: new Date().toISOString(),
        raw: {
          articleCount: context.latestArticles.length,
          model: brief.model ?? null,
          provider: brief.provider,
          todayMatchCount: context.todayMatches.length,
          yesterdayResultCount: context.yesterdayResults.length
        },
        summary: brief.summary,
        title: brief.title
      },
      { onConflict: "brief_date" }
    );

    if (error) {
      throw error;
    }
  }

  return {
    brief,
    counts: {
      latestArticles: context.latestArticles.length,
      todayMatches: context.todayMatches.length,
      yesterdayResults: context.yesterdayResults.length
    },
    date: options.date,
    dryRun: options.dryRun
  };
}

async function loadBriefContext(
  supabase: SupabaseClient,
  date: string
): Promise<BriefContext> {
  const yesterday = addDaysToDateString(date, -1);
  const [latestArticles, todayMatches, yesterdayResults, preferences] =
    await Promise.all([
      loadLatestArticles(supabase),
      loadMatchesForDate(supabase, date),
      loadMatchesForDate(supabase, yesterday, true),
      loadPreferences(supabase)
    ]);

  return {
    briefDate: date,
    generatedAt: new Date().toISOString(),
    latestArticles,
    preferences,
    todayMatches,
    yesterdayResults
  };
}

async function loadLatestArticles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("articles")
    .select("url, title, summary_zh, published_at, fetched_at, tag, sources(name)")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("fetched_at", { ascending: false })
    .limit(12);

  if (error) {
    throw error;
  }

  return ((data ?? []) as ArticleRow[]).map((article) => ({
    publishedAt: article.published_at ?? article.fetched_at,
    source: sourceName(article.sources),
    summary: article.summary_zh,
    tag: article.tag,
    title: article.title,
    url: article.url
  }));
}

async function loadMatchesForDate(
  supabase: SupabaseClient,
  date: string,
  finishedOnly = false
) {
  const { start, end } = getUtcQueryWindow(date);
  const { data, error } = await supabase
    .from("matches")
    .select(
      "competition, home_team, away_team, kickoff_at, status, score_home, score_away"
    )
    .gte("kickoff_at", start)
    .lte("kickoff_at", end)
    .order("kickoff_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as MatchRow[])
    .filter((match) => getAppDateString(new Date(match.kickoff_at)) === date)
    .filter((match) => !finishedOnly || isFinished(match))
    .map(toBriefMatch);
}

async function loadPreferences(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("language, brief_time, followed_leagues, followed_teams")
    .eq("user_key", "default")
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = data as PreferenceRow | null;

  return {
    briefTime: row?.brief_time ?? "09:00",
    followedLeagues: row?.followed_leagues ?? [
      "世界杯",
      "欧冠",
      "英超",
      "西甲",
      "意甲",
      "德甲",
      "法甲"
    ],
    followedTeams: row?.followed_teams ?? [],
    language: row?.language ?? "zh-CN"
  };
}

async function createBrief(context: BriefContext, useAi: boolean) {
  if (useAi) {
    try {
      const brief = await generateBriefWithAi(context);
      if (brief) {
        return brief;
      }
    } catch (error) {
      console.error(error);
    }
  }

  return generateFallbackBrief(context);
}

async function generateBriefWithAi(
  context: BriefContext
): Promise<GeneratedBrief | null> {
  const completion = await createChatCompletion({
    messages: [
      {
        content: readPrompt(),
        role: "system"
      },
      {
        content: JSON.stringify(context, null, 2),
        role: "user"
      }
    ],
    responseFormat: "json_object",
    task: "daily-brief",
    temperature: 0.2
  });

  return completion
    ? normalizeGeneratedBrief(
        completion.content,
        completion.model,
        completion.provider
      )
    : null;
}

function generateFallbackBrief(context: BriefContext): GeneratedBrief {
  const matchLine =
    context.todayMatches.length > 0
      ? `今天有 ${context.todayMatches.length} 场关注赛事，${matchName(context.todayMatches[0])} ${context.todayMatches[0].kickoff} 开球。`
      : "今天关注范围内的赛程暂时不多。";
  const resultLine =
    context.yesterdayResults.length > 0
      ? `昨日已收录 ${context.yesterdayResults.length} 场赛果，重点看完场比分与后续新闻确认。`
      : "昨日赛果暂时没有可靠入库数据。";
  const newsLine =
    context.latestArticles.length > 0
      ? `新闻重点来自 ${context.latestArticles[0].source}：${context.latestArticles[0].title}`
      : "最新新闻暂时不多，稍后可以先跑新闻同步。";

  return {
    bullets: [matchLine, resultLine, newsLine],
    provider: "fallback",
    summary: [matchLine, resultLine, newsLine].join(" "),
    title: "今日足球简报"
  };
}

function normalizeGeneratedBrief(
  content: string,
  model: string,
  provider: Exclude<AiProvider, "off">
): GeneratedBrief {
  const jsonText = extractJson(content);
  const parsed = JSON.parse(jsonText) as {
    title?: unknown;
    summary?: unknown;
    bullets?: unknown;
  };
  const bullets = Array.isArray(parsed.bullets)
    ? parsed.bullets
        .filter((bullet): bullet is string => typeof bullet === "string")
        .slice(0, 5)
    : [];

  return {
    bullets: bullets.length > 0 ? bullets : ["暂无可靠要点。"],
    model,
    provider,
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary.trim()
        : "今日数据暂时不多，建议稍后重新生成简报。",
    title:
      typeof parsed.title === "string"
        ? parsed.title.trim()
        : "今日足球简报"
  };
}

function getMockBriefContext(date: string): BriefContext {
  return {
    briefDate: date,
    generatedAt: new Date().toISOString(),
    latestArticles: mockArticles.map((article) => ({
      publishedAt: article.publishedAt,
      source: article.source,
      summary: article.summary,
      tag: article.tag,
      title: article.title,
      url: article.url ?? null
    })),
    preferences: {
      briefTime: "09:00",
      followedLeagues: ["世界杯", "欧冠", "英超", "西甲", "意甲", "德甲", "法甲"],
      followedTeams: [],
      language: "zh-CN"
    },
    todayMatches: mockTodayMatches.map(mockMatchToBriefMatch),
    yesterdayResults: mockMatchesByDay["昨日"].map(mockMatchToBriefMatch)
  };
}

function mockMatchToBriefMatch(match: (typeof mockTodayMatches)[number]) {
  return {
    awayTeam: match.awayTeam,
    competition: match.competition,
    homeTeam: match.homeTeam,
    kickoff: match.kickoff,
    score: match.score ?? null,
    status: match.status
  };
}

function toBriefMatch(match: MatchRow): BriefMatch {
  const hasScore = match.score_home !== null && match.score_away !== null;

  return {
    awayTeam: match.away_team,
    competition: match.competition,
    homeTeam: match.home_team,
    kickoff: formatAppTime(match.kickoff_at),
    score: hasScore ? `${match.score_home}-${match.score_away}` : null,
    status: match.status
  };
}

function isFinished(match: MatchRow) {
  return (
    match.status === "finished" ||
    (match.score_home !== null && match.score_away !== null)
  );
}

function matchName(match: BriefMatch) {
  return `${match.competition} ${match.homeTeam} vs ${match.awayTeam}`;
}

function sourceName(source: ArticleRow["sources"]) {
  if (Array.isArray(source)) {
    return source[0]?.name ?? "RSS";
  }

  return source?.name ?? "RSS";
}

function readPrompt() {
  return readFileSync(join(process.cwd(), "prompts/daily-brief.md"), "utf8");
}

function extractJson(content: string) {
  const trimmed = content.trim().replace(/^```json/i, "").replace(/```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("Daily brief response did not contain JSON.");
  }

  return trimmed.slice(start, end + 1);
}

function parseOptions(argv: string[]): GenerateDailyBriefOptions {
  return {
    date: readStringArg(argv, "--date") ?? getAppDateString(),
    dryRun: argv.includes("--dry-run"),
    useAi: !argv.includes("--no-ai")
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

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const result = await generateDailyBrief(options);

  console.log(JSON.stringify(result, null, 2));
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
