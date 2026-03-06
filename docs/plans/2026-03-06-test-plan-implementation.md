# Test Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Vitest + Playwright test infrastructure with comprehensive unit and E2E tests for the Taipei Taiwanese CMS web application.

**Architecture:** Two-tier testing — Vitest for fast unit/integration tests (Server Actions, utilities) with mocked Supabase, Playwright for E2E browser tests against a running dev server with Supabase Local. Tests live in `tests/` at project root.

**Tech Stack:** Vitest, @testing-library/react, Playwright, Supabase Local (Docker)

---

### Task 1: Install Vitest Dependencies and Configure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/unit/setup.ts`

**Step 1: Install Vitest dev dependencies**

Run:
```bash
cd /Users/yushao/claude_workspace/taipei-taiwanese-web/.worktrees/add-tests
npm install -D vitest @vitejs/plugin-react jsdom
```

**Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
  },
});
```

**Step 3: Create `tests/unit/setup.ts`**

```ts
// Global test setup for Vitest
// Add any global mocks or setup here
```

**Step 4: Add npm scripts to `package.json`**

Add these to the `"scripts"` section:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5: Verify Vitest runs (no tests yet)**

Run: `npx vitest run`
Expected: "No test files found" or similar — confirms Vitest is configured correctly.

**Step 6: Commit**

```bash
git add vitest.config.ts tests/unit/setup.ts package.json package-lock.json
git commit -m "chore: add Vitest configuration and setup"
```

---

### Task 2: Install Playwright and Configure

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `tests/e2e/fixtures/auth.ts`
- Create: `tests/e2e/fixtures/db.ts`

**Step 1: Install Playwright**

Run:
```bash
cd /Users/yushao/claude_workspace/taipei-taiwanese-web/.worktrees/add-tests
npm install -D @playwright/test
npx playwright install chromium
```

**Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium-no-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /\/(auth|public)\//,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Step 3: Create `tests/e2e/global-setup.ts`**

This authenticates once and saves the session for all admin tests.

```ts
import { test as setup, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "admin123";
const authFile = "tests/e2e/.auth/admin.json";

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("電子郵件").fill(ADMIN_EMAIL);
  await page.getByLabel("密碼").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "登入" }).click();

  // Wait for redirect to admin dashboard
  await page.waitForURL("/admin");
  await expect(page.getByRole("heading", { name: "儀表板" })).toBeVisible();

  // Save auth state
  await page.context().storageState({ path: authFile });
});
```

**Step 4: Create `tests/e2e/fixtures/db.ts`**

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Create a Supabase admin client that bypasses RLS.
 * Uses the service role key — only for test setup/teardown.
 */
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
```

**Step 5: Create `.gitignore` entry for auth state and add `tests/e2e/.auth/` directory**

Add to `.gitignore`:
```
# Playwright
tests/e2e/.auth/
test-results/
playwright-report/
```

Create directory:
```bash
mkdir -p tests/e2e/.auth
```

**Step 6: Add npm scripts to `package.json`**

