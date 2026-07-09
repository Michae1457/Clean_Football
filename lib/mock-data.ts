import type { Article, ChatMessage, DailyBrief, Match } from "@/lib/types";

export const dailyBrief: DailyBrief = {
  date: "7月9日 周四 09:00",
  title: "今日足球简报",
  summary:
    "今天的重点放在欧冠资格赛和英超转会动态。凌晨赛果没有太多冷门，几支热门球队都稳住了节奏；晚间赛程适合关注节奏更快的两场杯赛。",
  bullets: [
    "欧冠资格赛有两场值得看，开球时间集中在深夜。",
    "英超转会新闻继续升温，几支争四球队都有中场补强传闻。",
    "西甲方面以季前训练和续约消息为主，暂时没有重磅官宣。"
  ]
};

export const todayMatches: Match[] = [
  {
    id: "m1",
    competition: "欧冠资格赛",
    homeTeam: "马尔默",
    awayTeam: "里加足球学校",
    kickoff: "23:30",
    status: "scheduled",
    note: "首回合"
  },
  {
    id: "m2",
    competition: "友谊赛",
    homeTeam: "阿森纳",
    awayTeam: "里昂",
    kickoff: "02:00",
    status: "scheduled",
    note: "季前热身"
  },
  {
    id: "m3",
    competition: "西甲夏训",
    homeTeam: "皇家社会",
    awayTeam: "奥萨苏纳",
    kickoff: "已结束",
    status: "finished",
    score: "2-1"
  }
];

export const matchesByDay: Record<string, Match[]> = {
  昨日: [
    {
      id: "m4",
      competition: "欧冠资格赛",
      homeTeam: "林肯红魔",
      awayTeam: "诺亚",
      kickoff: "完场",
      status: "finished",
      score: "1-2"
    },
    {
      id: "m5",
      competition: "友谊赛",
      homeTeam: "切尔西",
      awayTeam: "布莱顿",
      kickoff: "完场",
      status: "finished",
      score: "0-0"
    }
  ],
  今日: todayMatches,
  明日: [
    {
      id: "m6",
      competition: "欧冠资格赛",
      homeTeam: "卢多戈雷茨",
      awayTeam: "明斯克迪纳摩",
      kickoff: "01:00",
      status: "scheduled",
      note: "次回合"
    },
    {
      id: "m7",
      competition: "英超夏训",
      homeTeam: "热刺",
      awayTeam: "凯尔特人",
      kickoff: "03:00",
      status: "scheduled",
      note: "季前热身"
    }
  ]
};

export const articles: Article[] = [
  {
    id: "a1",
    source: "BBC Football",
    title: "多队关注年轻中场，夏窗节奏开始加快",
    summary:
      "几支英超球队正在评估中场轮换深度，谈判仍处早期。当前更接近询价阶段，还没有可靠消息显示交易已经完成。",
    publishedAt: "08:20",
    tag: "转会"
  },
  {
    id: "a2",
    source: "ESPN",
    title: "欧冠资格赛进入密集赛程，客场表现成关键",
    summary:
      "资格赛球队普遍面临旅行和轮换压力。今天两场比赛的节奏可能偏谨慎，先稳住防线会是很多球队的首选。",
    publishedAt: "07:50",
    tag: "欧冠"
  },
  {
    id: "a3",
    source: "新浪体育",
    title: "西甲多队公布季前训练名单",
    summary:
      "多支西甲球队已经回到训练基地，年轻球员获得了更多合练机会。正式热身赛前，阵容试验会比结果更重要。",
    publishedAt: "06:40",
    tag: "西甲"
  }
];

export const quickQuestions = [
  "今天哪场值得看？",
  "总结今天重点",
  "英超有什么新消息？"
];

export const chatMessages: ChatMessage[] = [
  {
    id: "c1",
    role: "user",
    content: "今天哪场值得看？"
  },
  {
    id: "c2",
    role: "assistant",
    content:
      "如果只选一场，我会看马尔默对里加足球学校。理由是欧冠资格赛容错低，两队都会更认真。当前没有可靠首发和伤病信息，我不会乱猜。"
  }
];
