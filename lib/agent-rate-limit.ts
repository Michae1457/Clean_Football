import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig
} from "@/lib/db";
import type { AgentProfileId } from "@/lib/agent-profiles";

const memoryUsage = new Map<string, number>();

export async function consumeAgentDailyLimit(agentId: AgentProfileId) {
  const maxRequests = getAgentDailyLimit(agentId);

  if (maxRequests <= 0) {
    return { allowed: false, maxRequests };
  }

  if (maxRequests === Number.POSITIVE_INFINITY) {
    return { allowed: true, maxRequests };
  }

  const usageDate = currentDateInShanghai();

  if (!hasSupabaseServiceConfig()) {
    return consumeMemoryLimit(agentId, usageDate, maxRequests);
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("consume_agent_daily_limit", {
    p_agent_id: agentId,
    p_max_requests: maxRequests,
    p_usage_date: usageDate
  });

  if (error) {
    throw error;
  }

  return {
    allowed: data === true,
    maxRequests
  };
}

function getAgentDailyLimit(agentId: AgentProfileId) {
  if (agentId !== "predictor") {
    return Number.POSITIVE_INFINITY;
  }

  const value = Number(process.env.AGENT_PREDICTOR_DAILY_LIMIT ?? 1);
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 1;
}

function consumeMemoryLimit(
  agentId: AgentProfileId,
  usageDate: string,
  maxRequests: number
) {
  const key = `${agentId}:${usageDate}`;
  const currentCount = memoryUsage.get(key) ?? 0;

  if (currentCount >= maxRequests) {
    return { allowed: false, maxRequests };
  }

  memoryUsage.set(key, currentCount + 1);
  return { allowed: true, maxRequests };
}

function currentDateInShanghai() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric"
  });

  return formatter.format(new Date());
}
