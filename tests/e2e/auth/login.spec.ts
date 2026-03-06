import { test, expect } from "@playwright/test";

test.describe("Admin Login Page", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByText("管理員登入")).toBeVisible();
    await expect(page.getByLabel("電子郵件")).toBeVisible();
    await expect(page.getByLabel("密碼")).toBeVisible();
    await expect(page.getByRole("button", { name: "登入" })).toBeEnabled();
  });
});