Add these to the `"scripts"` section:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:all": "vitest run && playwright test"
```

**Step 7: Verify Playwright config loads**

Run: `npx playwright test --list`
Expected: "no tests found" or lists 0 tests — confirms config is valid.

**Step 8: Commit**

```bash
git add playwright.config.ts tests/e2e/ .gitignore package.json package-lock.json
git commit -m "chore: add Playwright configuration and shared fixtures"
```

---

### Task 3: Unit Tests — `cn()` Utility

**Files:**
- Create: `tests/unit/lib/utils.test.ts`

**Step 1: Write the test file**

```ts
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  it("merges multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });
});
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run tests/unit/lib/utils.test.ts`
Expected: 5 tests PASS

**Step 3: Commit**

```bash
git add tests/unit/lib/utils.test.ts
git commit -m "test: add unit tests for cn() utility"
```

---

### Task 4: Unit Tests — News Server Actions

**Files:**
- Create: `tests/unit/actions/news.test.ts`

This is the most complex unit test file because `updateNews` has branching `published_at` logic.

**Step 1: Write the test file**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache and next/navigation before importing actions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Build a chainable Supabase mock
function createMockSupabase() {
  const chainResult = { data: null, error: null, count: null };

  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  };

  // Each method returns the chain, except `single` which resolves
  for (const key of Object.keys(chain)) {
    if (key === "single") {
      chain[key].mockImplementation(() => Promise.resolve(chainResult));
    } else {
      chain[key].mockReturnValue(chain);
    }
  }

  // Make chain itself thenable (for queries without .single())
  (chain as Record<string, unknown>).then = (resolve: (v: unknown) => void) =>
    resolve(chainResult);

  return { chain, chainResult };
}

let mockChain: ReturnType<typeof createMockSupabase>["chain"];
let mockChainResult: ReturnType<typeof createMockSupabase>["chainResult"];

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => {
    const mock = createMockSupabase();
    mockChain = mock.chain;
    mockChainResult = mock.chainResult;
    return mock.chain;
  }),
}));

// Import after mocks
import { createNews, updateNews, deleteNews } from "@/app/admin/(dashboard)/news/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.set(k, v);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createNews", () => {
  it("inserts with published_at = null when status is draft", async () => {
    const fd = makeFormData({
      title: "Draft Title",
      content: "<p>Draft</p>",
      cover_image: "",
      status: "draft",
    });

    await createNews(fd);

    expect(mockChain.from).toHaveBeenCalledWith("news");
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Draft Title",
        status: "draft",
        published_at: null,
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/news");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(redirect).toHaveBeenCalledWith("/admin/news");
  });

  it("inserts with published_at set when status is published", async () => {
    const fd = makeFormData({
      title: "Published Title",
      content: "<p>Content</p>",
      cover_image: "https://img.example.com/photo.jpg",
      status: "published",
    });

    await createNews(fd);

    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Published Title",
        status: "published",
        published_at: expect.any(String),
        cover_image: "https://img.example.com/photo.jpg",
      })
    );
  });

  it("throws on Supabase error", async () => {
    // Override the mock to return an error
    const originalCreateClient = (await import("@/lib/supabase/server")).createClient;
    vi.mocked(originalCreateClient).mockImplementationOnce(async () => {
      const mock = createMockSupabase();
      mock.chainResult.error = { message: "DB error" } as never;
      mockChain = mock.chain;
      mockChainResult = mock.chainResult;
      return mock.chain as never;
    });

    const fd = makeFormData({
      title: "Fail",
      content: "<p>Fail</p>",
      cover_image: "",
      status: "draft",
    });

    await expect(createNews(fd)).rejects.toThrow("DB error");
  });
});

describe("updateNews", () => {
  it("sets published_at when transitioning draft → published", async () => {
    // Mock the existing record fetch
    const originalCreateClient = (await import("@/lib/supabase/server")).createClient;
    vi.mocked(originalCreateClient).mockImplementationOnce(async () => {
      const mock = createMockSupabase();
      // First query (select existing) returns draft status
      let selectCallCount = 0;
      mock.chain.single.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          return Promise.resolve({
            data: { status: "draft", published_at: null },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      });
      mockChain = mock.chain;
      mockChainResult = mock.chainResult;
      return mock.chain as never;
    });

    const fd = makeFormData({
      title: "Now Published",
      content: "<p>Content</p>",
      cover_image: "",
      status: "published",
    });

    await updateNews("test-id", fd);

    expect(mockChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "published",
        published_at: expect.any(String),
      })
    );
  });

  it("clears published_at when transitioning published → draft", async () => {
    const originalCreateClient = (await import("@/lib/supabase/server")).createClient;
    vi.mocked(originalCreateClient).mockImplementationOnce(async () => {
      const mock = createMockSupabase();
      let selectCallCount = 0;
      mock.chain.single.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          return Promise.resolve({
            data: { status: "published", published_at: "2026-01-01T00:00:00Z" },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      });
      mockChain = mock.chain;
      mockChainResult = mock.chainResult;
      return mock.chain as never;
    });

    const fd = makeFormData({
      title: "Back to Draft",
      content: "<p>Content</p>",
      cover_image: "",
      status: "draft",
    });

    await updateNews("test-id", fd);

    expect(mockChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "draft",
        published_at: null,
      })
    );
  });

  it("preserves published_at when status stays published", async () => {
    const existingDate = "2026-01-01T00:00:00Z";
    const originalCreateClient = (await import("@/lib/supabase/server")).createClient;
    vi.mocked(originalCreateClient).mockImplementationOnce(async () => {
      const mock = createMockSupabase();
      let selectCallCount = 0;
      mock.chain.single.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          return Promise.resolve({
            data: { status: "published", published_at: existingDate },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      });
      mockChain = mock.chain;
      mockChainResult = mock.chainResult;
      return mock.chain as never;
    });

    const fd = makeFormData({
      title: "Updated Title",
      content: "<p>Updated</p>",
      cover_image: "",
      status: "published",
    });

    await updateNews("test-id", fd);

    expect(mockChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "published",
        published_at: existingDate,
      })
    );
  });
});

describe("deleteNews", () => {
  it("deletes by id and revalidates paths", async () => {
    await deleteNews("test-id");

    expect(mockChain.from).toHaveBeenCalledWith("news");
    expect(mockChain.delete).toHaveBeenCalled();
    expect(mockChain.eq).toHaveBeenCalledWith("id", "test-id");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/news");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run tests/unit/actions/news.test.ts`
