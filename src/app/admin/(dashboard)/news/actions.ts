"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNews(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const cover_image = (formData.get("cover_image") as string) || null;
  const status = formData.get("status") as "draft" | "published";

  const { error } = await supabase.from("news").insert({
    title,
    content,
    cover_image,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/news");
  revalidatePath("/");
  redirect("/admin/news");
}

export async function updateNews(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const cover_image = (formData.get("cover_image") as string) || null;
  const newStatus = formData.get("status") as "draft" | "published";

  // Fetch current status to determine published_at behavior
  const { data: existing } = await supabase
    .from("news")
    .select("status, published_at")
    .eq("id", id)
    .single();

  const oldStatus = existing?.status;

  // Determine published_at value based on status transition
  let published_at: string | null;
  if (newStatus === "published" && oldStatus === "draft") {
    published_at = new Date().toISOString();
  } else if (newStatus === "draft") {
    published_at = null;
  } else {
    // Keep existing published_at when status hasn't changed
    published_at = existing?.published_at ?? null;
  }

  const updateData = {
    title,
    content,
    cover_image,
    status: newStatus,
    published_at,
  };

  const { error } = await supabase
    .from("news")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/news");
  revalidatePath("/");
  redirect("/admin/news");
}

export async function deleteNews(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/news");
  revalidatePath("/");
}
