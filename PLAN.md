# Clean Football Demo 最终版计划文档（V1）

## 项目定位
Clean Football Demo 是一个中文优先、干净友好、无争论氛围、以足球为核心的个人体育信息 PWA Demo。核心体验是：每天早上 9 点自动生成足球简报，汇总昨晚新闻、赛果、今天赛程，并提供一个简单懂球朋友型 Agent。

## V1 决策
- 产品形态：手机端优先 Web App / PWA
- 内容范围：足球 only
- 第一阶段联赛：英超、欧冠、西甲
- 语言策略：中文优先，英文新闻统一生成中文摘要
- 数据策略：免费 API + RSS 优先，避免正文重爬
- 简报时间：每天早上 9:00
- UI 主题：白天模式=浅色简洁清新；深夜模式=深色绿荧光运动风
- Agent 风格：第一版为简单懂球朋友型，后续支持多模式切换

## 页面
1. Today：今日简报、今日赛程、重点新闻、快捷提问
2. Matches：昨日/今日/明日赛程，按联赛分组
3. News：中文摘要新闻流
4. Agent：聊球问答
5. Settings：关注球队/联赛、主题、语言、简报时间

## UI 主题
### 白天模式（风格 C）
- 背景：#F6F7F8
- 卡片：#FFFFFF
- 主文字：#111111
- 辅助文字：#6B7280
- 分割线：#E5E7EB
- 强调色：#6FCF97
- 场景：早报、资讯阅读、白天浏览

### 深夜模式（风格 B）
- 背景：#050505
- 卡片：#111111
- 主文字：#FFFFFF
- 辅助文字：#A1A1AA
- 分割线：#27272A
- 强调色：#7CFF5B
- 场景：夜间看球、睡前资讯、沉浸聊球

## 数据源
- 比赛数据：TheSportsDB
- 球队资料：TheSportsDB
- 中文新闻：新浪体育 RSS
- 英文新闻：ESPN RSS、BBC Football RSS、Guardian Football 可选
- AI：OpenAI API 或兼容模型

## 每日 9 点简报流程
- 08:40 拉取新闻
- 08:45 拉取今日赛程
- 08:50 拉取昨日赛果
- 08:55 生成中文简报
- 09:00 首页展示

## Agent 原则
- 中文、简洁、冷静
- 不赌球，不预测准确比分
- 不编首发、伤病、数据
- 优先查询本地数据库
- 数据不足时明确说明不确定

## 技术栈
- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Postgres
- Vercel Cron / Cloudflare Workers Cron / Supabase Edge Functions
- OpenAI API
- Vercel 部署

## MVP 验收
- 首页展示今日简报、赛程、新闻
- 赛程页能切换昨日/今日/明日
- 新闻页展示中文摘要
- Agent 能回答基础问题
- 支持白天/深夜主题
- 每天 9 点刷新简报