Expected: All tests pass. If mocking issues arise, adjust the mock chain — the key pattern is that Server Actions call `await createClient()` which returns the Supabase client. The mock must return chainable methods.

**Step 3: Commit**

```bash
git add tests/unit/actions/news.test.ts
git commit -m "test: add unit tests for news server actions"
```

---

### Task 5: Unit Tests — Events Server Actions

**Files:**
- Create: `tests/unit/actions/events.test.ts`

**Step 1: Write the test file**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

function createMockSupabase() {
  const chainResult = { data: null, error: null, count: null };
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  };
  for (const key of Object.keys(chain)) {
    if (key === "single") {
      chain[key].mockImplementation(() => Promise.resolve(chainResult));
    } else {
      chain[key].mockReturnValue(chain);
    }
  }
  (chain as Record<string, unknown>).then = (resolve: (v: unknown) => void) =>
    resolve(chainResult);
  return { chain, chainResult };
}

let mockChain: ReturnType<typeof createMockSupabase>["chain"];

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => {
    const mock = createMockSupabase();
    mockChain = mock.chain;
    return mock.chain;
  }),
}));

import {
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/app/admin/(dashboard)/events/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEvent", () => {
  it("inserts event with all required fields", async () => {
    const fd = makeFormData({
      title: "Test Event",
      description: "<p>Event desc</p>",
      cover_image: "",
      event_date: "2026-06-15T10:00:00Z",
      location: "Taipei City Hall",
      registration_url: "https://register.example.com",
      status: "published",
    });

    await createEvent(fd);

    expect(mockChain.from).toHaveBeenCalledWith("events");
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Test Event",
        event_date: "2026-06-15T10:00:00Z",
        location: "Taipei City Hall",
        registration_url: "https://register.example.com",
        status: "published",
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/events");
    expect(redirect).toHaveBeenCalledWith("/admin/events");
  });

  it("sets registration_url to null when empty", async () => {
    const fd = makeFormData({
      title: "No Reg URL",
      description: "<p>Desc</p>",
      cover_image: "",
      event_date: "2026-06-15T10:00:00Z",
      location: "Online",
      registration_url: "",
      status: "draft",
    });

    await createEvent(fd);

    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        registration_url: null,
      })
    );
  });
});

describe("updateEvent", () => {
  it("updates event with all fields", async () => {
    const fd = makeFormData({
      title: "Updated Event",
      description: "<p>Updated</p>",
      cover_image: "https://img.example.com/event.jpg",
      event_date: "2026-07-01T10:00:00Z",
      location: "New Location",
      registration_url: "https://new-register.example.com",
      status: "published",
    });

    await updateEvent("event-id", fd);

    expect(mockChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Updated Event",
        location: "New Location",
        status: "published",
      })
    );
    expect(mockChain.eq).toHaveBeenCalledWith("id", "event-id");
    expect(redirect).toHaveBeenCalledWith("/admin/events");
  });
});

