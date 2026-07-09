import { getTodayBrief } from "@/lib/daily-brief-repository";
import { getTodayMatches } from "@/lib/match-repository";
import { getLatestArticles } from "@/lib/news-repository";
import type { Article, DailyBrief, Match } from "@/lib/types";

export type AgentToolContext = {
  todayBrief: DailyBrief | null;
  todayMatches: Match[];
  latestArticles: Article[];
  relevantNews: Article[];
};

export async function getAgentToolContext(question: string) {
  const [todayBrief, todayMatches, latestArticles] = await Promise.all([
    getTodayBrief(),
    getTodayMatches(),
    getLatestArticles(40)
  ]);

  return {
    latestArticles: latestArticles.slice(0, 8),
    relevantNews: searchArticles(latestArticles, question).slice(0, 8),
    todayBrief,
    todayMatches
  };
}

export async function searchNews(query: string, limit = 8) {
  const articles = await getLatestArticles(40);
  return searchArticles(articles, query).slice(0, limit);
}

export async function getTeamNews(teamName: string, limit = 8) {
  return searchNews(teamName, limit);
}

function searchArticles(articles: Article[], query: string) {
  const keywords = getKeywords(query);

  if (keywords.length === 0) {
    return articles;
  }

  const scored = articles
    .map((article) => ({
      article,
      score: scoreArticle(article, keywords)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.length > 0 ? scored.map((item) => item.article) : articles;
}

function scoreArticle(article: Article, keywords: string[]) {
  const text = `${article.title} ${article.summary} ${article.tag} ${article.source}`
    .toLowerCase()
    .replace(/\s+/g, " ");

  return keywords.reduce((score, keyword) => {
    return text.includes(keyword) ? score + keyword.length : score;
  }, 0);
}

function getKeywords(query: string) {
  const normalized = query.toLowerCase();
  const englishWords = normalized.match(/[a-z0-9][a-z0-9-]{2,}/g) ?? [];
  const chineseChunks = normalized.match(/[\u4e00-\u9fff]{2,}/g) ?? [];
  const footballTerms = [
    "英超",
    "西甲",
    "意甲",
    "德甲",
    "法甲",
    "欧冠",
    "世界杯",
    "转会",
    "冷门",
    "战术",
    "赛程",
    "新闻"
  ].filter((term) => normalized.includes(term));

  return Array.from(new Set([...englishWords, ...chineseChunks, ...footballTerms]));
}
