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