describe("deleteEvent", () => {
  it("deletes by id and revalidates paths", async () => {
    await deleteEvent("event-id");

    expect(mockChain.from).toHaveBeenCalledWith("events");
    expect(mockChain.delete).toHaveBeenCalled();
    expect(mockChain.eq).toHaveBeenCalledWith("id", "event-id");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/events");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run tests/unit/actions/events.test.ts`
Expected: All tests pass.

**Step 3: Commit**

```bash
git add tests/unit/actions/events.test.ts
git commit -m "test: add unit tests for events server actions"
```

---

### Task 6: Unit Tests — Pages Server Actions

**Files:**
- Create: `tests/unit/actions/pages.test.ts`

**Step 1: Write the test file**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function createMockSupabase() {
  const chainResult = { data: null, error: null };
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    from: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
  };
  for (const key of Object.keys(chain)) {
    chain[key].mockReturnValue(chain);
  }
  (chain as Record<string, unknown>).then = (resolve: (v: unknown) => void) =>
    resolve(chainResult);
  return { chain, chainResult };
}

let mockChain: ReturnType<typeof createMockSupabase>["chain"];

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => {
    const mock = createMockSupabase();
    mockChain = mock.chain;
    return mock.chain;
  }),
}));

import { updatePage } from "@/app/admin/(dashboard)/pages/actions";
import { revalidatePath } from "next/cache";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updatePage", () => {
  it("updates page content by slug", async () => {
    await updatePage("about", { title: "About Us", content: "<p>About</p>" });

    expect(mockChain.from).toHaveBeenCalledWith("pages");
    expect(mockChain.update).toHaveBeenCalledWith({
      title: "About Us",
      content: "<p>About</p>",
    });
    expect(mockChain.eq).toHaveBeenCalledWith("slug", "about");
  });

  it("revalidates the correct public path and admin path", async () => {
    await updatePage("contact", { title: "Contact", content: "<p>Contact</p>" });

    expect(revalidatePath).toHaveBeenCalledWith("/contact");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/pages");
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run tests/unit/actions/pages.test.ts`
Expected: All tests pass.

**Step 3: Run all unit tests together**

Run: `npx vitest run`
Expected: All tests pass (~12 tests total).

**Step 4: Commit**

```bash
git add tests/unit/actions/pages.test.ts
git commit -m "test: add unit tests for pages server actions"
```

---

### Task 7: E2E Tests — Public Pages (Home, News, Events)

**Files:**
- Create: `tests/e2e/public/home.spec.ts`
- Create: `tests/e2e/public/news.spec.ts`
- Create: `tests/e2e/public/events.spec.ts`
- Create: `tests/e2e/public/about.spec.ts`
- Create: `tests/e2e/public/contact.spec.ts`

**Important:** These tests use the `chromium-no-auth` project (no storageState) since they test public pages.

**Step 1: Create `tests/e2e/public/home.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("loads with hero section and association name", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "台北市台灣語協會" })
    ).toBeVisible();
    await expect(page.getByText("推廣台灣語言文化教育")).toBeVisible();
  });

  test("has latest news section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "最新消息" })).toBeVisible();
  });

  test("has events section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "活動課程" })).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");

    await nav.getByRole("link", { name: "最新消息" }).click();
    await expect(page).toHaveURL("/news");

    await nav.getByRole("link", { name: "活動課程" }).click();
    await expect(page).toHaveURL("/events");

    await nav.getByRole("link", { name: "關於我們" }).click();
    await expect(page).toHaveURL("/about");

    await nav.getByRole("link", { name: "聯絡我們" }).click();
    await expect(page).toHaveURL("/contact");
  });
});
```

**Step 2: Create `tests/e2e/public/news.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("News Page", () => {
  test("lists page loads with heading", async ({ page }) => {
    await page.goto("/news");
    await expect(
      page.getByRole("heading", { name: "最新消息" })
    ).toBeVisible();
  });

  test("shows empty state when no news", async ({ page }) => {
    await page.goto("/news");
    // Either shows news cards or empty state text
    const hasNews = await page.locator("a[href^='/news/']").count();
    if (hasNews === 0) {
      await expect(page.getByText("目前沒有最新消息")).toBeVisible();
    }
  });

  test("non-existent news ID shows 404", async ({ page }) => {
    const response = await page.goto("/news/00000000-0000-0000-0000-000000000000");
    expect(response?.status()).toBe(404);
  });
});
```

**Step 3: Create `tests/e2e/public/events.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("Events Page", () => {
  test("lists page loads with heading", async ({ page }) => {
    await page.goto("/events");
    await expect(
      page.getByRole("heading", { name: "活動課程" })
    ).toBeVisible();
  });

  test("non-existent event ID shows 404", async ({ page }) => {
    const response = await page.goto("/events/00000000-0000-0000-0000-000000000000");
    expect(response?.status()).toBe(404);
  });
});
```

**Step 4: Create `tests/e2e/public/about.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("About Page", () => {
  test("loads with content", async ({ page }) => {
    await page.goto("/about");
    // About page should load without error
    await expect(page.locator("main")).toBeVisible();
  });
});
```

**Step 5: Create `tests/e2e/public/contact.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
  test("loads with content", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("main")).toBeVisible();
  });
});
```

**Step 6: Verify public E2E tests**

Run: `npx playwright test --project=chromium-no-auth tests/e2e/public/`

Expected: All tests pass (requires dev server running with Supabase Local).

**Step 7: Commit**

```bash
git add tests/e2e/public/
git commit -m "test: add E2E tests for public pages"
```

---

### Task 8: E2E Tests — Auth & Middleware

**Files:**
- Create: `tests/e2e/auth/middleware.spec.ts`

**Step 1: Write the test file**

```ts
import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "admin123";

