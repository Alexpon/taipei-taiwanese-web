import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Auth mock results
let signInResult: {
  error: null | { message: string };
} = { error: null };

const mockSignInWithPassword = vi.fn(() => Promise.resolve(signInResult));
const mockSignOut = vi.fn(() => Promise.resolve());

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
      },
    })
  ),
}));

// --- Imports (must come after vi.mock) ---
import { login, logout } from "@/app/admin/login/actions";
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

describe("Auth Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInResult = { error: null };
  });

  describe("login", () => {
    it("calls signInWithPassword with email and password from formData", async () => {
      const fd = makeFormData({
        email: "user@example.com",
        password: "secret123",
      });

      await login(fd);

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
      });
    });

    it("redirects to /admin on success", async () => {
      const fd = makeFormData({
        email: "user@example.com",
        password: "secret123",
      });

      await login(fd);

      expect(redirect).toHaveBeenCalledWith("/admin");
    });

    it("returns error message on failure and does NOT redirect", async () => {
      signInResult = { error: { message: "Invalid login credentials" } };

      const fd = makeFormData({
        email: "user@example.com",
        password: "wrongpassword",
      });

      const result = await login(fd);

      expect(result).toEqual({ error: "Invalid login credentials" });
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("calls signOut and redirects to /admin/login", async () => {
      await logout();

      expect(mockSignOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/admin/login");
    });
  });
});
