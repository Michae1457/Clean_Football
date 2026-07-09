import type { NextRequest } from "next/server";
import { generateDailyBrief } from "@/jobs/generateDailyBrief";
import { fetchMatches } from "@/jobs/fetchMatches";
import { fetchNews } from "@/jobs/fetchNews";
import { getAppDateString } from "@/lib/datetime";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
export const runtime = "nodejs";

type CronPayload = {
  date: string;
  errors: string[];
  jobs: {
    brief?: unknown;
    matches?: unknown;
    news?: unknown;
  };
  ok: boolean;
  schedule: string | null;
};

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date") ?? getAppDateString();
  const maxPerSource =
    readPositiveInteger(
      process.env.CRON_MAX_PER_SOURCE ?? process.env.NEWS_FETCH_LIMIT_PER_SOURCE
    ) ?? 8;
  const useNewsAi = readBooleanFlag(
    process.env.CRON_NEWS_USE_AI ?? process.env.AI_ENABLE_ARTICLE_SUMMARY,
    true
  );
  const useBriefAi = readBooleanFlag(
    process.env.CRON_BRIEF_USE_AI ?? process.env.AI_ENABLE_DAILY_BRIEF,
    true
  );
  const payload: CronPayload = {
    date,
    errors: [],
    jobs: {},
    ok: true,
    schedule: request.headers.get("x-vercel-cron-schedule")
  };

  try {
    const results = await fetchMatches({ date, dryRun: false });
    payload.jobs.matches = results;
    payload.errors.push(
      ...results
        .filter((result) => result.error)
        .map((result) => `matches:${result.league}:${result.error}`)
    );
  } catch (error) {
    payload.jobs.matches = { error: toErrorMessage(error) };
    payload.errors.push(`matches:${toErrorMessage(error)}`);
  }

  try {
    const results = await fetchNews({
      dryRun: false,
      maxPerSource,
      useAi: useNewsAi
    });
    payload.jobs.news = results;
    payload.errors.push(
      ...results
        .filter((result) => result.error && !result.optional)
        .map((result) => `news:${result.source}:${result.error}`)
    );
  } catch (error) {
    payload.jobs.news = { error: toErrorMessage(error) };
    payload.errors.push(`news:${toErrorMessage(error)}`);
  }

  try {
    payload.jobs.brief = await generateDailyBrief({
      date,
      dryRun: false,
      useAi: useBriefAi
    });
  } catch (error) {
    payload.jobs.brief = { error: toErrorMessage(error) };
    payload.errors.push(`brief:${toErrorMessage(error)}`);
  }

  payload.ok = payload.errors.length === 0;

  return Response.json(payload, {
    status: payload.ok ? 200 : 500
  });
}

function isAuthorizedCronRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret && process.env.NODE_ENV !== "production") {
    return true;
  }

  return Boolean(
    cronSecret && request.headers.get("authorization") === `Bearer ${cronSecret}`
  );
}

function readPositiveInteger(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readBooleanFlag(value: string | undefined, fallback: boolean) {
  if (!value) {
    return fallback;
  }

  return !["0", "false", "no", "off"].includes(value.toLowerCase());
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
