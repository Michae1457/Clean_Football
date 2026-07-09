insert into public.sources (slug, name, type, url, language, enabled)
values
  ('sina-sports-global-football', '新浪体育 国际足坛', 'rss', 'https://rss.sina.com.cn/sports/global/focus.xml', 'zh-CN', true),
  ('espn-soccer', 'ESPN Soccer', 'rss', 'https://www.espn.com/espn/rss/soccer/news', 'en', true),
  ('bbc-football', 'BBC Football', 'rss', 'https://feeds.bbci.co.uk/sport/football/rss.xml', 'en', true),
  ('guardian-football', 'The Guardian Football', 'rss', 'https://www.theguardian.com/football/rss', 'en', true),
  ('guardian-world-cup-2026', 'The Guardian World Cup 2026', 'rss', 'https://www.theguardian.com/football/world-cup-2026/rss', 'en', true),
  ('guardian-premier-league', 'The Guardian Premier League', 'rss', 'https://www.theguardian.com/football/premierleague/rss', 'en', true),
  ('guardian-la-liga', 'The Guardian La Liga', 'rss', 'https://www.theguardian.com/football/laligafootball/rss', 'en', true),
  ('guardian-serie-a', 'The Guardian Serie A', 'rss', 'https://www.theguardian.com/football/serieafootball/rss', 'en', true),
  ('guardian-bundesliga', 'The Guardian Bundesliga', 'rss', 'https://www.theguardian.com/football/bundesligafootball/rss', 'en', true),
  ('guardian-ligue-1', 'The Guardian Ligue 1', 'rss', 'https://www.theguardian.com/football/ligue1football/rss', 'en', true),
  ('sky-sports-football', 'Sky Sports Football', 'rss', 'https://www.skysports.com/rss/12040', 'en', true),
  ('independent-football', 'The Independent Football', 'rss', 'https://www.independent.co.uk/sport/football/rss', 'en', true),
  ('le-monde-football', 'Le Monde Football', 'rss', 'https://www.lemonde.fr/en/football/rss_full.xml', 'en', true),
  ('cbs-sports-soccer', 'CBS Sports Soccer', 'rss', 'https://www.cbssports.com/rss/headlines/soccer/', 'en', true),
  ('yahoo-sports-soccer', 'Yahoo Sports Soccer', 'rss', 'https://sports.yahoo.com/soccer/rss/', 'en', false),
  ('dongqiudi-top-news', '懂球帝 头条新闻', 'rss', 'https://rsshub.app/dongqiudi/top_news/1', 'zh-CN', false),
  ('dongqiudi-premier-league', '懂球帝 英超', 'rss', 'https://rsshub.app/dongqiudi/top_news/3', 'zh-CN', false),
  ('dongqiudi-serie-a', '懂球帝 意甲', 'rss', 'https://rsshub.app/dongqiudi/top_news/4', 'zh-CN', false),
  ('dongqiudi-la-liga', '懂球帝 西甲', 'rss', 'https://rsshub.app/dongqiudi/top_news/5', 'zh-CN', false),
  ('dongqiudi-bundesliga', '懂球帝 德甲', 'rss', 'https://rsshub.app/dongqiudi/top_news/6', 'zh-CN', false),
  ('dongqiudi-ligue-1', '懂球帝 法甲', 'rss', 'https://rsshub.app/dongqiudi/top_news/12', 'zh-CN', false),
  ('dongqiudi-world-cup', '懂球帝 世界杯', 'rss', 'https://rsshub.app/dongqiudi/top_news/114', 'zh-CN', false),
  ('hupu-soccer', '虎扑 足球新闻', 'rss', 'https://rsshub.app/hupu/soccer', 'zh-CN', false),
  ('thesportsdb-soccer', 'TheSportsDB Soccer API', 'api', 'https://www.thesportsdb.com/api/v1/json', 'en', true)
on conflict (slug) do update
set
  name = excluded.name,
  type = excluded.type,
  url = excluded.url,
  language = excluded.language,
  enabled = excluded.enabled;

insert into public.user_preferences (
  user_key,
  language,
  brief_time,
  followed_leagues,
  followed_teams,
  theme
)
values (
  'default',
  'zh-CN',
  '09:00',
  array['世界杯', '欧冠', '英超', '西甲', '意甲', '德甲', '法甲'],
  array[]::text[],
  'light'
)
on conflict (user_key) do update
set
  language = excluded.language,
  brief_time = excluded.brief_time,
  followed_leagues = excluded.followed_leagues;
