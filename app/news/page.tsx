import { NewsFeed } from "@/components/news/news-feed";
import { getLatestArticles } from "@/lib/news-repository";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const articles = await getLatestArticles();

  return <NewsFeed articles={articles} />;
}
