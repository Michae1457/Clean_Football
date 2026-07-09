export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";

export type Match = {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  status: MatchStatus;
  score?: string;
  note?: string;
};

export type Article = {
  id: string;
  source: string;
  title: string;
  summary: string;
  publishedAt: string;
  tag: string;
  url?: string;
};

export type ArticleDetail = Article & {
  contentSnippet?: string;
  fetchedAt: string;
  language: string;
  originalSummary?: string;
  originalTitle?: string;
};

export type DailyBrief = {
  date: string;
  title: string;
  summary: string;
  bullets: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
