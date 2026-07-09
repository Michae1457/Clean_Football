import { ArticleCard } from "@/components/cards/article-card";
import { EmptyState } from "@/components/ui/page-state";
import { getLatestArticles } from "@/lib/news-repository";

const filters = ["全部", "英超", "欧冠", "西甲", "转会"];

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const articles = await getLatestArticles();

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            className="h-9 shrink-0 rounded-lg border bg-card px-4 text-sm font-medium text-muted transition-colors first:bg-accent first:text-black hover:text-text"
            key={filter}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      {articles.length > 0 ? (
        <section className="space-y-3">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </section>
      ) : (
        <EmptyState
          description="当前新闻源没有返回可展示的足球新闻。"
          title="暂无新闻"
        />
      )}
    </div>
  );
}
