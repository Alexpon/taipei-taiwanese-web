import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
  test("loads with content", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("main")).toBeVisible();
  });
});
