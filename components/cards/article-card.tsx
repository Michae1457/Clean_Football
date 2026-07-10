import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Article } from "@/lib/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="match-surface rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 max-w-full items-center gap-2">
          <span className="accent-badge rounded-full bg-accent px-2.5 py-1 font-semibold text-black">
            {article.tag}
          </span>
          <span className="truncate text-muted">{article.source}</span>
        </div>
        <span className="shrink-0 font-mono text-muted">{article.publishedAt}</span>
      </div>
      <Link
        aria-label={`阅读新闻：${article.title}`}
        className="mt-4 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        href={`/news/${article.id}`}
      >
        <h2 className="text-xl font-bold leading-snug text-text">
          {article.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{article.summary}</p>
      </Link>
      {article.url ? (
        <a
          className="interactive-control mt-4 inline-flex items-center gap-2 text-sm font-medium text-text hover:text-accent"
          href={article.url}
          rel="noreferrer"
          target="_blank"
        >
          打开原文
          <ExternalLink className="size-4" />
        </a>
      ) : (
        <button className="interactive-control mt-4 inline-flex items-center gap-2 text-sm font-medium text-text hover:text-accent">
          阅读摘要
          <ExternalLink className="size-4" />
        </button>
      )}
    </article>
  );
}
