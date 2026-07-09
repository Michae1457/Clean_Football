insert into public.sources (slug, name, type, url, language, enabled)
values
  (
    'thesportsdb-soccer',
    'TheSportsDB Soccer API',
    'api',
    'https://www.thesportsdb.com/api/v1/json',
    'en',
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  type = excluded.type,
  url = excluded.url,
  language = excluded.language,
  enabled = excluded.enabled;

alter table public.user_preferences
alter column followed_leagues
set default array['世界杯', '欧冠', '英超', '西甲', '意甲', '德甲', '法甲'];

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
