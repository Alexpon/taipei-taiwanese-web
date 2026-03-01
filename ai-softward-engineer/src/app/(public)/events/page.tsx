import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const revalidate = 60;

export default async function EventsListPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("event_date", { ascending: true });

  const events = (data ?? []) as Event[];

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">活動課程</h1>

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
                  <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                  <CardDescription>
                    <span>
                      {new Date(item.event_date).toLocaleDateString("zh-TW")}
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
  );
}
