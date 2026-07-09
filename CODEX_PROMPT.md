# CODEX_PROMPT.md

你正在开发一个名为 Clean Football Demo 的中文足球信息 PWA。

## 产品目标
做一个中文优先、干净、无社区争论氛围的个人足球 App。第一版只做足球，核心功能是：每天早上 9 点足球简报、今日赛程、重点新闻、简单聊球 Agent。

## 技术栈
- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Postgres
- TheSportsDB API
- RSS 新闻源
- OpenAI API 或兼容模型

## 第一阶段要求
不要一次性实现全部功能。请按 TODO.md 的 Phase 顺序开发。

优先顺序：
1. Phase 0：项目初始化
2. Phase 1：UI 与双主题系统
3. Phase 2：数据库
4. Phase 3：新闻 RSS
5. Phase 4：比赛数据
6. Phase 5：每日简报
7. Phase 6：Agent
8. Phase 7：部署与打磨

## UI 主题
实现一套组件，两套主题：

### light / 白天模式 / 风格 C
- --bg: #F6F7F8
- --card: #FFFFFF
- --text: #111111
- --text-secondary: #6B7280
- --border: #E5E7EB
- --accent: #6FCF97

### dark / 深夜模式 / 风格 B
- --bg: #050505
- --card: #111111
- --text: #FFFFFF
- --text-secondary: #A1A1AA
- --border: #27272A
- --accent: #7CFF5B

## 页面
- /today：今日简报、今日赛程、重点新闻
- /matches：赛程和赛果
- /news：新闻摘要流
- /agent：聊球助手
- /settings：主题、关注联赛、关注球队、简报时间

## 开发约束
- 先做 mock UI，再接真实 API。
- 不要实现评论区、社区、投注建议。
- Agent 不允许编造数据、伤病、首发。
- 所有外部 API 都要做缓存和错误处理。
- 每次变更完成后说明修改了哪些文件、如何运行、还有哪些 TODO。

## 推荐第一条执行指令
请先完成 Phase 0 和 Phase 1：初始化项目结构、配置 Tailwind/shadcn、实现双主题 CSS variables、底部导航、Today/Matches/News/Agent/Settings 的 mock 页面，以及 MatchCard、ArticleCard、DailyBriefCard 组件。不要接外部 API。完成后列出文件变更和运行方式。
