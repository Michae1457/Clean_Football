create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  type text not null default 'rss' check (type in ('rss', 'api', 'manual')),
  url text unique,
  language text not null default 'zh-CN',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  url text not null unique,
  canonical_url text,
  title text not null,
  original_title text,
  summary_zh text not null default '',
  original_summary text,
  content_snippet text,
  language text not null default 'zh-CN',
  tag text not null default '足球',
  summary_status text not null default 'source' check (
    summary_status in ('source', 'generated', 'pending', 'failed')
  ),
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null unique,
  short_name text,
  country text,
  competition_tags text[] not null default '{}',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  competition text not null,
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz not null,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'live', 'finished', 'postponed', 'cancelled')
  ),
  score_home integer,
  score_away integer,
  stage text,
  matchday integer,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_briefs (
  id uuid primary key default gen_random_uuid(),
  brief_date date not null unique,
  title text not null,
  summary text not null,
  bullets jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_key text not null unique default 'default',
  language text not null default 'zh-CN',
  brief_time time not null default '09:00',
  followed_leagues text[] not null default array['英超', '欧冠', '西甲'],
  followed_teams text[] not null default '{}',
  theme text not null default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published_at_idx on public.articles (published_at desc);
create index if not exists articles_source_id_idx on public.articles (source_id);
create index if not exists articles_tag_idx on public.articles (tag);
create index if not exists matches_kickoff_at_idx on public.matches (kickoff_at);
create index if not exists matches_competition_idx on public.matches (competition);

drop trigger if exists set_sources_updated_at on public.sources;
create trigger set_sources_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists set_matches_updated_at on public.matches;
create trigger set_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists set_daily_briefs_updated_at on public.daily_briefs;
create trigger set_daily_briefs_updated_at
before update on public.daily_briefs
for each row execute function public.set_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.daily_briefs enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Public read sources" on public.sources;
create policy "Public read sources" on public.sources
for select using (true);

drop policy if exists "Public read articles" on public.articles;
create policy "Public read articles" on public.articles
for select using (true);

drop policy if exists "Public read teams" on public.teams;
create policy "Public read teams" on public.teams
for select using (true);

drop policy if exists "Public read matches" on public.matches;
create policy "Public read matches" on public.matches
for select using (true);

drop policy if exists "Public read daily briefs" on public.daily_briefs;
create policy "Public read daily briefs" on public.daily_briefs
for select using (true);

drop policy if exists "Public read preferences" on public.user_preferences;
create policy "Public read preferences" on public.user_preferences
for select using (true);

insert into public.sources (slug, name, type, url, language, enabled)
values
  ('sina-sports-global-football', '新浪体育 国际足坛', 'rss', 'https://rss.sina.com.cn/sports/global/focus.xml', 'zh-CN', true),
  ('espn-soccer', 'ESPN Soccer', 'rss', 'https://www.espn.com/espn/rss/soccer/news', 'en', true),
  ('bbc-football', 'BBC Football', 'rss', 'https://feeds.bbci.co.uk/sport/football/rss.xml', 'en', true),
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
  array['英超', '欧冠', '西甲'],
  array[]::text[],
  'light'
)
on conflict (user_key) do update
set
  language = excluded.language,
  brief_time = excluded.brief_time,
  followed_leagues = excluded.followed_leagues;
