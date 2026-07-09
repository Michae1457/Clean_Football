import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArticleById } from "@/lib/news-repository";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const originalContent = article.contentSnippet || article.originalSummary;

  return (
    <article className="space-y-5">
      <Button asChild variant="ghost">
        <Link href="/news">
          <ArrowLeft className="size-4" />
          返回新闻
        </Link>
      </Button>

      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex min-w-0 max-w-full items-center gap-2">
            <span className="rounded-full bg-accent px-2 py-1 font-medium text-black">
              {article.tag}
            </span>
            <span className="truncate text-muted">{article.source}</span>
          </div>
          <span className="shrink-0 font-mono text-muted">
            {article.publishedAt}
          </span>
        </div>

        <h2 className="mt-5 text-2xl font-semibold leading-tight text-text">
          {article.title}
        </h2>

        {article.originalTitle && article.originalTitle !== article.title ? (
          <p className="mt-3 text-sm leading-6 text-muted">
            原标题：{article.originalTitle}
          </p>
        ) : null}

        <div className="mt-5 space-y-3 border-t pt-5">
          <h3 className="text-base font-semibold text-text">中文摘要</h3>
          <p className="whitespace-pre-line text-base leading-8 text-text">
            {article.summary}
          </p>
        </div>

        {originalContent ? (
          <div className="mt-5 space-y-3 border-t pt-5">
            <h3 className="text-base font-semibold text-text">已收录内容</h3>
            <p className="whitespace-pre-line text-sm leading-7 text-muted">
              {originalContent}
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs text-muted">
          <span>语言：{article.language}</span>
          <span>收录：{article.fetchedAt}</span>
        </div>

        {article.url ? (
          <Button asChild className="mt-5 w-full sm:w-auto">
            <a href={article.url} rel="noreferrer" target="_blank">
              打开原文
              <ExternalLink className="size-4" />
            </a>
          </Button>
        ) : null}
      </section>
    </article>
  );
}
