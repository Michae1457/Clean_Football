insert into public.sources (slug, name, type, url, language, enabled)
values
  ('guardian-world-cup-2026', 'The Guardian World Cup 2026', 'rss', 'https://www.theguardian.com/football/world-cup-2026/rss', 'en', true),
  ('guardian-premier-league', 'The Guardian Premier League', 'rss', 'https://www.theguardian.com/football/premierleague/rss', 'en', true),
  ('guardian-la-liga', 'The Guardian La Liga', 'rss', 'https://www.theguardian.com/football/laligafootball/rss', 'en', true),
  ('guardian-serie-a', 'The Guardian Serie A', 'rss', 'https://www.theguardian.com/football/serieafootball/rss', 'en', true),
  ('guardian-bundesliga', 'The Guardian Bundesliga', 'rss', 'https://www.theguardian.com/football/bundesligafootball/rss', 'en', true),
  ('guardian-ligue-1', 'The Guardian Ligue 1', 'rss', 'https://www.theguardian.com/football/ligue1football/rss', 'en', true),
  ('dongqiudi-world-cup', '懂球帝 世界杯', 'rss', 'https://rsshub.app/dongqiudi/top_news/114', 'zh-CN', false),
  ('dongqiudi-serie-a', '懂球帝 意甲', 'rss', 'https://rsshub.app/dongqiudi/top_news/4', 'zh-CN', false),
  ('dongqiudi-bundesliga', '懂球帝 德甲', 'rss', 'https://rsshub.app/dongqiudi/top_news/6', 'zh-CN', false),
  ('dongqiudi-ligue-1', '懂球帝 法甲', 'rss', 'https://rsshub.app/dongqiudi/top_news/12', 'zh-CN', false)
on conflict (slug) do update
set
  name = excluded.name,
  type = excluded.type,
  url = excluded.url,
  language = excluded.language,
  enabled = excluded.enabled;
