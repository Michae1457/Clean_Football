export type AiProvider =
  | "off"
  | "openai"
  | "openrouter"
  | "deepseek"
  | "doubao"
  | "qwen"
  | "custom";

export type AiTask = "article-summary" | "daily-brief" | "agent";

export type AiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionOptions = {
  task: AiTask;
  messages: AiChatMessage[];
  agentId?: string;
  temperature?: number;
  responseFormat?: "json_object";
  throwOnDisabled?: boolean;
};

export type ChatCompletionResult = {
  content: string;
  model: string;
  provider: Exclude<AiProvider, "off">;
};

export type AiDisplayConfig =
  | {
      enabled: true;
      model: string;
      provider: Exclude<AiProvider, "off">;
    }
  | {
      enabled: false;
      provider: "off";
      reason: string;
    };

type ResolvedAiConfig =
  | {
      enabled: true;
      apiKey: string;
      baseUrl: string;
      extraHeaders: Record<string, string>;
      model: string;
      provider: Exclude<AiProvider, "off">;
    }
  | {
      enabled: false;
      reason: string;
    };

const providerDefaults: Record<
  Exclude<AiProvider, "off" | "custom">,
  { baseUrl: string; keyEnv: string; model: string; modelEnv: string }
> = {
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    keyEnv: "DEEPSEEK_API_KEY",
    model: "deepseek-v4-flash",
    modelEnv: "DEEPSEEK_MODEL"
  },
  doubao: {
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    keyEnv: "DOUBAO_API_KEY",
    model: "doubao-seed-1-6",
    modelEnv: "DOUBAO_MODEL"
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    keyEnv: "OPENAI_API_KEY",
    model: "gpt-4o-mini",
    modelEnv: "OPENAI_MODEL"
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    keyEnv: "OPENROUTER_API_KEY",
    model: "openai/gpt-4o-mini",
    modelEnv: "OPENROUTER_MODEL"
  },
  qwen: {
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    keyEnv: "DASHSCOPE_API_KEY",
    model: "qwen-plus",
    modelEnv: "QWEN_MODEL"
  }
};

