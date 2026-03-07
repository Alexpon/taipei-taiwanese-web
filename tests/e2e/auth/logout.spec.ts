import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "admin123";

test.describe("Admin Logout", () => {
  test("logout button redirects to login page", async ({ page }) => {
    // Login first (this test runs without stored auth to avoid invalidating shared session)
    await page.goto("/admin/login");
    await page.getByLabel("電子郵件").fill(ADMIN_EMAIL);
    await page.getByLabel("密碼").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "登入" }).click();
    await expect(page).toHaveURL("/admin", { timeout: 10000 });

    // Now test logout
    await page.getByRole("button", { name: "登出" }).click();

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page.getByText("管理員登入")).toBeVisible();
  });
});
