import { NextResponse } from "next/server";
import { fetchNews } from "@/jobs/fetchNews";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
export const runtime = "nodejs";

const globalForRefresh = globalThis as typeof globalThis & {
  cleanFootballNewsRefreshAt?: number;
};

export async function POST() {
  const cooldownSeconds =
    readPositiveInteger(process.env.NEWS_REFRESH_COOLDOWN_SECONDS) ?? 5 * 60;
  const cooldownMs = cooldownSeconds * 1000;
  const now = Date.now();
  const lastRefreshAt = globalForRefresh.cleanFootballNewsRefreshAt ?? 0;
  const remainingMs = cooldownMs - (now - lastRefreshAt);

  if (remainingMs > 0) {
    return NextResponse.json(
      {
        error: "News refresh is cooling down.",
        retryAfterSeconds: Math.ceil(remainingMs / 1000)
      },
      { status: 429 }
    );
  }

  globalForRefresh.cleanFootballNewsRefreshAt = now;

  try {
    const results = await fetchNews({
      dryRun: false,
      maxPerSource: getMaxPerSource(),
      useAi: getUseAi()
    });
    const failed = results.filter((result) => result.error && !result.optional);

    return NextResponse.json(
      {
        ok: failed.length === 0,
        refreshedAt: new Date().toISOString(),
        results
      },
      { status: failed.length === 0 ? 200 : 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        ok: false
      },
      { status: 500 }
    );
  }
}

function getMaxPerSource() {
  return (
    readPositiveInteger(process.env.NEWS_REFRESH_LIMIT_PER_SOURCE) ??
    readPositiveInteger(process.env.CRON_MAX_PER_SOURCE) ??
    readPositiveInteger(process.env.NEWS_FETCH_LIMIT_PER_SOURCE) ??
    8
  );
}

function getUseAi() {
  return readBooleanFlag(
    process.env.NEWS_REFRESH_USE_AI ?? process.env.CRON_NEWS_USE_AI,
    true
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
