import { loadEnvConfig } from "@next/env";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/db";
import { isMainModule } from "@/lib/job-entry";
import { getRssNewsSources, type NewsSource } from "@/lib/news-sources";
import { summarizeArticleToChinese } from "@/lib/article-summary";
import {
  fetchRssArticles,
  isBettingArticle,
  type ParsedRssArticle
} from "@/lib/rss";

loadEnvConfig(process.cwd());

type FetchNewsOptions = {
  dryRun: boolean;
  maxPerSource: number;
  useAi: boolean;
};

type SourceResult = {
  source: string;
  fetched: number;
  skipped: number;
  inserted: number;
  optional?: boolean;
  error?: string;
};

export async function fetchNews(options: FetchNewsOptions) {
  const results: SourceResult[] = [];
  const sources = getRssNewsSources();
  const supabase =
    options.dryRun || !hasSupabaseServiceConfig()
      ? null
      : createSupabaseServiceClient();

  if (!options.dryRun && !supabase) {
    throw new Error(
      "Missing Supabase service config. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or run with --dry-run."
    );
  }

  for (const source of sources.filter((item) => item.enabled)) {
    try {
      const fetched = await fetchRssArticles(source, {
        maxItems: options.maxPerSource
      });
      const safeArticles = fetched.filter((article) => !isBettingArticle(article));

      if (options.dryRun) {
        results.push({
          source: source.name,
          fetched: fetched.length,
          skipped: fetched.length - safeArticles.length,
          inserted: 0,
          optional: source.optional
        });
        continue;
      }

      const sourceId = await upsertSource(supabase!, source);
      const rows = await Promise.all(
        safeArticles.map(async (article) =>
          toArticleRow(article, sourceId, options.useAi)
        )
      );

      const { error } = await supabase!
        .from("articles")
        .upsert(rows, { onConflict: "url" });

      if (error) {
        throw error;
      }

      results.push({
        source: source.name,
        fetched: fetched.length,
        skipped: fetched.length - safeArticles.length,
        inserted: rows.length,
        optional: source.optional
      });
    } catch (error) {
      results.push({
        source: source.name,
        fetched: 0,
        skipped: 0,
        inserted: 0,
        optional: source.optional,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return results;
}

async function upsertSource(supabase: ReturnType<typeof createSupabaseServiceClient>, source: NewsSource) {
  const { data, error } = await supabase
    .from("sources")
    .upsert(
      {
        slug: source.slug,
        name: source.name,
        type: "rss",
        url: source.url,
        language: source.language,
        enabled: source.enabled
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

async function toArticleRow(
  article: ParsedRssArticle,
  sourceId: string,
  useAi: boolean
) {
  const summary = await summarizeArticleToChinese(article, { useAi });

  return {
    source_id: sourceId,
    url: article.url,
    canonical_url: article.url,
    title: article.title,
    original_title: article.title,
    summary_zh: summary.summary,
    original_summary: article.description,
    content_snippet: article.description,
    language: article.language,
    tag: article.tag,
    summary_status: summary.status,
    published_at: article.publishedAt?.toISOString() ?? null,
    fetched_at: new Date().toISOString(),
    raw: {
      guid: article.guid,
      author: article.author,
      source: article.source.slug,
      item: article.raw
    }
  };
}

function parseOptions(argv: string[]): FetchNewsOptions {
  const maxPerSource = readNumberArg(argv, "--max-per-source") ?? 20;

  return {
    dryRun: argv.includes("--dry-run"),
    maxPerSource,
    useAi: !argv.includes("--no-ai")
  };
}

function readNumberArg(argv: string[], name: string) {
  const inline = argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) {
    return Number(inline.split("=")[1]);
  }

  const index = argv.indexOf(name);
  if (index >= 0) {
    return Number(argv[index + 1]);
  }

  return null;
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const results = await fetchNews(options);

  console.table(results);

  const failed = results.filter((result) => result.error && !result.optional);
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
