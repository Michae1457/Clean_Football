import { createSupabaseAnonClient, hasSupabaseAnonConfig } from "@/lib/db";
import { articles as mockArticles } from "@/lib/mock-data";
import type { Article } from "@/lib/types";

type ArticleRow = {
  id: string;
  url: string;
  title: string;
  summary_zh: string;
  published_at: string | null;
  fetched_at: string;
  tag: string;
  sources: { name: string } | { name: string }[] | null;
};

export async function getLatestArticles(limit = 30): Promise<Article[]> {
  if (!hasSupabaseAnonConfig()) {
    return mockArticles;
  }

  try {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, url, title, summary_zh, published_at, fetched_at, tag, sources(name)"
      )
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("fetched_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return ((data ?? []) as ArticleRow[]).map(toArticle);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to load latest articles.");
  }
}

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    source: sourceName(row.sources),
    title: row.title,
    summary: row.summary_zh,
    publishedAt: formatPublishedAt(row.published_at ?? row.fetched_at),
    tag: row.tag,
    url: row.url
  };
}

function sourceName(source: ArticleRow["sources"]) {
  if (Array.isArray(source)) {
    return source[0]?.name ?? "RSS";
  }

  return source?.name ?? "RSS";
}

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai"
  })
    .format(new Date(value))
    .replace(/\//g, "-");
}
