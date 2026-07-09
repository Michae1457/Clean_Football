"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/cards/article-card";
import { EmptyState } from "@/components/ui/page-state";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters = ["全部", "英超", "欧冠", "西甲", "转会"] as const;

export function NewsFeed({ articles }: { articles: Article[] }) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("全部");
  const filteredArticles = useMemo(
    () => filterArticles(articles, activeFilter),
    [activeFilter, articles]
  );

  if (articles.length === 0) {
    return (
      <EmptyState
        description="当前新闻源没有返回可展示的足球新闻。"
        title="暂无新闻"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const active = activeFilter === filter;

          return (
            <button
              aria-pressed={active}
              className={cn(
                "h-9 shrink-0 rounded-lg border bg-card px-4 text-sm font-medium text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active && "bg-accent text-black hover:text-black"
              )}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          );
        })}
      </div>

      {filteredArticles.length > 0 ? (
        <section className="space-y-3">
          {filteredArticles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </section>
      ) : (
        <EmptyState
          description={`${activeFilter}暂时没有匹配的新闻。`}
          title="暂无筛选结果"
        />
      )}
    </div>
  );
}

function filterArticles(articles: Article[], filter: (typeof filters)[number]) {
  if (filter === "全部") {
    return articles;
  }

  const aliases = getFilterAliases(filter);

  return articles.filter((article) => {
    const text = `${article.tag} ${article.title} ${article.summary} ${article.source}`.toLowerCase();
    return aliases.some((alias) => text.includes(alias.toLowerCase()));
  });
}

function getFilterAliases(filter: Exclude<(typeof filters)[number], "全部">) {
  const aliasMap: Record<typeof filter, string[]> = {
    欧冠: ["欧冠", "欧战", "champions league", "uefa"],
    西甲: ["西甲", "la liga", "real madrid", "barcelona"],
    英超: ["英超", "premier league", "arsenal", "chelsea", "tottenham"],
    转会: ["转会", "transfer", "signing", "rumor", "rumour"]
  };

  return aliasMap[filter];
}
