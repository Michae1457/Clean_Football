import { ExternalLink } from "lucide-react";
import type { Article } from "@/lib/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 max-w-full items-center gap-2">
          <span className="rounded-full bg-accent px-2 py-1 font-medium text-black">
            {article.tag}
          </span>
          <span className="truncate text-muted">{article.source}</span>
        </div>
        <span className="shrink-0 font-mono text-muted">{article.publishedAt}</span>
      </div>
      <h2 className="mt-4 text-lg font-semibold leading-snug text-text">
        {article.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">{article.summary}</p>
      {article.url ? (
        <a
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-text transition-colors hover:text-accent"
          href={article.url}
          rel="noreferrer"
          target="_blank"
        >
          打开原文
          <ExternalLink className="size-4" />
        </a>
      ) : (
        <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-text transition-colors hover:text-accent">
          阅读摘要
          <ExternalLink className="size-4" />
        </button>
      )}
    </article>
  );
}
