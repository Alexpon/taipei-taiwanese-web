import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { News, Event } from "@/types/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: newsItems } = await supabase
    .from("news")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  const { data: eventItems } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(3);

  const news = (newsItems ?? []) as News[];
  const events = (eventItems ?? []) as Event[];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            台北市台灣語協會
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl opacity-90">
            推廣台灣語言文化教育，傳承母語之美
          </p>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">最新消息</h2>
            <Link
              href="/news"
              className="text-primary hover:underline"
            >
              查看所有消息 &rarr;
            </Link>
          </div>

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
                      <CardTitle className="line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <CardDescription>
                        {item.published_at
                          ? new Date(item.published_at).toLocaleDateString(
                              "zh-TW"
                            )
                          : ""}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">活動課程</h2>
            <Link
              href="/events"
              className="text-primary hover:underline"
            >
              查看所有活動 &rarr;
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="text-muted-foreground">目前沒有活動課程</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((item) => (
                <Link key={item.id} href={`/events/${item.id}`}>
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                    {item.cover_image && (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <CardDescription>
                        <span>
                          {new Date(item.event_date).toLocaleDateString(
                            "zh-TW"
                          )}
                        </span>
                        {item.location && (
                          <span className="ml-2">| {item.location}</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
