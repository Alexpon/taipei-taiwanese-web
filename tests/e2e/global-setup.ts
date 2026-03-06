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
