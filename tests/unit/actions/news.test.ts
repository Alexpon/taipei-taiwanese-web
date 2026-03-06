import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---

// Mock next/cache and next/navigation
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Chainable Supabase mock
let insertResult: { error: null | { message: string } } = { error: null };
let selectResult: {
  data: { status: string; published_at: string | null } | null;
  error: null | { message: string };
} = { data: null, error: null };
let updateResult: { error: null | { message: string } } = { error: null };
let deleteResult: { error: null | { message: string } } = { error: null };

const mockInsert = vi.fn(() => Promise.resolve(insertResult));
const mockSingle = vi.fn(() => Promise.resolve(selectResult));
const mockSelectEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));
const mockUpdateEq = vi.fn(() => Promise.resolve(updateResult));
const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
const mockDeleteEq = vi.fn(() => Promise.resolve(deleteResult));
const mockDelete = vi.fn(() => ({ eq: mockDeleteEq }));

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  select: mockSelect,
  update: mockUpdate,
  delete: mockDelete,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

// --- Imports (must come after vi.mock) ---
import { createNews, updateNews, deleteNews } from "@/app/admin/(dashboard)/news/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Helpers ---
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

// --- Tests ---

describe("News Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertResult = { error: null };
    selectResult = { data: null, error: null };
    updateResult = { error: null };
    deleteResult = { error: null };
  });

  describe("createNews", () => {
    it("inserts draft with published_at as null", async () => {
      const fd = makeFormData({
        title: "Draft Post",
        content: "<p>content</p>",
        status: "draft",
      });

      await createNews(fd);

      expect(mockFrom).toHaveBeenCalledWith("news");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Draft Post",
          content: "<p>content</p>",
          cover_image: null,
          status: "draft",
          published_at: null,
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/admin/news");
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(redirect).toHaveBeenCalledWith("/admin/news");
    });

    it("inserts published with published_at as ISO string", async () => {
      const fd = makeFormData({
        title: "Published Post",
        content: "<p>content</p>",
        status: "published",
      });

      await createNews(fd);

      const insertArg = mockInsert.mock.calls[0][0];
      expect(insertArg.status).toBe("published");
      expect(insertArg.published_at).toBeTruthy();
      // Verify it's a valid ISO date string
      expect(new Date(insertArg.published_at).toISOString()).toBe(
        insertArg.published_at
      );
    });

    it("includes cover_image when provided", async () => {
      const fd = makeFormData({
        title: "Post",
        content: "content",
        cover_image: "https://example.com/img.jpg",
        status: "draft",
      });

      await createNews(fd);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          cover_image: "https://example.com/img.jpg",
        })
      );
    });

    it("throws when Supabase returns an error", async () => {
      insertResult = { error: { message: "Database error" } };

      const fd = makeFormData({
        title: "Post",
        content: "content",
        status: "draft",
      });

      await expect(createNews(fd)).rejects.toThrow("Database error");
      // redirect should NOT have been called
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("updateNews", () => {
    it("sets published_at when transitioning draft -> published", async () => {
      selectResult = {
        data: { status: "draft", published_at: null },
        error: null,
      };

      const fd = makeFormData({
        title: "Updated",
        content: "content",
        status: "published",
      });

      await updateNews("abc-123", fd);

      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg.status).toBe("published");
      expect(updateArg.published_at).toBeTruthy();
      expect(new Date(updateArg.published_at).toISOString()).toBe(
        updateArg.published_at
      );
      expect(mockUpdateEq).toHaveBeenCalledWith("id", "abc-123");
      expect(redirect).toHaveBeenCalledWith("/admin/news");
    });

    it("clears published_at when transitioning published -> draft", async () => {
      selectResult = {
        data: {
          status: "published",
          published_at: "2025-01-01T00:00:00.000Z",
        },
        error: null,
      };

      const fd = makeFormData({
        title: "Updated",
        content: "content",
        status: "draft",
      });

      await updateNews("abc-123", fd);

      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg.status).toBe("draft");
      expect(updateArg.published_at).toBeNull();
    });

    it("preserves existing published_at when status stays published", async () => {
      const existingDate = "2025-06-15T12:00:00.000Z";
      selectResult = {
        data: { status: "published", published_at: existingDate },
        error: null,
      };

      const fd = makeFormData({
        title: "Updated",
        content: "content",
        status: "published",
      });

      await updateNews("abc-123", fd);

      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg.published_at).toBe(existingDate);
    });

    it("throws when Supabase update returns an error", async () => {
      selectResult = {
        data: { status: "draft", published_at: null },
        error: null,
      };
      updateResult = { error: { message: "Update failed" } };

      const fd = makeFormData({
        title: "Updated",
        content: "content",
        status: "draft",
      });

      await expect(updateNews("abc-123", fd)).rejects.toThrow("Update failed");
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("deleteNews", () => {
    it("deletes by id and revalidates paths", async () => {
      await deleteNews("abc-123");

      expect(mockFrom).toHaveBeenCalledWith("news");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockDeleteEq).toHaveBeenCalledWith("id", "abc-123");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/news");
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("throws when Supabase delete returns an error", async () => {
      deleteResult = { error: { message: "Delete failed" } };

      await expect(deleteNews("abc-123")).rejects.toThrow("Delete failed");
    });
  });
});
