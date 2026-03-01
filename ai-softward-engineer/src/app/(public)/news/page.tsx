import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { News } from "@/types/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const revalidate = 60;

export default async function NewsListPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("news")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const news = (data ?? []) as News[];

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">最新消息</h1>

      {news.length === 0 ? (
        <p className="text-muted-foreground">目前沒有最新消息</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                {item.cover_image && (
                  <img
                    src={item.cover_image}
                    alt={item.title}
                    className="h-48 w-full object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                  <CardDescription>
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString("zh-TW")
                      : ""}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
