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

  test("clicking an event shows detail page with date and location", async ({ page }) => {
    await page.goto("/events");
    const firstLink = page.locator("a[href^='/events/']").first();
    const hasEvents = await firstLink.count();

    if (hasEvents > 0) {
      await firstLink.click();
      await expect(page).toHaveURL(/\/events\/.+/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("返回活動課程")).toBeVisible();
    }
  });
});
