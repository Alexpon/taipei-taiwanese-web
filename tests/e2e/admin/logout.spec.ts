import { test, expect } from "@playwright/test";

test.describe("Admin Logout", () => {
  test("logout button redirects to login page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "儀表板" })).toBeVisible();

    await page.getByRole("button", { name: "登出" }).click();

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page.getByText("管理員登入")).toBeVisible();
  });
});
