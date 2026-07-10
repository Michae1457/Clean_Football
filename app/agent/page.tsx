import { AgentChat } from "@/components/cards/agent-chat";
import { agentProfiles } from "@/lib/agent-profiles";
import { resolveAiDisplayConfig } from "@/lib/ai";

export default function AgentPage() {
  const profiles = agentProfiles.map((profile) => {
    const config = resolveAiDisplayConfig("agent", profile.id);

    return {
      ...profile,
      runtimeModel: config.enabled ? config.model : profile.defaultModel,
      runtimeProvider: config.provider,
      runtimeReason: config.enabled ? undefined : config.reason
    };
  });

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1">
      <AgentChat profiles={profiles} />
    </div>
  );
}
