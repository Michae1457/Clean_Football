"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  BrainCircuit,
  ChevronDown,
  Globe2,
  MessageCircle,
  SendHorizontal,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  agentProfiles,
  defaultAgentProfileId,
  type AgentMessage,
  type AgentProfile,
  type AgentProfileId
} from "@/lib/agent-profiles";
import { cn } from "@/lib/utils";

const profileIcons = {
  friend: MessageCircle,
  predictor: Sparkles,
  tactician: BrainCircuit
};

type AgentReply = {
  content?: string;
  error?: string;
  mode?: "ai" | "fallback";
};

export type AgentDisplayProfile = AgentProfile & {
  runtimeModel: string;
  runtimeProvider: string;
  runtimeReason?: string;
};

export function AgentChat({
  profiles = toDisplayProfiles(agentProfiles)
}: {
  profiles?: AgentDisplayProfile[];
}) {
  const [activeProfileId, setActiveProfileId] =
    useState<AgentProfileId>(defaultAgentProfileId);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeProfile = useMemo(
    () =>
      profiles.find((profile) => profile.id === activeProfileId) ??
      profiles[0] ??
      toDisplayProfiles(agentProfiles)[0],
    [activeProfileId, profiles]
  );
  const Icon = profileIcons[activeProfile.id];

  useEffect(() => {
    setMessages(activeProfile.openingMessages);
    setDraft("");
    setSelectorOpen(false);
  }, [activeProfile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isPending]);

  async function sendDraft() {
    const content = draft.trim();

    if (!content || isPending) {
      return;
    }

    const userMessage: AgentMessage = {
      content,
      id: `u-${Date.now()}`,
      role: "user"
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setIsPending(true);

    try {
      const response = await fetch("/api/agent", {
        body: JSON.stringify({
          agentId: activeProfile.id,
          messages: nextMessages,
          webSearch: webSearchEnabled
        }),
        headers: {
          "content-type": "application/json"
        },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(`Agent request failed: ${response.status}`);
      }

      const reply = (await response.json()) as AgentReply;
      const errorNote = reply.error ? `\n\n错误诊断：${reply.error}` : "";
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          content:
            `${reply.content || "我这边没有生成有效回复。可以换个问法，或先同步一下新闻和赛程。"}${errorNote}`,
          id: `a-${Date.now()}`,
          role: "assistant"
        }
      ]);
    } catch (error) {
      console.error(error);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          content: `这次请求没发出去。我先提醒一下：可以检查本地服务、网络或 API 配置；没有 AI key 时也应该能走本地 fallback。\n\n错误诊断：${toErrorMessage(error)}`,
          id: `a-${Date.now()}`,
          role: "assistant"
        }
      ]);
    } finally {
      setIsPending(false);
    }
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void sendDraft();
    }
  }

  return (
    <section
      className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-3"
      style={
        {
          "--agent-accent": activeProfile.accent
        } as CSSProperties
      }
    >
      <section
        className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
        ref={scrollRef}
      >
        <div className="space-y-3 pb-2">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isPending ? (
            <ChatBubble
              message={{
                content: webSearchEnabled
                  ? "正在联网搜索并整理已有信息..."
                  : "正在整理已有信息...",
                id: "pending",
                role: "assistant"
              }}
            />
          ) : null}
        </div>
      </section>

      <div className="min-w-0 shrink-0 space-y-3">
        <div className="flex flex-wrap gap-3">
          {activeProfile.presets.map((preset) => (
            <button
              className="interactive-control prompt-chip h-10 rounded-full border px-4 text-xs font-bold text-text hover:border-[color:var(--agent-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              key={preset.label}
              onClick={() => setDraft(preset.prompt)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="agent-composer match-surface min-w-0 rounded-lg border bg-card p-4">
          <label className="sr-only" htmlFor="agent-message">
            输入问题
          </label>
          <textarea
            className="max-h-40 min-h-28 w-full resize-none bg-transparent text-base leading-7 text-text outline-none placeholder:text-muted"
            id="agent-message"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleDraftKeyDown}
            placeholder={`${activeProfile.shortTitle}模式下提问`}
            value={draft}
          />
          <div className="mt-3 flex min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted">
              <button
                aria-pressed={webSearchEnabled}
                aria-label="Web Search"
                className={cn(
                  "interactive-control stadium-button inline-flex size-10 shrink-0 items-center justify-center rounded-lg border text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  webSearchEnabled
                    ? "border-[color:var(--agent-accent)] bg-[color:color-mix(in_srgb,var(--agent-accent)_16%,var(--card))] text-text"
                    : "bg-background text-muted hover:text-text"
                )}
                onClick={() => setWebSearchEnabled((enabled) => !enabled)}
                title="Web Search 会让本次提问消耗 Tavily search credit"
                type="button"
              >
                <Globe2 className="size-3.5" />
              </button>
              <ShieldCheck className="size-4 shrink-0 text-[color:var(--agent-accent)]" />
              <span className="hidden truncate sm:inline">
                常识可聊，实时不编，不给投注建议
              </span>
            </div>
            <div className="relative flex shrink-0 items-center gap-1.5">
              <button
                aria-expanded={selectorOpen}
                aria-label={`当前模式：${activeProfile.name}`}
                className="interactive-control stadium-button inline-flex h-11 max-w-[11rem] items-center gap-1.5 rounded-full border px-3 text-sm font-bold text-text hover:border-[color:var(--agent-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:gap-2 sm:px-4"
                onClick={() => setSelectorOpen((open) => !open)}
                type="button"
              >
                <Icon className="size-4 text-[color:var(--agent-accent)]" />
                <span className="min-w-0 truncate">{activeProfile.name}</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted transition-transform",
                    selectorOpen && "rotate-180"
                  )}
                />
              </button>

              {selectorOpen ? (
                <div className="match-surface absolute bottom-14 right-0 z-10 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border bg-card p-1 shadow-card">
                  {profiles.map((profile) => {
                    const ProfileIcon = profileIcons[profile.id];
                    const active = profile.id === activeProfile.id;

                    return (
                      <button
                        className={cn(
                          "interactive-control flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          active && "bg-background"
                        )}
                        key={profile.id}
                        onClick={() => {
                          setActiveProfileId(profile.id);
                          setSelectorOpen(false);
                        }}
                        type="button"
                      >
                        <ProfileIcon
                          className={cn(
                            "mt-0.5 size-4 shrink-0 text-muted",
                            active && "text-[color:var(--agent-accent)]"
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-text">
                            {profile.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {profile.runtimeReason
                              ? profile.runtimeReason
                              : profile.runtimeModel}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <Button
                disabled={!draft.trim() || isPending}
                onClick={sendDraft}
                className="size-14 rounded-lg"
                size="icon"
                type="button"
              >
                <SendHorizontal className="size-5" />
                <span className="sr-only">发送</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function toDisplayProfiles(profiles: AgentProfile[]): AgentDisplayProfile[] {
  return profiles.map((profile) => ({
    ...profile,
    runtimeModel: profile.defaultModel,
    runtimeProvider: profile.provider
  }));
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function ChatBubble({ message }: { message: AgentMessage }) {
  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[min(88%,100%)] break-words whitespace-pre-line rounded-lg border px-4 py-3 text-sm leading-6",
          message.role === "user"
            ? "border-[color:var(--agent-accent)] bg-[color:color-mix(in_srgb,var(--agent-accent)_18%,var(--card))] text-text"
            : "match-surface bg-card text-text"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
