export type NewsSource = {
  slug: string;
  name: string;
  url: string;
  language: "zh-CN" | "en";
  enabled: boolean;
  optional?: boolean;
};

const officialRssNewsSources: NewsSource[] = [
  {
    slug: "sina-sports-global-football",
    name: "新浪体育 国际足坛",
    url: "https://rss.sina.com.cn/sports/global/focus.xml",
    language: "zh-CN",
    enabled: true
  },
  {
    slug: "espn-soccer",
    name: "ESPN Soccer",
    url: "https://www.espn.com/espn/rss/soccer/news",
    language: "en",
    enabled: true
  },
  {
    slug: "bbc-football",
    name: "BBC Football",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    language: "en",
    enabled: true
  },
  {
    slug: "guardian-football",
    name: "The Guardian Football",
    url: "https://www.theguardian.com/football/rss",
    language: "en",
    enabled: true
  },
  {
    slug: "guardian-world-cup-2026",
    name: "The Guardian World Cup 2026",
    url: "https://www.theguardian.com/football/world-cup-2026/rss",
    language: "en",
    enabled: true
  },
  {
    slug: "guardian-premier-league",
    name: "The Guardian Premier League",
    url: "https://www.theguardian.com/football/premierleague/rss",
    language: "en",
    enabled: true
  },
  {
    slug: "guardian-la-liga",
    name: "The Guardian La Liga",
    url: "https://www.theguardian.com/football/laligafootball/rss",
    language: "en",
    enabled: true
  },
  {
    slug: "guardian-serie-a",
    name: "The Guardian Serie A",
    url: "https://www.theguardian.com/football/serieafootball/rss",
    language: "en",
    enabled: true
  },
  {
    slug: "guardian-bundesliga",
    name: "The Guardian Bundesliga",
    url: "https://www.theguardian.com/football/bundesligafootball/rss",
    language: "en",
    enabled: true
  },
  {
    slug: "guardian-ligue-1",
    name: "The Guardian Ligue 1",
    url: "https://www.theguardian.com/football/ligue1football/rss",
    language: "en",
    enabled: true
  },
  {
    slug: "sky-sports-football",
    name: "Sky Sports Football",
    url: "https://www.skysports.com/rss/12040",
    language: "en",
    enabled: true
  },
  {
    slug: "independent-football",
    name: "The Independent Football",
    url: "https://www.independent.co.uk/sport/football/rss",
    language: "en",
    enabled: true
  },
  {
    slug: "le-monde-football",
    name: "Le Monde Football",
    url: "https://www.lemonde.fr/en/football/rss_full.xml",
    language: "en",
    enabled: true
  },
  {
    slug: "cbs-sports-soccer",
    name: "CBS Sports Soccer",
    url: "https://www.cbssports.com/rss/headlines/soccer/",
    language: "en",
    enabled: true
  },
  {
    slug: "yahoo-sports-soccer",
    name: "Yahoo Sports Soccer",
    url: "https://sports.yahoo.com/soccer/rss/",
    language: "en",
    enabled: false
  }
];

export function getRssNewsSources() {
  return [...officialRssNewsSources, ...getRssHubNewsSources()];
}

export const rssNewsSources = getRssNewsSources();

function getRssHubNewsSources(): NewsSource[] {
  const rsshubBaseUrl = process.env.RSSHUB_BASE_URL?.replace(/\/$/, "");

  if (!rsshubBaseUrl) {
    return [];
  }

  return [
    {
      slug: "dongqiudi-top-news",
      name: "懂球帝 头条新闻",
      url: `${rsshubBaseUrl}/dongqiudi/top_news/1`,
      language: "zh-CN",
      enabled: true,
      optional: true
    },
    {
      slug: "dongqiudi-premier-league",
      name: "懂球帝 英超",
      url: `${rsshubBaseUrl}/dongqiudi/top_news/3`,
      language: "zh-CN",
      enabled: true,
      optional: true
    },
    {
      slug: "dongqiudi-serie-a",
      name: "懂球帝 意甲",
      url: `${rsshubBaseUrl}/dongqiudi/top_news/4`,
      language: "zh-CN",
      enabled: true,
      optional: true
    },
    {
      slug: "dongqiudi-la-liga",
      name: "懂球帝 西甲",
      url: `${rsshubBaseUrl}/dongqiudi/top_news/5`,
      language: "zh-CN",
      enabled: true,
      optional: true
    },
    {
      slug: "dongqiudi-bundesliga",
      name: "懂球帝 德甲",
      url: `${rsshubBaseUrl}/dongqiudi/top_news/6`,
      language: "zh-CN",
      enabled: true,
      optional: true
    },
    {
      slug: "dongqiudi-ligue-1",
      name: "懂球帝 法甲",
      url: `${rsshubBaseUrl}/dongqiudi/top_news/12`,
      language: "zh-CN",
      enabled: true,
      optional: true
    },
    {
      slug: "dongqiudi-world-cup",
      name: "懂球帝 世界杯",
      url: `${rsshubBaseUrl}/dongqiudi/top_news/114`,
      language: "zh-CN",
      enabled: true,
      optional: true
    },
    {
      slug: "hupu-soccer",
      name: "虎扑 足球新闻",
      url: `${rsshubBaseUrl}/hupu/soccer`,
      language: "zh-CN",
      enabled: true,
      optional: true
    }
  ];
}
