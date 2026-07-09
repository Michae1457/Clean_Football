import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createChatCompletion } from "@/lib/ai";
import type { ParsedRssArticle } from "@/lib/rss";

export type SummaryResult = {
  summary: string;
  status: "source" | "generated" | "pending" | "failed";
};

const articleSummarySystemPrompt = readFileSync(
  join(process.cwd(), "prompts/article-summary.md"),
  "utf8"
);

export async function summarizeArticleToChinese(
  article: ParsedRssArticle,
  options: { useAi?: boolean } = {}
): Promise<SummaryResult> {
  const sourceSummary = truncate(article.description || article.title, 180);

  if (article.language === "zh-CN") {
    return {
      summary: sourceSummary,
      status: "source"
    };
  }

  if (options.useAi === false) {
    return {
      summary: `待生成中文摘要：${sourceSummary}`,
      status: "pending"
    };
  }

  try {
    const completion = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: articleSummarySystemPrompt
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              source: article.source.name,
              title: article.title,
              description: article.description
            },
            null,
            2
          )
        }
      ],
      task: "article-summary",
      temperature: 0.2
    });
    const generated = truncate(completion?.content ?? "", 180);

    return {
      summary: generated || `待生成中文摘要：${sourceSummary}`,
      status: generated ? "generated" : "pending"
    };
  } catch (error) {
    console.error(error);
    return {
      summary: `中文摘要生成失败：${sourceSummary}`,
      status: "failed"
    };
  }
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
