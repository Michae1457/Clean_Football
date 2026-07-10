import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createChatCompletion, type AiChatMessage } from "@/lib/ai";
import {
  agentProfiles,
  defaultAgentProfileId,
  getAgentProfile,
  type AgentMessage,
  type AgentProfile,
  type AgentProfileId
} from "@/lib/agent-profiles";
import { consumeAgentDailyLimit } from "@/lib/agent-rate-limit";
import { getAgentToolContext, type AgentToolContext } from "@/lib/agent-tools";
import type { Article, Match } from "@/lib/types";
import {
  searchFootballWeb,
  type WebSearchResult
} from "@/lib/web-search";

export type AgentReply = {
  content: string;
  error?: string;
  mode: "ai" | "fallback";
  model?: string;
  provider?: string;
};

export async function answerAgentQuestion({
  agentId,
  messages
}: {
  agentId: AgentProfileId;
  messages: AgentMessage[];
}): Promise<AgentReply> {
  const profile = getAgentProfile(agentId);
  const latestQuestion = latestUserMessage(messages);
  const [context, webResults] = await Promise.all([
    getAgentToolContext(latestQuestion),
    searchFootballWeb(latestQuestion).catch((error) => {
      console.error(error);
      return [];
    })
  ]);

  if (profile.id === "predictor") {
    const limit = await consumeAgentDailyLimit(profile.id).catch((error) => {
      console.error(error);
      return { allowed: false, maxRequests: 1 };
    });

    if (!limit.allowed) {
      return {
        content: `预测大师今天的 AI 请求次数已经用完了。为了控制高价模型成本，这个模式每天最多 ${limit.maxRequests} 次。你可以先切到懂球朋友或战术专家继续聊，我会继续遵守不编数据、不提供投注建议的边界。`,
        mode: "fallback"
      };
    }
  }

  try {
    const completion = await createChatCompletion({
      agentId: profile.id,
      messages: buildAiMessages(profile, messages, context, webResults),
      task: "agent",
      temperature: profile.id === "predictor" ? 0.15 : 0.25,
      throwOnDisabled: true
    });

    if (completion?.content) {
      return {
        content: completion.content,
        mode: "ai",
        model: completion.model,
        provider: completion.provider
      };
    }
  } catch (error) {
    console.error(error);
    return {
      content: buildFallbackAnswer(profile, latestQuestion, context),
      error: toUserFacingError(error),
      mode: "fallback"
    };
  }

  return {
    content: buildFallbackAnswer(profile, latestQuestion, context),
    mode: "fallback"
  };
}

export function parseAgentId(value: unknown): AgentProfileId {
  return agentProfiles.some((profile) => profile.id === value)
    ? (value as AgentProfileId)
    : defaultAgentProfileId;
}

function buildAiMessages(
  profile: AgentProfile,
  messages: AgentMessage[],
  context: AgentToolContext,
  webResults: WebSearchResult[]
): AiChatMessage[] {
  return [
    {
      role: "system",
      content: `${readAgentPrompt(profile)}\n\n知识边界：\n- 用户询问足球规则、术语、历史常识、球员庆祝动作、战术概念、观赛入门等通用足球知识时，可以基于你的通用知识回答。\n- 用户询问“今天/现在/最新/这场/这队最近/伤病/首发/转会是否完成”等实时或当前状态时，优先基于下面提供的站内实时数据和联网搜索结果回答。\n- 使用联网搜索结果时，必须明确说“联网搜索显示”或点出来源名称；如果搜索结果不足，不要补事实。\n- 如果通用知识和当前数据冲突，优先说明当前数据有限，不要编造实时事实。\n\n当前可用站内实时数据如下：\n${JSON.stringify(
        toCompactContext(context),
        null,
        2
      )}\n\n联网搜索结果如下：\n${JSON.stringify(
        toCompactWebResults(webResults),
        null,
        2
      )}`
    },
    ...messages.slice(-8).map((message) => ({
      role: message.role,
      content: message.content
    }))
  ];
}

function buildFallbackAnswer(
  profile: AgentProfile,
  question: string,
  context: AgentToolContext
) {
  if (profile.id === "tactician") {
    return buildTacticianFallback(context);
  }

  if (profile.id === "predictor") {
    return buildPredictorFallback(context);
  }

  return buildFriendFallback(question, context);
}

