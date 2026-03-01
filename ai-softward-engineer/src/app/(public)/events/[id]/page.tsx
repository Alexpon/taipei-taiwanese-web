import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("title")
    .eq("id", id)
    .eq("status", "published")
    .single();

  return {
    title: (data as Event | null)?.title ?? "活動課程",
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  const event = data as Event | null;

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Link
        href="/events"
        className="mb-6 inline-block text-primary hover:underline"
      >
        &larr; 返回活動課程
      </Link>

      <article>
        <h1 className="mb-4 text-3xl font-bold">{event.title}</h1>

        <div className="mb-8 flex flex-wrap items-center gap-4 text-muted-foreground">
          <span>
            {new Date(event.event_date).toLocaleDateString("zh-TW")}
          </span>
          {event.location && <span>| {event.location}</span>}
        </div>

        {event.registration_url && (
          <div className="mb-8">
            <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
              <Button size="lg">立即報名</Button>
            </a>
          </div>
        )}

        {event.cover_image && (
          <img
            src={event.cover_image}
            alt={event.title}
            className="mb-8 w-full rounded-lg object-cover"
          />
        )}

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
      </article>
    </div>
  );
}
