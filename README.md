<p align="center">
  <img src="./public/clean-football-logo.svg" width="116" alt="Clean Football logo" />
</p>

<h1 align="center">Clean Football</h1>

<p align="center">
  一个中文优先、少噪音、不赌球的足球信息 PWA。
  <br />
  每天早上，把赛程、赛果、重点新闻和可信聊球助手整理到一个干净界面里。
</p>

<p align="center">
  <a href="https://github.com/Michae1457/Clean_Football">GitHub</a>
  ·
  <a href="#本地启动">本地启动</a>
  ·
  <a href="#vercel-部署">部署</a>
  ·
  <a href="#ai-与-agent">AI Agent</a>
</p>

## 为什么做

足球信息很丰富，但也很吵。

Clean Football 想做的是一个更安静的入口：不刷评论区，不制造争论，不给投注建议，不把不确定的消息说成事实。它只关心三件事：

- 今天有哪些值得看的比赛。
- 发生了哪些真正重要的足球新闻。
- 当你想聊球时，AI 只基于已有赛程、新闻和简报回答。

第一版是个人使用导向的中文足球 PWA，适合部署在 Vercel + Supabase 上，每天 09:00 自动生成当天简报。

## 已有功能

- **今日页**：每日中文简报、今日赛程、重点新闻、快捷提问。
- **赛程页**：昨日 / 今日 / 明日赛程与赛果，数据来自 TheSportsDB。
- **新闻页**：RSS 新闻源聚合，支持英文新闻中文摘要。
- **聊球 Agent**：三种风格的助手。
  - 简单懂球朋友型：轻松、短句、先讲重点。
  - 战术专家型：阵型、压迫、转换、关键对位。
  - 预测大师型：趋势判断、风险分层，不猜准确比分。
- **双主题 UI**：light 是清爽白天模式，dark 是深夜看球模式。
- **定时任务**：Vercel Cron 每天北京时间 09:00 同步赛程、新闻并生成简报。
- **PWA 与推送**：支持添加到 iOS 主屏幕，并订阅每日简报通知。
- **安全边界**：不编造首发、伤病、内幕；不输出投注建议。

## 技术栈

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui 风格组件
- Supabase Postgres
- TheSportsDB 免费足球数据
- RSS / RSSHub 新闻源
- OpenAI-compatible AI provider abstraction
- Vercel Cron
- Web Push / PWA

## 本地启动

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开：

```text
http://localhost:3000
```

没有 Supabase 配置时，页面会使用 mock 数据，方便先看 UI。

常用检查：

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Supabase 配置

1. 新建 Supabase 项目。
2. 在 Supabase SQL editor 里按顺序执行：

```text
supabase/migrations/202607090001_initial_schema.sql
supabase/migrations/202607090002_add_verified_news_sources.sql
supabase/migrations/202607090003_add_world_cup_and_top_league_sources.sql
supabase/migrations/202607090004_add_sportsdb_match_source.sql
supabase/migrations/202607090005_add_push_subscriptions.sql
supabase/seed.sql
```

3. 在 `.env.local` 或 Vercel 环境变量里填写：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` 用于页面读取；`SUPABASE_SERVICE_ROLE_KEY` 只在 server job / cron 中使用，不要暴露到客户端。

## 数据同步

新闻 RSS：

```bash
npm run job:fetch-news:dry
npm run job:fetch-news
```

新闻页也提供手动刷新按钮，会调用 `/api/news/refresh` 即时拉取 RSS。可配置：

```bash
NEWS_REFRESH_LIMIT_PER_SOURCE=8
NEWS_REFRESH_COOLDOWN_SECONDS=300
NEWS_REFRESH_USE_AI=true
```

赛程：

```bash
npm run job:fetch-matches:dry
npm run job:fetch-matches
```

每日简报：

```bash
npm run job:generate-brief:dry
npm run job:generate-brief
```

TheSportsDB 免费 key 默认是 `123`，也可以用 `THESPORTSDB_API_KEY` 覆盖。

RSSHub 只在配置 `RSSHUB_BASE_URL` 后启用第三方中文源，例如虎扑 / 懂球帝路线。公共实例可能返回 `403`，自建实例更稳定。

## AI 与 Agent

统一 AI 入口在 `lib/ai.ts`。支持：

- OpenAI
- OpenRouter
- DeepSeek
- Doubao / Volcengine Ark
- Qwen / DashScope
- 自定义 OpenAI-compatible 网关

全局任务开关：

```bash
AI_ENABLED=true
AI_PROVIDER=openai
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=
AI_ENABLE_ARTICLE_SUMMARY=true
AI_ENABLE_DAILY_BRIEF=true
AI_ENABLE_AGENT=true
AGENT_WEB_SEARCH_ENABLED=true
AGENT_WEB_SEARCH_MAX_RESULTS=5
TAVILY_API_KEY=
```

中文摘要和每日简报默认跟随全局 `AI_PROVIDER` / `AI_MODEL`。如果要单独切换，可以覆盖任务级配置：

```bash
ARTICLE_SUMMARY_AI_PROVIDER=qwen
ARTICLE_SUMMARY_AI_MODEL=qwen-plus

