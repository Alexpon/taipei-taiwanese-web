import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/headers (required by "use server" actions)
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Supabase mock chain
const mockEq = vi.fn();
const mockUpdate = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ update: mockUpdate }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

// Import after mocks
import { updatePage } from "@/app/admin/(dashboard)/pages/actions";
import { revalidatePath } from "next/cache";

describe("pages server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockResolvedValue({ error: null });
  });

  it("updates content by slug", async () => {
    await updatePage("about", {
      title: "About Us",
      content: "<p>About content</p>",
    });

    expect(mockFrom).toHaveBeenCalledWith("pages");
    expect(mockUpdate).toHaveBeenCalledWith({
      title: "About Us",
      content: "<p>About content</p>",
    });
    expect(mockEq).toHaveBeenCalledWith("slug", "about");
  });

  it("revalidates the correct public path based on slug", async () => {
    await updatePage("about", {
      title: "About",
      content: "<p>content</p>",
    });

    expect(revalidatePath).toHaveBeenCalledWith("/about");
  });

  it("revalidates the admin pages path", async () => {
    await updatePage("contact", {
      title: "Contact",
      content: "<p>contact info</p>",
    });

    expect(revalidatePath).toHaveBeenCalledWith("/admin/pages");
  });

  it("throws an error when supabase returns an error", async () => {
    mockEq.mockResolvedValue({
      error: { message: "Row not found" },
    });

    await expect(
      updatePage("nonexistent", {
        title: "Test",
        content: "<p>test</p>",
      })
    ).rejects.toThrow("Row not found");
  });

  it("does not revalidate paths when update fails", async () => {
    mockEq.mockResolvedValue({
      error: { message: "Update failed" },
    });

    await expect(
      updatePage("about", {
        title: "Test",
        content: "<p>test</p>",
      })
    ).rejects.toThrow();

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
