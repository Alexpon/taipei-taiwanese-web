"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const cover_image = (formData.get("cover_image") as string) || null;
  const event_date = formData.get("event_date") as string;
  const location = formData.get("location") as string;
  const registration_url =
    (formData.get("registration_url") as string) || null;
  const status = formData.get("status") as "draft" | "published";

  const { error } = await supabase.from("events").insert({
    title,
    description,
    cover_image,
    event_date,
    location,
    registration_url,
    status,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/events");
  revalidatePath("/");
  redirect("/admin/events");
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const cover_image = (formData.get("cover_image") as string) || null;
  const event_date = formData.get("event_date") as string;
  const location = formData.get("location") as string;
  const registration_url =
    (formData.get("registration_url") as string) || null;
  const status = formData.get("status") as "draft" | "published";

  const updateData = {
    title,
    description,
    cover_image,
    event_date,
    location,
    registration_url,
    status,
  };

  const { error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/events");
  revalidatePath("/");
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/events");
  revalidatePath("/");
}
