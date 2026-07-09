insert into public.sources (slug, name, type, url, language, enabled)
values
  ('guardian-football', 'The Guardian Football', 'rss', 'https://www.theguardian.com/football/rss', 'en', true),
  ('sky-sports-football', 'Sky Sports Football', 'rss', 'https://www.skysports.com/rss/12040', 'en', true),
  ('independent-football', 'The Independent Football', 'rss', 'https://www.independent.co.uk/sport/football/rss', 'en', true),
  ('le-monde-football', 'Le Monde Football', 'rss', 'https://www.lemonde.fr/en/football/rss_full.xml', 'en', true),
  ('cbs-sports-soccer', 'CBS Sports Soccer', 'rss', 'https://www.cbssports.com/rss/headlines/soccer/', 'en', true),
  ('yahoo-sports-soccer', 'Yahoo Sports Soccer', 'rss', 'https://sports.yahoo.com/soccer/rss/', 'en', false),
  ('dongqiudi-top-news', '懂球帝 头条新闻', 'rss', 'https://rsshub.app/dongqiudi/top_news/1', 'zh-CN', false),
  ('dongqiudi-premier-league', '懂球帝 英超', 'rss', 'https://rsshub.app/dongqiudi/top_news/3', 'zh-CN', false),
  ('dongqiudi-la-liga', '懂球帝 西甲', 'rss', 'https://rsshub.app/dongqiudi/top_news/5', 'zh-CN', false),
  ('hupu-soccer', '虎扑 足球新闻', 'rss', 'https://rsshub.app/hupu/soccer', 'zh-CN', false)
on conflict (slug) do update
set
  name = excluded.name,
  type = excluded.type,
  url = excluded.url,
  language = excluded.language,
  enabled = excluded.enabled;