DAILY_BRIEF_AI_PROVIDER=doubao
DAILY_BRIEF_AI_MODEL=你的火山方舟 endpoint id 或模型名
```

每个 Agent 可单独配置 provider 和 model：

```bash
AGENT_FRIEND_PROVIDER=qwen
AGENT_FRIEND_MODEL=qwen-plus

AGENT_TACTICIAN_PROVIDER=deepseek
AGENT_TACTICIAN_MODEL=deepseek-v4-flash

AGENT_PREDICTOR_PROVIDER=openrouter
AGENT_PREDICTOR_MODEL=~openai/gpt-latest

AGENT_FRIEND_PROVIDER=doubao
AGENT_FRIEND_MODEL=你的火山方舟 endpoint id 或模型名

AGENT_PREDICTOR_DAILY_LIMIT=1
```

Agent 联网搜索使用 Tavily。配置 `TAVILY_API_KEY` 后，用户可以在 Agent 输入框左下角手动开启 `Web Search`；只有开启后才会调用 Tavily Search 并消耗 search credit。没有配置或没有开启时，Agent 只使用站内赛程、新闻和简报。预测大师默认每天最多 1 次 AI 请求，用来控制高价模型成本；这个计数依赖 Supabase migration `202607100001_add_agent_daily_usage.sql`。

豆包 / 火山方舟使用 OpenAI-compatible 接口：

```bash
DOUBAO_API_KEY=
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=你的火山方舟 endpoint id 或模型名
```

OpenRouter 的 `OPENROUTER_SITE_URL` 会作为 `HTTP-Referer` 请求头传给 OpenRouter，用来标识你的站点来源；线上可以填 `https://clean-football.vercel.app`，本地开发可以留空。

Prompt 位置：

- Agent：`prompts/agents/`
- 每日简报：`prompts/daily-brief.md`
- 新闻摘要：`prompts/article-summary.md`

没有配置 AI key 时，应用仍可运行，Agent 和每日简报会走 fallback。

## PWA 与 iOS 推送

iPhone 使用方式：

1. 用 Safari 打开线上站点。
2. 点击分享按钮。
3. 选择「添加到主屏幕」。
4. 从主屏幕图标打开 Clean Football。
5. 到设置页开启「每日推送」。

推送使用 Web Push VAPID。先生成一组 key：

```bash
npm run push:vapid
```

把输出填入 `.env.local` 或 Vercel 环境变量：

```bash
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:you@example.com
```

`NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` 会被浏览器用于订阅；`WEB_PUSH_PRIVATE_KEY` 只在服务端发送通知时使用。每日 cron 生成简报后，会向已订阅设备发送通知，点击通知打开 `/today`。

## Vercel 部署

项目已包含 `vercel.json`：

```json
{
  "crons": [
    {
      "path": "/api/cron/hourly",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/daily",
      "schedule": "0 1 * * *"
    }
  ]
}
```

`/api/cron/hourly` 每小时整点刷新赛程和新闻；`/api/cron/daily` 的 `0 1 * * *` 是 UTC 时间，对应北京时间每天 09:00，用于生成每日简报和推送。

部署前在 Vercel Project Settings 里配置 Production 环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
THESPORTSDB_API_KEY=123

CRON_SECRET=
CRON_HOURLY_MAX_PER_SOURCE=6
CRON_HOURLY_NEWS_USE_AI=false
CRON_MAX_PER_SOURCE=8
CRON_NEWS_USE_AI=true
CRON_BRIEF_USE_AI=true
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:you@example.com
```

`CRON_SECRET` 建议用至少 16 位随机字符串。Vercel Cron 会通过 `Authorization: Bearer <CRON_SECRET>` 调用 cron endpoint。每小时刷新默认不做 AI 中文摘要，避免每小时消耗模型额度；如果你想让小时级新闻也直接生成中文摘要，可以把 `CRON_HOURLY_NEWS_USE_AI=true`。

生产环境手动触发：

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/cron/hourly
curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/cron/daily
```

## 项目结构

```text
app/                 Next.js App Router 页面与 API route
components/          UI 组件
jobs/                新闻、赛程、每日简报同步脚本
lib/                 数据访问、AI、RSS、SportsDB、Agent 工具
prompts/             AI prompt
public/              Logo 和静态资源
supabase/            migrations 与 seed
```

## 继续开发

先读：

- `CODEX_PROMPT.md`
- `TODO.md`
- `jobs/README.md`

开发原则：

- 不做评论区。
- 不做社区争论流。
- 不做投注建议。
- Agent 只能基于已入库新闻、赛程和简报回答。
- 外部 API 失败时必须有 fallback、empty 或 error 状态。

## Roadmap

- [ ] 部署到 Vercel 并绑定正式域名。
- [ ] 自建 RSSHub，稳定接入虎扑 / 懂球帝中文新闻源。
- [ ] 增加用户可编辑的关注联赛和球队。
- [ ] 增加简报历史页。
- [ ] 增加更细的 Agent 数据工具，例如按球队、联赛、时间范围检索。

---

Clean Football is for people who still love the game, but want a quieter way to follow it.
