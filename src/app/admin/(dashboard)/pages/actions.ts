"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePage(
  slug: string,
  data: { title: string; content: string }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("pages")
    .update({
      title: data.title,
      content: data.content,
    })
    .eq("slug", slug);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/${slug}`);
  revalidatePath("/admin/pages");
}
