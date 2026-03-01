export interface News {
  id: string;
  title: string;
  content: string;
  cover_image: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  event_date: string;
  location: string;
  registration_url: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
}
