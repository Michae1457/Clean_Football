import { XMLParser } from "fast-xml-parser";
import type { NewsSource } from "@/lib/news-sources";

export type ParsedRssArticle = {
  source: NewsSource;
  title: string;
  url: string;
  guid?: string;
  description: string;
  author?: string;
  language: NewsSource["language"];
  tag: string;
  publishedAt: Date | null;
  raw: unknown;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseTagValue: false,
  trimValues: true
});

export async function fetchRssArticles(
  source: NewsSource,
  options: { maxItems?: number; timeoutMs?: number } = {}
) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 15000
  );

  try {
    const response = await fetch(source.url, {
      headers: {
        accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "user-agent": "CleanFootballDemo/0.1 RSS Reader"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`RSS request failed: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    return parseRssArticles(xml, source).slice(0, options.maxItems ?? 20);
  } finally {
    clearTimeout(timeout);
  }
}

export function parseRssArticles(xml: string, source: NewsSource): ParsedRssArticle[] {
  const parsed = parser.parse(xml);
  const channel = parsed?.rss?.channel;
  const rawItems = arrayify(channel?.item ?? parsed?.feed?.entry);

  return rawItems
    .map((item) => toArticle(item, source))
    .filter((item): item is ParsedRssArticle => Boolean(item));
}

export function isBettingArticle(article: Pick<ParsedRssArticle, "title" | "description" | "url">) {
  const haystack = `${article.title} ${article.description} ${article.url}`.toLowerCase();
  return [
    "best bet",
    "best bets",
    "betting",
    "odds",
    "prop bet",
    "props",
    "futures",
    "picks",
    "wager",
    "投注",
    "赔率"
  ].some((keyword) => haystack.includes(keyword));
}

function toArticle(
  item: Record<string, unknown>,
  source: NewsSource
): ParsedRssArticle | null {
  const title = cleanText(textValue(item.title));
  const url = normalizeUrl(
    textValue(item.link) ||
      textValue((item.link as { href?: unknown } | undefined)?.href) ||
      textValue(item.guid) ||
      textValue(item.id)
  );

  if (!title || !url) {
    return null;
  }

  const description = cleanText(
    stripHtml(
      textValue(item.description) ||
        textValue(item.summary) ||
        textValue(item["content:encoded"]) ||
        textValue(item.content)
    )
  );

  const publishedAt = parseRssDate(
    textValue(item.pubDate) ||
      textValue(item.published) ||
      textValue(item.updated) ||
      textValue(item["dc:date"])
  );

  return {
    source,
    title,
    url,
    guid: cleanText(textValue(item.guid) || textValue(item.id)) || undefined,
    description,
    author:
      cleanText(textValue(item.author) || textValue(item["dc:creator"])) || undefined,
    language: source.language,
    tag: inferFootballTag(`${title} ${description}`),
    publishedAt,
    raw: item
  };
}

function arrayify<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return textValue(value[0]);
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return (
      textValue(record["#text"]) ||
      textValue(record.__cdata) ||
      textValue(record.href) ||
      textValue(record.url)
    );
  }

  return "";
}

function cleanText(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

function normalizeUrl(value: string) {
  const cleanValue = decodeHtmlEntities(value).trim();

  try {
    const url = new URL(cleanValue);
    url.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "at_medium", "at_campaign"].forEach(
      (param) => url.searchParams.delete(param)
    );
    return url.toString();
  } catch {
    return cleanValue;
  }
}

function parseRssDate(value: string) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\bEST\b/i, "-0500").replace(/\bEDT\b/i, "-0400");
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

function inferFootballTag(value: string) {
  const text = value.toLowerCase();

  if (text.includes("transfer") || text.includes("sign") || text.includes("转会")) {
    return "转会";
  }

  if (text.includes("world cup") || text.includes("世界杯")) {
    return "世界杯";
  }

  if (text.includes("champions league") || text.includes("europa")) {
    return "欧战";
  }

  if (text.includes("premier league") || text.includes("arsenal") || text.includes("chelsea")) {
    return "英超";
  }

  if (text.includes("real madrid") || text.includes("barcelona") || text.includes("la liga")) {
    return "西甲";
  }

  return "足球";
}
