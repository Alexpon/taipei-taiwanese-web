import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/types/database";
import { notFound } from "next/navigation";

export const metadata = { title: "關於我們" };

export const revalidate = 60;

export default async function AboutPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", "about")
    .single();

  const page = data as Page | null;

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">{page.title}</h1>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
