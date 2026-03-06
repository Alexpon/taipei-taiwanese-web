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
