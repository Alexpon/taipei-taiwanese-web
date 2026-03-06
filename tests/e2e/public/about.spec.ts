import { test, expect } from "@playwright/test";

test.describe("About Page", () => {
  test("loads with content", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("main")).toBeVisible();
  });
});
