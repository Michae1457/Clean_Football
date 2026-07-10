export type WebSearchResult = {
  content: string;
  publishedDate?: string;
  title: string;
  url: string;
};

type TavilyResult = {
  content?: unknown;
  published_date?: unknown;
  title?: unknown;
  url?: unknown;
};

type TavilyResponse = {
  results?: TavilyResult[];
};

export function hasAgentWebSearchConfig() {
  return isTruthy(process.env.AGENT_WEB_SEARCH_ENABLED, true) &&
    Boolean(process.env.TAVILY_API_KEY);
}

export async function searchFootballWeb(
  question: string
): Promise<WebSearchResult[]> {
  if (!hasAgentWebSearchConfig() || !question.trim()) {
    return [];
  }

  const response = await fetch("https://api.tavily.com/search", {
    body: JSON.stringify({
      days: 7,
      include_answer: false,
      include_raw_content: false,
      max_results: Number(process.env.AGENT_WEB_SEARCH_MAX_RESULTS ?? 5),
      query: buildFootballSearchQuery(question),
      search_depth: "basic",
      topic: "news"
    }),
    headers: {
      "content-type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `web search failed: ${response.status} ${detail.slice(0, 240)}`
    );
  }

  const payload = (await response.json()) as TavilyResponse;

  return (payload.results ?? [])
    .map(toWebSearchResult)
    .filter((result): result is WebSearchResult => Boolean(result))
    .slice(0, 5);
}

function buildFootballSearchQuery(question: string) {
  return `${question.trim()} football soccer latest news tactics lineups injuries`;
}

function toWebSearchResult(result: TavilyResult): WebSearchResult | null {
  const title = typeof result.title === "string" ? result.title.trim() : "";
  const url = typeof result.url === "string" ? result.url.trim() : "";

  if (!title || !url) {
    return null;
  }

  return {
    content:
      typeof result.content === "string" ? result.content.trim().slice(0, 500) : "",
    publishedDate:
      typeof result.published_date === "string"
        ? result.published_date
        : undefined,
    title,
    url
  };
}

function isTruthy(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) {
    return defaultValue;
  }

  return !["0", "false", "no", "off"].includes(value.toLowerCase());
}
