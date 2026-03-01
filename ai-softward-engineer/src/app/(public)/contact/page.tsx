import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/types/database";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function ContactPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", "contact")
    .single();

  const page = data as Page | null;

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">{page.title}</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Content */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Google Map Placeholder */}
        <div className="flex h-80 items-center justify-center rounded-lg bg-muted lg:h-full lg:min-h-80">
          <div className="text-center text-muted-foreground">
            <svg
              className="mx-auto mb-2 h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p>Google Map</p>
          </div>
        </div>
      </div>
    </div>
  );
}