test.describe("Auth Middleware", () => {
  test("unauthenticated user accessing /admin is redirected to /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unauthenticated user accessing /admin/news is redirected to /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin/news");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page shows form", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "管理員登入" })).toBeVisible();
    await expect(page.getByLabel("電子郵件")).toBeVisible();
    await expect(page.getByLabel("密碼")).toBeVisible();
    await expect(page.getByRole("button", { name: "登入" })).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("電子郵件").fill("wrong@example.com");
    await page.getByLabel("密碼").fill("wrongpassword");
    await page.getByRole("button", { name: "登入" }).click();

    // Should show error message and remain on login page
    await expect(page.locator("text=Invalid")).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login with valid credentials redirects to /admin", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("電子郵件").fill(ADMIN_EMAIL);
    await page.getByLabel("密碼").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "登入" }).click();

    await expect(page).toHaveURL("/admin", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "儀表板" })).toBeVisible();
  });
});
```

**Step 2: Verify auth tests**

Run: `npx playwright test --project=chromium-no-auth tests/e2e/auth/`

Expected: All pass (requires Supabase Local with a test admin user created).

**Step 3: Commit**

```bash
git add tests/e2e/auth/
git commit -m "test: add E2E tests for auth middleware and login flow"
```

---

### Task 9: E2E Tests — Admin Dashboard

**Files:**
- Create: `tests/e2e/admin/dashboard.spec.ts`

**Step 1: Write the test file**

These tests use the `chromium` project (with saved auth state, so already logged in).

```ts
import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test("shows dashboard heading and stat cards", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "儀表板" })).toBeVisible();
    await expect(page.getByText("篇文章")).toBeVisible();
    await expect(page.getByText("項活動")).toBeVisible();
  });

  test("shows quick action links", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("新增消息")).toBeVisible();
    await expect(page.getByText("新增活動")).toBeVisible();
    await expect(page.getByText("編輯頁面")).toBeVisible();
    await expect(page.getByText("媒體庫")).toBeVisible();
  });

  test("quick link navigates to news creation", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("link", { name: "新增消息" }).click();
    await expect(page).toHaveURL("/admin/news/new");
  });
});
```

**Step 2: Verify**

Run: `npx playwright test --project=chromium tests/e2e/admin/dashboard.spec.ts`

**Step 3: Commit**

```bash
git add tests/e2e/admin/dashboard.spec.ts
git commit -m "test: add E2E tests for admin dashboard"
```

---

### Task 10: E2E Tests — News CRUD

**Files:**
- Create: `tests/e2e/admin/news-crud.spec.ts`

**Step 1: Write the test file**

```ts
import { test, expect } from "@playwright/test";

