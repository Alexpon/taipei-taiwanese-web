import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock Supabase
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

import { createEvent, updateEvent, deleteEvent } from "@/app/admin/(dashboard)/events/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("Events Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: insert/update/delete succeed
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
  });

  describe("createEvent", () => {
    it("inserts event with all fields including registration_url", async () => {
      const fd = makeFormData({
        title: "Workshop",
        description: "<p>A workshop</p>",
        cover_image: "https://example.com/img.jpg",
        event_date: "2026-04-01",
        location: "Taipei City Hall",
        registration_url: "https://example.com/register",
        status: "published",
      });

      await createEvent(fd);

      expect(mockFrom).toHaveBeenCalledWith("events");
      expect(mockInsert).toHaveBeenCalledWith({
        title: "Workshop",
        description: "<p>A workshop</p>",
        cover_image: "https://example.com/img.jpg",
        event_date: "2026-04-01",
        location: "Taipei City Hall",
        registration_url: "https://example.com/register",
        status: "published",
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/events");
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(redirect).toHaveBeenCalledWith("/admin/events");
    });

    it("sets registration_url to null when empty", async () => {
      const fd = makeFormData({
        title: "Meetup",
        description: "<p>Meetup</p>",
        cover_image: "",
        event_date: "2026-05-01",
        location: "Online",
        registration_url: "",
        status: "draft",
      });

      await createEvent(fd);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          registration_url: null,
          cover_image: null,
        })
      );
    });

    it("throws on Supabase error", async () => {
      mockInsert.mockResolvedValue({ error: { message: "insert failed" } });

      const fd = makeFormData({
        title: "Fail",
        description: "",
        cover_image: "",
        event_date: "2026-01-01",
        location: "",
        registration_url: "",
        status: "draft",
      });

      await expect(createEvent(fd)).rejects.toThrow("insert failed");
    });
  });

  describe("updateEvent", () => {
    it("updates all fields correctly", async () => {
      const fd = makeFormData({
        title: "Updated Workshop",
        description: "<p>Updated</p>",
        cover_image: "https://example.com/new.jpg",
        event_date: "2026-06-01",
        location: "Kaohsiung",
        registration_url: "https://example.com/new-register",
        status: "published",
      });

      await updateEvent("event-123", fd);

      expect(mockFrom).toHaveBeenCalledWith("events");
      expect(mockUpdate).toHaveBeenCalledWith({
        title: "Updated Workshop",
        description: "<p>Updated</p>",
        cover_image: "https://example.com/new.jpg",
        event_date: "2026-06-01",
        location: "Kaohsiung",
        registration_url: "https://example.com/new-register",
        status: "published",
      });
      expect(mockEq).toHaveBeenCalledWith("id", "event-123");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/events");
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(redirect).toHaveBeenCalledWith("/admin/events");
    });

    it("throws on Supabase error", async () => {
      mockEq.mockResolvedValue({ error: { message: "update failed" } });

      const fd = makeFormData({
        title: "Fail",
        description: "",
        cover_image: "",
        event_date: "2026-01-01",
        location: "",
        registration_url: "",
        status: "draft",
      });

      await expect(updateEvent("event-123", fd)).rejects.toThrow("update failed");
    });
  });

  describe("deleteEvent", () => {
    it("deletes by id and calls revalidatePath", async () => {
      await deleteEvent("event-456");

      expect(mockFrom).toHaveBeenCalledWith("events");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "event-456");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/events");
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("does not redirect after delete", async () => {
      await deleteEvent("event-456");
      expect(redirect).not.toHaveBeenCalled();
    });

    it("throws on Supabase error", async () => {
      mockEq.mockResolvedValue({ error: { message: "delete failed" } });

      await expect(deleteEvent("event-789")).rejects.toThrow("delete failed");
    });
  });
});
