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
});
