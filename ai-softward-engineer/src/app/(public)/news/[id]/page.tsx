import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { News } from "@/types/database";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  const news = data as News | null;

  if (!news) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Link
        href="/news"
        className="mb-6 inline-block text-primary hover:underline"
      >
        &larr; 返回最新消息
      </Link>

      <article>
        <h1 className="mb-4 text-3xl font-bold">{news.title}</h1>
        <p className="mb-8 text-muted-foreground">
          {news.published_at
            ? new Date(news.published_at).toLocaleDateString("zh-TW")
            : ""}
        </p>

        {news.cover_image && (
          <img
            src={news.cover_image}
            alt={news.title}
            className="mb-8 w-full rounded-lg object-cover"
          />
        )}

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </article>
    </div>
  );
}
