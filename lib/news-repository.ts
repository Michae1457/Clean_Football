import { createSupabaseAnonClient, hasSupabaseAnonConfig } from "@/lib/db";
import { articles as mockArticles } from "@/lib/mock-data";
import type { Article, ArticleDetail } from "@/lib/types";

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

type ArticleDetailRow = ArticleRow & {
  content_snippet: string | null;
  language: string;
  original_summary: string | null;
  original_title: string | null;
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

export async function getArticleById(id: string): Promise<ArticleDetail | null> {
  if (!hasSupabaseAnonConfig()) {
    const article = mockArticles.find((item) => item.id === id);

    return article
      ? {
          ...article,
          contentSnippet: article.summary,
          fetchedAt: article.publishedAt,
          language: "zh-CN",
          originalSummary: article.summary,
          originalTitle: article.title
        }
      : null;
  }

  try {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, url, title, original_title, summary_zh, original_summary, content_snippet, language, published_at, fetched_at, tag, sources(name)"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? toArticleDetail(data as ArticleDetailRow) : null;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to load article detail.");
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

function toArticleDetail(row: ArticleDetailRow): ArticleDetail {
  return {
    ...toArticle(row),
    contentSnippet: row.content_snippet ?? undefined,
    fetchedAt: formatPublishedAt(row.fetched_at),
    language: row.language,
    originalSummary: row.original_summary ?? undefined,
    originalTitle: row.original_title ?? undefined
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
