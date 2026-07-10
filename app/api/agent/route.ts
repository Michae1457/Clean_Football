import { NextResponse } from "next/server";
import {
  answerAgentQuestion,
  parseAgentId,
  type AgentReply
} from "@/lib/agent-service";
import type { AgentMessage } from "@/lib/agent-profiles";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      agentId?: unknown;
      messages?: unknown;
    };
    const messages = parseMessages(body.messages);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Missing user message." },
        { status: 400 }
      );
    }

    const reply = await answerAgentQuestion({
      agentId: parseAgentId(body.agentId),
      messages
    });

    return NextResponse.json<AgentReply>(reply);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        content:
          "这次回答生成失败了。你可以稍后再试，或者先同步新闻和赛程数据。",
        error: error instanceof Error ? error.message : String(error),
        mode: "fallback"
      } satisfies AgentReply,
      { status: 200 }
    );
  }
}

function parseMessages(value: unknown): AgentMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      const role = item.role === "assistant" ? "assistant" : "user";
      const content = typeof item.content === "string" ? item.content.trim() : "";

      if (!content) {
        return null;
      }

      return {
        content: content.slice(0, 2000),
        id: typeof item.id === "string" ? item.id : `m-${index}`,
        role
      };
    })
    .filter((message): message is AgentMessage => Boolean(message));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
