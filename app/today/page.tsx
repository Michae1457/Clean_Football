import { ArticleCard } from "@/components/cards/article-card";
import { DailyBriefCard } from "@/components/cards/daily-brief-card";
import { MatchCard } from "@/components/cards/match-card";
import { EmptyState } from "@/components/ui/page-state";
import { getTodayBrief } from "@/lib/daily-brief-repository";
import { getTodayMatches } from "@/lib/match-repository";
import { quickQuestions } from "@/lib/mock-data";
import { getLatestArticles } from "@/lib/news-repository";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [dailyBrief, todayMatches, articles] = await Promise.all([
    getTodayBrief(),
    getTodayMatches(),
    getLatestArticles()
  ]);

  return (
    <div className="space-y-7">
      <DailyBriefCard brief={dailyBrief} />

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted">Today matches</p>
            <h2 className="mt-1 text-xl font-semibold text-text">今日赛程</h2>
          </div>
          <span className="text-sm text-muted">{todayMatches.length} 场</span>
        </div>
        {todayMatches.length > 0 ? (
          <div className="space-y-3">
            {todayMatches.slice(0, 2).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="关注范围内今天暂时没有可靠入库的比赛。"
            title="暂无赛程数据"
          />
        )}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted">Top news</p>
            <h2 className="mt-1 text-xl font-semibold text-text">重点新闻</h2>
          </div>
          <span className="text-sm text-muted">{articles.length} 条</span>
        </div>
        {articles.length > 0 ? (
          <div className="space-y-3">
            {articles.slice(0, 2).map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="新闻源暂时没有新的足球内容。"
            title="暂无重点新闻"
          />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-text">快捷提问</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {quickQuestions.map((question) => (
            <div
              className="rounded-lg border bg-card px-4 py-3 text-sm font-medium text-text"
              key={question}
            >
              {question}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