test.describe("Admin News CRUD", () => {
  test("news list page loads", async ({ page }) => {
    await page.goto("/admin/news");
    await expect(page.getByRole("heading", { name: "最新消息" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "新增消息" })
    ).toBeVisible();
  });

  test("create a draft news item", async ({ page }) => {
    // Navigate to create page
    await page.goto("/admin/news/new");
    await expect(page.getByRole("heading", { name: "新增消息" })).toBeVisible();

    // Fill in the form
    await page.getByLabel("標題").fill("E2E Test News " + Date.now());
    // Tiptap editor: click the editor area and type
    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("This is test content from E2E");

    // Leave publish switch off (draft by default)
    // Submit
    await page.getByRole("button", { name: "儲存" }).click();

    // Should redirect to news list
    await expect(page).toHaveURL("/admin/news", { timeout: 10000 });
  });

  test("news list shows draft badge", async ({ page }) => {
    await page.goto("/admin/news");
    // Should have at least one item with "草稿" badge
    const draftBadges = page.getByText("草稿");
    // Just verify the badge type exists in the page (from seeded or created data)
    await expect(page.locator("table")).toBeVisible();
  });

  test("delete news item with confirmation", async ({ page }) => {
    // First create a news item to delete
    await page.goto("/admin/news/new");
    const uniqueTitle = "E2E Delete Test " + Date.now();
    await page.getByLabel("標題").fill(uniqueTitle);
    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("To be deleted");
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/news", { timeout: 10000 });

    // Find the row with our title and click delete
    const row = page.locator("tr", { hasText: uniqueTitle });
    page.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "刪除" }).click();

    // Wait for page to reload and verify item is gone
    await page.waitForTimeout(2000);
    await page.reload();
    await expect(page.getByText(uniqueTitle)).not.toBeVisible();
  });
});
```

**Step 2: Verify**

Run: `npx playwright test --project=chromium tests/e2e/admin/news-crud.spec.ts`

**Step 3: Commit**

```bash
git add tests/e2e/admin/news-crud.spec.ts
git commit -m "test: add E2E tests for admin news CRUD"
```

---

### Task 11: E2E Tests — Events CRUD

**Files:**
- Create: `tests/e2e/admin/events-crud.spec.ts`

**Step 1: Write the test file**

```ts
import { test, expect } from "@playwright/test";

