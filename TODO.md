# Clean Football Demo 技术开发 TODO List

## Phase 0：项目初始化

- [x] 初始化 Next.js + TypeScript 项目。
- [x] 配置 Tailwind CSS、shadcn/ui、ESLint、Prettier。
- [x] 创建基础目录结构 app/components/lib/jobs/prompts/supabase。
- [x] 准备 .env.example：Supabase、TheSportsDB、AI API key。

## Phase 1：UI 与主题系统

- [x] 实现底部导航：今日、赛程、新闻、聊球。
- [x] 实现 CSS Variables 双主题：light=风格 C，dark=风格 B。
- [x] 实现 ThemeProvider 和 Settings 中的主题切换。
- [x] 完成 Today / Matches / News / Agent 页面 mock 数据版。
- [x] 实现 MatchCard、ArticleCard、DailyBriefCard、AgentChat 组件。

## Phase 2：数据库

- [x] 创建 Supabase 项目。
- [x] 写 migrations：sources、articles、teams、matches、daily_briefs、user_preferences。
- [x] 实现 lib/db.ts Supabase client。
- [x] 插入默认 user_preferences：中文、9:00、英超/欧冠/西甲。

## Phase 3：新闻 RSS

- [x] 实现 lib/rss.ts，解析 RSS feed。
- [x] 接入新浪体育 RSS、ESPN RSS、BBC Football RSS。
- [x] 实现 fetchNews job：拉取、URL 去重、入库。
- [x] 实现 article-summary prompt，英文新闻生成中文摘要。
- [x] News 页面读取 articles 并渲染。

## Phase 4：比赛数据

- [x] 配置 TheSportsDB API key。
- [x] 实现 lib/thesportsdb.ts。
- [x] 实现 fetchMatches job：拉取昨日/今日/明日赛程和赛果。
- [x] 标准化 matches 表字段。
- [x] Today 和 Matches 页面读取 matches 并按联赛/时间渲染。

## Phase 5：每日简报

- [x] 实现 generateDailyBrief job。
- [x] 读取最新 articles、today matches、yesterday results、user preferences。
- [x] 调用 AI 生成 500 字以内中文简报。
- [x] 写入 daily_briefs 表。
- [x] Today 页面优先读取当天 brief。
- [x] 配置每天 09:00 cron。

## Phase 6：Agent

- [x] 实现 Agent 页面聊天 UI。
- [x] 实现工具函数 getTodayBrief、getTodayMatches、searchNews、getTeamNews。
- [x] 实现 agent prompt：简单懂球朋友型。
- [x] 限制 Agent 不编造、不赌球、不预测准确比分。
- [x] 完成“今天哪场值得看”“总结今天重点”两个核心问答。

## Phase 7：部署与打磨

- [ ] 部署到 Vercel。
- [ ] 配置 Supabase 环境变量。
- [x] 配置 cron job。
- [x] 补充 loading、empty、error 状态。
- [x] 移动端适配检查。
- [x] 写 README：如何启动、如何配置 API key、如何交给 Codex 继续开发。

## Phase 8：PWA 与 iOS 推送

- [x] 添加 Web App Manifest 与 iOS 主屏幕图标。
- [x] 注册 Service Worker。
- [x] 创建 push_subscriptions 数据表 migration。
- [x] 实现推送订阅 / 取消订阅 API。
- [x] 在 Settings 页面添加每日推送开关和测试通知。
- [x] 在每日 cron 生成简报后发送 Web Push。
- [x] 补充 VAPID key 配置说明。
- [ ] 增加按关注联赛 / 球队的个性化推送。
- [ ] 增加赛前提醒推送。
