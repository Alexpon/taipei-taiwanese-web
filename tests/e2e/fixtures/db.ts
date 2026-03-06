import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function seedTestNews(overrides: Record<string, unknown> = {}) {
  const admin = createAdminClient();
  const defaultNews = {
    title: "Test News " + Date.now(),
    content: "<p>Test content</p>",
    status: "published" as const,
    published_at: new Date().toISOString(),
    ...overrides,
  };
  const { data, error } = await admin
    .from("news")
    .insert(defaultNews)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function seedTestEvent(overrides: Record<string, unknown> = {}) {
  const admin = createAdminClient();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultEvent = {
    title: "Test Event " + Date.now(),
    description: "<p>Test event description</p>",
    event_date: tomorrow.toISOString(),
    location: "Test Location",
    status: "published" as const,
    ...overrides,
  };
  const { data, error } = await admin
    .from("events")
    .insert(defaultEvent)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cleanupTestData(table: string, ids: string[]) {
  if (ids.length === 0) return;
  const admin = createAdminClient();
  await admin.from(table).delete().in("id", ids);
}
