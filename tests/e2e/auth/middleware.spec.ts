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

    await expect(page.locator(".text-red-600")).toBeVisible({ timeout: 10000 });
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