export async function createChatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult | null> {
  const config = resolveAiConfig(options.task, options.agentId);

  if (!config.enabled) {
    warnOnce(`AI disabled for ${options.task}: ${config.reason}`);
    if (options.throwOnDisabled) {
      throw new Error(`AI disabled for ${options.task}: ${config.reason}`);
    }
    return null;
  }

  const response = await fetch(
    `${config.baseUrl.replace(/\/$/, "")}/chat/completions`,
    {
      body: JSON.stringify({
        messages: options.messages,
        model: config.model,
        response_format: options.responseFormat
          ? { type: options.responseFormat }
          : undefined,
        temperature: options.temperature ?? 0.2
      }),
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
        ...config.extraHeaders
      },
      method: "POST"
    }
  );

  if (!response.ok) {
    const detail = truncate(await response.text(), 300);
    throw new Error(
      `${config.provider} chat completion failed: ${response.status} ${detail}`
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return {
    content: payload.choices?.[0]?.message?.content?.trim() ?? "",
    model: config.model,
    provider: config.provider
  };
}

export function resolveAiConfig(task: AiTask, agentId?: string): ResolvedAiConfig {
  if (!isTruthy(process.env.AI_ENABLED, true)) {
    return { enabled: false, reason: "AI_ENABLED=false" };
  }

  if (!isTaskEnabled(task)) {
    return { enabled: false, reason: `${task} switch is disabled` };
  }

  const agentPrefix = task === "agent" && agentId ? toAgentEnvPrefix(agentId) : null;
  const taskPrefix = toTaskEnvPrefix(task);
  const provider = normalizeProvider(
    readScopedEnv(agentPrefix, "PROVIDER") ??
      readScopedEnv(taskPrefix, "PROVIDER") ??
      process.env.AI_PROVIDER
  );

  if (provider === "off") {
    return { enabled: false, reason: "AI_PROVIDER=off" };
  }

  if (provider === "custom") {
    return resolveCustomProvider(agentPrefix, taskPrefix);
  }

  return resolvePresetProvider(provider, agentPrefix, taskPrefix);
}

export function resolveAiDisplayConfig(
  task: AiTask,
  agentId?: string
): AiDisplayConfig {
  const config = resolveAiConfig(task, agentId);

  if (!config.enabled) {
    return {
      enabled: false,
      provider: "off",
      reason: config.reason
    };
  }

  return {
    enabled: true,
    model: config.model,
    provider: config.provider
  };
}

function resolvePresetProvider(
  provider: Exclude<AiProvider, "off" | "custom">,
  agentPrefix: string | null,
  taskPrefix: string
): ResolvedAiConfig {
  const preset = providerDefaults[provider];
  const explicitBaseUrl =
    readScopedEnv(agentPrefix, "BASE_URL") ||
    readScopedEnv(taskPrefix, "BASE_URL") ||
    readProviderEnv(provider, "BASE_URL");
  const baseUrl = explicitBaseUrl || process.env.AI_BASE_URL || preset.baseUrl;
  const apiKey =
    readScopedEnv(agentPrefix, "API_KEY") ||
    readScopedEnv(taskPrefix, "API_KEY") ||
    readProviderEnv(provider, "API_KEY") ||
    process.env[preset.keyEnv] ||
    process.env.AI_API_KEY ||
    legacyOpenAiValue(provider, "OPENAI_API_KEY");
  const model = sanitizeModel(
    readScopedEnv(agentPrefix, "MODEL") ||
      readScopedEnv(taskPrefix, "MODEL") ||
      readProviderEnv(provider, "MODEL") ||
      process.env[preset.modelEnv] ||
      process.env.AI_MODEL ||
      legacyOpenAiValue(provider, "AI_MODEL") ||
      preset.model,
    preset.model
  );

  return validateConfig({
    apiKey,
    baseUrl,
    extraHeaders: extraHeadersForProvider(provider),
    model,
    provider
  });
}

function resolveCustomProvider(
  agentPrefix: string | null,
  taskPrefix: string
): ResolvedAiConfig {
  return validateConfig({
    apiKey:
      readScopedEnv(agentPrefix, "API_KEY") ||
      readScopedEnv(taskPrefix, "API_KEY") ||
      process.env.AI_API_KEY,
    baseUrl:
      readScopedEnv(agentPrefix, "BASE_URL") ||
      readScopedEnv(taskPrefix, "BASE_URL") ||
      process.env.AI_BASE_URL,
    extraHeaders: {},
    model: sanitizeModel(
      readScopedEnv(agentPrefix, "MODEL") ||
        readScopedEnv(taskPrefix, "MODEL") ||
        process.env.AI_MODEL,
      "gpt-4o-mini"
    ),
    provider: "custom"
  });
}

function validateConfig(config: {
  apiKey: string | undefined;
  baseUrl: string | undefined;
  extraHeaders: Record<string, string>;
  model: string;
  provider: Exclude<AiProvider, "off">;
}): ResolvedAiConfig {
  if (!config.apiKey) {
    return { enabled: false, reason: `missing API key for ${config.provider}` };
  }

  if (!isByteStringSafe(config.apiKey)) {
    return {
      enabled: false,
      reason: `API key for ${config.provider} contains non-ASCII characters`
    };
  }

  if (!config.baseUrl || !isValidUrl(config.baseUrl)) {
    return { enabled: false, reason: `invalid base URL for ${config.provider}` };
  }

  return {
    enabled: true,
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    extraHeaders: config.extraHeaders,
    model: config.model,
    provider: config.provider
  };
}

function normalizeProvider(value: string | undefined): AiProvider {
  if (!value) {
    return "openai";
  }

  const provider = value.toLowerCase();
  if (
    provider === "off" ||
    provider === "openai" ||
    provider === "openrouter" ||
    provider === "deepseek" ||
    provider === "doubao" ||
    provider === "qwen" ||
    provider === "custom"
  ) {
    return provider;
  }

  return "openai";
}

function isTaskEnabled(task: AiTask) {
  const taskEnvNames: Record<AiTask, string[]> = {
    agent: ["AI_ENABLE_AGENT", "AGENT_AI_ENABLED"],
    "article-summary": [
      "AI_ENABLE_ARTICLE_SUMMARY",
      "ARTICLE_SUMMARY_AI_ENABLED"
    ],
    "daily-brief": ["AI_ENABLE_DAILY_BRIEF", "DAILY_BRIEF_AI_ENABLED"]
  };

  return taskEnvNames[task].every((name) => isTruthy(process.env[name], true));
}

function readProviderEnv(provider: AiProvider, suffix: string) {
  if (provider === "off" || provider === "custom") {
    return undefined;
  }

  const prefix = provider === "qwen" ? "QWEN" : provider.toUpperCase();
  const value = process.env[`${prefix}_${suffix}`];

  if (provider === "qwen" && suffix === "API_KEY") {
    return value || process.env.DASHSCOPE_API_KEY;
  }

  if (provider === "qwen" && suffix === "BASE_URL") {
    return value || process.env.DASHSCOPE_BASE_URL;
  }

  if (provider === "doubao" && suffix === "API_KEY") {
    return value || process.env.ARK_API_KEY || process.env.VOLCENGINE_API_KEY;
  }

  return value;
}

function readScopedEnv(prefix: string | null, suffix: string) {
  return prefix ? process.env[`${prefix}_${suffix}`] : undefined;
}

function toAgentEnvPrefix(agentId: string) {
  return `AGENT_${agentId.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase()}`;
}

function toTaskEnvPrefix(task: AiTask) {
  if (task === "article-summary") {
    return "ARTICLE_SUMMARY_AI";
  }

  if (task === "daily-brief") {
    return "DAILY_BRIEF_AI";
  }

  return "AGENT_AI";
}

function legacyOpenAiValue(provider: AiProvider, envName: string) {
  return provider === "openai" ? process.env[envName] : undefined;
}

function extraHeadersForProvider(provider: Exclude<AiProvider, "off">) {
  if (provider !== "openrouter") {
    return {};
  }

  return compactHeaders({
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL,
    "X-Title": process.env.OPENROUTER_APP_NAME ?? "Clean Football Demo"
  });
}

function compactHeaders(headers: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(headers).filter(
      (entry): entry is [string, string] =>
        Boolean(entry[1]) && isByteStringSafe(entry[1] as string)
    )
  );
}

function sanitizeModel(value: string | undefined, fallback: string) {
  return value && isByteStringSafe(value) ? value : fallback;
}

function isTruthy(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) {
    return defaultValue;
  }

  return !["0", "false", "no", "off"].includes(value.toLowerCase());
}

function isByteStringSafe(value: string) {
  return [...value].every((character) => character.charCodeAt(0) <= 255);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const warnedMessages = new Set<string>();

function warnOnce(message: string) {
  if (!warnedMessages.has(message)) {
    console.warn(message);
    warnedMessages.add(message);
  }
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}
