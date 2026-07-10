# jobs

## fetchNews

Pulls configured RSS feeds, filters obvious betting/odds articles, generates Chinese summaries for English sources when AI is configured, and upserts articles into Supabase by URL.

```bash
npm run job:fetch-news:dry
npm run job:fetch-news
npm run job:fetch-news:no-ai
```

Required for writes:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Useful flags:

- `--max-per-source=20`
- `--dry-run`
- `--no-ai`

Optional AI config for English-to-Chinese summaries:

- `AI_PROVIDER`, one of `off`, `openai`, `openrouter`, `deepseek`, `doubao`, `qwen`, `custom`
- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`
- `ARTICLE_SUMMARY_AI_PROVIDER`, `ARTICLE_SUMMARY_AI_MODEL`, `ARTICLE_SUMMARY_AI_API_KEY`, `ARTICLE_SUMMARY_AI_BASE_URL` to override only article summaries
- `AI_ENABLE_ARTICLE_SUMMARY=false` to disable only article summaries
- Provider-specific keys such as `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `DOUBAO_API_KEY`, `QWEN_API_KEY`, `DASHSCOPE_API_KEY`, or legacy `OPENAI_API_KEY`

Optional for Chinese third-party feeds:

- `RSSHUB_BASE_URL`, for example `https://your-rsshub.example.com`

When configured, the job also reads RSSHub routes for Dongqiudi top news, World Cup, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and Hupu soccer news. These routes are for news content only; community comments are not fetched.

RSSHub sources are optional. If a public RSSHub instance returns `403`, the job reports those rows but does not fail the entire run.

## fetchMatches

Pulls yesterday, today, and tomorrow matches from TheSportsDB `eventsday.php` for FIFA World Cup, UEFA Champions League, Premier League, La Liga, Serie A, Bundesliga, and Ligue 1. Matches are upserted into Supabase by `external_id`.

```bash
npm run job:fetch-matches:dry
npm run job:fetch-matches
```

Required for writes:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `THESPORTSDB_API_KEY`, defaults to the public free v1 key `123`

## generateDailyBrief

Reads latest articles, today matches, yesterday results, and default user preferences, then writes one row into `daily_briefs` for the selected date.

```bash
npm run job:generate-brief:dry
npm run job:generate-brief
npm run job:generate-brief:no-ai
```

Required for writes:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional for AI generation:

- `AI_PROVIDER`, one of `off`, `openai`, `openrouter`, `deepseek`, `doubao`, `qwen`, `custom`
- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`
- `DAILY_BRIEF_AI_PROVIDER`, `DAILY_BRIEF_AI_MODEL`, `DAILY_BRIEF_AI_API_KEY`, `DAILY_BRIEF_AI_BASE_URL` to override only daily brief generation
- `AI_ENABLE_DAILY_BRIEF=false` to disable only daily brief generation
- Provider-specific keys such as `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `DOUBAO_API_KEY`, `QWEN_API_KEY`, `DASHSCOPE_API_KEY`, or legacy `OPENAI_API_KEY`

Useful flags:

- `--date=2026-07-09`
- `--dry-run`
- `--no-ai`

Prompts:

- Article summaries: `prompts/article-summary.md`
- Daily brief: `prompts/daily-brief.md`

## Vercel cron

`app/api/cron/daily/route.ts` reuses these job functions in this order:

1. `fetchMatches`
2. `fetchNews`
3. `generateDailyBrief`
4. `sendDailyBriefNotification`

The route is configured in `vercel.json` to run at `0 1 * * *`, which is 09:00 in Asia/Shanghai. Production requests must include `Authorization: Bearer <CRON_SECRET>`.

Daily push notifications are skipped unless all push env vars are configured:

- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
- `WEB_PUSH_PRIVATE_KEY`
- `WEB_PUSH_SUBJECT`

Generate VAPID keys with:

```bash
npm run push:vapid
```