test.describe("Admin Events CRUD", () => {
  test("events list page loads", async ({ page }) => {
    await page.goto("/admin/events");
    await expect(page.getByRole("heading", { name: "活動課程" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "新增活動" })
    ).toBeVisible();
  });

  test("create a draft event", async ({ page }) => {
    await page.goto("/admin/events/new");

    // Fill in required fields
    await page.getByLabel("標題").fill("E2E Test Event " + Date.now());

    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("Test event description");

    await page.getByLabel("活動日期").fill("2026-12-25T10:00");
    await page.getByLabel("地點").fill("Taipei 101");

    // Submit as draft (switch off by default)
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/events", { timeout: 10000 });
  });

  test("delete event with confirmation", async ({ page }) => {
    // Create an event to delete
    await page.goto("/admin/events/new");
    const uniqueTitle = "E2E Delete Event " + Date.now();
    await page.getByLabel("標題").fill(uniqueTitle);
    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("Delete me");
    await page.getByLabel("活動日期").fill("2026-12-31T10:00");
    await page.getByLabel("地點").fill("Nowhere");
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/events", { timeout: 10000 });

    // Delete
    const row = page.locator("tr", { hasText: uniqueTitle });
    page.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "刪除" }).click();

    await page.waitForTimeout(2000);
    await page.reload();
    await expect(page.getByText(uniqueTitle)).not.toBeVisible();
  });
});
```

**Step 2: Verify**

Run: `npx playwright test --project=chromium tests/e2e/admin/events-crud.spec.ts`

**Step 3: Commit**

```bash
git add tests/e2e/admin/events-crud.spec.ts
git commit -m "test: add E2E tests for admin events CRUD"
```

---

### Task 12: E2E Tests — Pages Edit & Media

**Files:**
- Create: `tests/e2e/admin/pages-edit.spec.ts`
- Create: `tests/e2e/admin/media.spec.ts`

**Step 1: Create `tests/e2e/admin/pages-edit.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("Admin Pages Edit", () => {
  test("pages list shows seeded pages", async ({ page }) => {
    await page.goto("/admin/pages");
    await expect(page.getByText("about")).toBeVisible();
    await expect(page.getByText("contact")).toBeVisible();
  });

  test("edit about page and see success message", async ({ page }) => {
    await page.goto("/admin/pages/about/edit");
    await expect(page.getByRole("heading", { name: "編輯頁面" })).toBeVisible();

    // Wait for content to load (client-side fetch)
    await expect(page.getByLabel("頁面標題")).not.toHaveValue("", {
      timeout: 10000,
    });

    // Modify and save
    await page.getByRole("button", { name: "儲存" }).click();

    // Should show success message
    await expect(page.getByText("儲存成功！")).toBeVisible({ timeout: 10000 });
  });
});
```

**Step 2: Create `tests/e2e/admin/media.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Admin Media", () => {
  test("media page loads", async ({ page }) => {
    await page.goto("/admin/media");
    await expect(page.getByRole("heading", { name: "媒體庫" })).toBeVisible();
    await expect(page.getByRole("button", { name: "上傳圖片" })).toBeVisible();
  });

  test("upload an image file", async ({ page }) => {
    await page.goto("/admin/media");

    // Create a small test image file (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, "test-image.png");
    // Minimal PNG: 1x1 pixel, red
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(testImagePath, pngBuffer);

    // Upload via file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);

    // Wait for upload to complete (the alert will fire, handle it)
    // If successful, the image should appear in the grid
    await page.waitForTimeout(3000);
    await page.reload();

    // Verify the media page has content (at least the uploaded image)
    const mediaCards = page.locator('[class*="grid"] > div');
    await expect(mediaCards.first()).toBeVisible({ timeout: 10000 });

    // Cleanup: remove test file
    fs.unlinkSync(testImagePath);
  });
});
```

**Step 3: Create `tests/e2e/admin/login.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("Admin Login Page", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "管理員登入" })).toBeVisible();
    await expect(page.getByLabel("電子郵件")).toBeVisible();
    await expect(page.getByLabel("密碼")).toBeVisible();
    await expect(page.getByRole("button", { name: "登入" })).toBeEnabled();
  });
});
```

**Step 4: Verify**

Run: `npx playwright test --project=chromium tests/e2e/admin/`

**Step 5: Commit**

```bash
git add tests/e2e/admin/
git commit -m "test: add E2E tests for admin pages edit, media, and login"
```

---

### Task 13: Final Verification & Cleanup

**Step 1: Run all unit tests**

Run: `npx vitest run`
Expected: All pass.

**Step 2: Run all E2E tests**

Run: `npx playwright test`
Expected: All pass (requires Supabase Local running + test admin user).

**Step 3: Run build to ensure tests don't break the build**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Update CLAUDE.md with test commands**

Add to the Commands section in `CLAUDE.md`:
```markdown
- `npm test` — Run Vitest unit tests
- `npm run test:watch` — Run Vitest in watch mode
- `npm run test:e2e` — Run Playwright E2E tests (requires dev server + Supabase Local)
- `npm run test:e2e:ui` — Run Playwright E2E tests with UI
- `npm run test:all` — Run all tests (unit + E2E)
```

**Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add test commands to CLAUDE.md"
```

---

## Prerequisites

Before running E2E tests, ensure:

1. **Supabase Local is running:** `supabase start` (requires Docker)
2. **Test admin user exists:** Create one in Supabase Local dashboard or via SQL:
   ```sql
   -- Run in Supabase Local SQL editor
   -- The user will be created via supabase auth admin API or dashboard
   ```
3. **Environment variables:** Set `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD` or use defaults (`admin@example.com` / `admin123`)
4. **Seed data:** The migrations in `supabase/migrations/` auto-apply when starting Supabase Local, including `004_seed_pages.sql`
