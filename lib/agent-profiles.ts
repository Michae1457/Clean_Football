export type AgentProfileId = "friend" | "tactician" | "predictor";

export type AgentPreset = {
  label: string;
  prompt: string;
};

export type AgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AgentProfile = {
  id: AgentProfileId;
  name: string;
  title: string;
  shortTitle: string;
  description: string;
  accent: string;
  provider: "qwen" | "deepseek" | "openrouter";
  defaultModel: string;
  envPrefix: string;
  promptPath: string;
  systemHint: string;
  presets: AgentPreset[];
  openingMessages: AgentMessage[];
};

export const agentProfiles: AgentProfile[] = [
  {
    id: "friend",
    name: "懂球朋友",
    title: "简单懂球朋友型",
    shortTitle: "朋友",
    description: "轻松、短句、先讲人话，再讲依据。",
    accent: "#6FCF97",
    provider: "qwen",
    defaultModel: "qwen-plus",
    envPrefix: "AGENT_FRIEND",
    promptPath: "prompts/agents/friend.md",
    systemHint: "先帮你抓重点，再把不确定的地方说清楚。",
    presets: [
      {
        label: "今天哪场值得看？",
        prompt: "只看今天的赛程和新闻，你觉得哪场最值得看？用简单理由说明。"
      },
      {
        label: "睡前 1 分钟总结",
        prompt: "用 1 分钟能看完的方式，总结今天足球重点。"
      },
      {
        label: "英超有什么新消息？",
        prompt: "帮我看看英超今天有什么值得关注的新消息。"
      }
    ],
    openingMessages: [
      {
        id: "friend-a1",
        role: "assistant",
        content:
          "今天我先帮你把赛程和新闻捋顺。数据不够的地方我会直接说，不会硬猜。"
      }
    ]
  },
  {
    id: "tactician",
    name: "战术专家",
    title: "战术专家型",
    shortTitle: "战术",
    description: "阵型、压迫、转换、关键对位，输出更结构化。",
    accent: "#5BC8FF",
    provider: "deepseek",
    defaultModel: "deepseek-v4-flash",
    envPrefix: "AGENT_TACTICIAN",
    promptPath: "prompts/agents/tactician.md",
    systemHint: "把比赛拆成阶段、空间和对位，而不是只聊结果。",
    presets: [
      {
        label: "拆一场比赛",
        prompt: "从战术角度拆解今天最值得看的比赛，重点说阵型、压迫和转换。"
      },
      {
        label: "关键对位",
        prompt: "基于已有数据，列出今天比赛里最值得观察的 3 个关键对位。"
      },
      {
        label: "弱点雷达",
        prompt: "帮我找一场比赛双方可能暴露的问题，只说能从现有信息推出的部分。"
      }
    ],
    openingMessages: [
      {
        id: "tactician-a1",
        role: "assistant",
        content:
          "我会按控球、压迫、攻防转换和定位球来拆。没有首发或伤病来源时，我不会补剧情。"
      }
    ]
  },
  {
    id: "predictor",
    name: "预测大师",
    title: "预测大师型",
    shortTitle: "预测",
    description: "趋势判断、风险分层、冷门信号；不碰投注，不猜准确比分。",
    accent: "#F6C85F",
    provider: "openrouter",
    defaultModel: "~openai/gpt-latest",
    envPrefix: "AGENT_PREDICTOR",
    promptPath: "prompts/agents/predictor.md",
    systemHint: "给趋势和信心区间，把风险讲透，不装神秘。",
    presets: [
      {
        label: "今天冷门风险",
        prompt: "基于今天赛程和新闻，找出冷门风险最高的一场，并说明不确定性。"
      },
      {
        label: "走势判断",
        prompt: "用高/中/低信心，判断今天几场关注比赛的大致走势。"
      },
      {
        label: "赛前风险清单",
        prompt: "列一个赛前风险清单：哪些信息缺失会影响判断？"
      }
    ],
    openingMessages: [
      {
        id: "predictor-a1",
        role: "assistant",
        content:
          "我可以给趋势判断和风险分层，但不会给投注建议，也不会编准确比分。"
      }
    ]
  }
];

export const defaultAgentProfileId: AgentProfileId = "friend";

export function getAgentProfile(id: AgentProfileId) {
  return agentProfiles.find((profile) => profile.id === id) ?? agentProfiles[0];
}