function buildFriendFallback(question: string, context: AgentToolContext) {
  if (isSummaryQuestion(question)) {
    if (context.todayBrief) {
      return `${context.todayBrief.summary}\n\n${bulletSummary(
        context.todayBrief.bullets
      )}`;
    }

    return "今天的简报还没有生成。我可以先基于已经入库的赛程和新闻，帮你抓重点；如果两边都还没有数据，就需要等同步完成。";
  }

  const topMatch = pickRelevantMatch(context.todayMatches);
  const topNews = firstNews(context);

  if (!topMatch && !topNews) {
    return "现在没有足够可靠的数据。我可以等新闻和赛程同步后，再帮你整理今天重点。";
  }

  if (!topMatch) {
    return `今天关注范围内暂时没有可靠赛程。新闻上可以先看：${topNews?.title}。`;
  }

  return `我会先看 ${matchName(topMatch)}。理由很简单：这是当前赛程里最明确的一场，${matchTimeText(topMatch)}。${
    topNews ? `新闻侧可以顺手关注：${topNews.title}。` : ""
  }目前缺少首发和伤病来源，所以我不会把判断说满。`;
}

function buildTacticianFallback(context: AgentToolContext) {
  const match = pickRelevantMatch(context.todayMatches);

  if (!match) {
    return "基于现有信息，今天没有足够明确的关注比赛可做战术拆解。需要至少有具体比赛、首发或近期比赛新闻，才能谈阵型和关键对位。";
  }

  return `总判断：先看 ${matchName(match)} 的节奏控制。\n\n结构：目前只有赛程和新闻摘要，缺少首发、阵型和近期控球数据。\n关键对位：可以先观察中场推进和边路身后空间，但不能编具体球员状态。\n比赛变量：轮换、体能和临场首发会明显影响判断。\n\n观赛重点：开局 15 分钟谁能把球稳定推进到前场。`;
}

function buildPredictorFallback(context: AgentToolContext) {
  const match = pickRelevantMatch(context.todayMatches);

  if (!match) {
    return "趋势判断：今天关注范围内暂时没有可靠赛程，不能做趋势判断。\n信心：低。\n最大不确定性：缺少比赛对象、首发、伤病和近期状态。这里不做投注建议，也不猜准确比分。";
  }

  return `趋势判断：${matchName(match)} 更适合看风险，而不是猜结果。\n信心：中低。\n主要依据：当前只有赛程、简报和新闻摘要，能判断关注度，但不足以判断具体胜负。\n最大不确定性：首发、轮换、伤病和临场身体状态。\n这里不做准确比分或投注建议。`;
}

function latestUserMessage(messages: AgentMessage[]) {
  return (
    [...messages].reverse().find((message) => message.role === "user")?.content ??
    ""
  );
}

function readAgentPrompt(profile: AgentProfile) {
  return readFileSync(join(process.cwd(), profile.promptPath), "utf8");
}

function toCompactContext(context: AgentToolContext) {
  return {
    latestArticles: context.latestArticles.slice(0, 8).map(toArticleSummary),
    relevantNews: context.relevantNews.slice(0, 8).map(toArticleSummary),
    todayBrief: context.todayBrief ?? { status: "missing" },
    todayMatches: context.todayMatches.slice(0, 8).map(toMatchSummary)
  };
}

function toCompactWebResults(results: WebSearchResult[]) {
  return results.map((result) => ({
    content: result.content,
    publishedDate: result.publishedDate,
    title: result.title,
    url: result.url
  }));
}

function toArticleSummary(article: Article) {
  return {
    publishedAt: article.publishedAt,
    source: article.source,
    summary: article.summary,
    tag: article.tag,
    title: article.title
  };
}

function toMatchSummary(match: Match) {
  return {
    awayTeam: match.awayTeam,
    competition: match.competition,
    homeTeam: match.homeTeam,
    kickoff: match.kickoff,
    note: match.note,
    score: match.score,
    status: match.status
  };
}

function firstNews(context: AgentToolContext) {
  return context.relevantNews[0] ?? context.latestArticles[0] ?? null;
}

function matchName(match: Match) {
  return `${match.competition} ${match.homeTeam} vs ${match.awayTeam}`;
}

function matchTimeText(match: Match) {
  if (match.status === "finished") {
    return match.score ? `已完场，比分 ${match.score}` : "已完场";
  }

  if (match.status === "live") {
    return "正在进行";
  }

  if (match.status === "postponed") {
    return "比赛已延期";
  }

  if (match.status === "cancelled") {
    return "比赛已取消";
  }

  return `${match.kickoff} 开球`;
}

function pickRelevantMatch(matches: Match[]) {
  return (
    matches.find((match) => match.status === "live") ??
    matches.find((match) => match.status === "scheduled") ??
    matches[0] ??
    null
  );
}

function isSummaryQuestion(question: string) {
  return /总结|简报|重点|发生/.test(question);
}

function bulletSummary(bullets: string[]) {
  return bullets.length > 0 ? bullets.map((bullet) => `- ${bullet}`).join("\n") : "";
}

function toUserFacingError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
