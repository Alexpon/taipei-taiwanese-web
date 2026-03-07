import { test, expect } from "@playwright/test";

test.describe("Admin Form Validation", () => {
  test("news form prevents submission without title", async ({ page }) => {
    await page.goto("/admin/news/new");
    await expect(page.getByRole("heading", { name: "新增消息" })).toBeVisible();

    // Try to submit without filling title
    await page.getByRole("button", { name: "儲存" }).click();

    // Should still be on the same page (browser validation prevented submit)
    await expect(page).toHaveURL("/admin/news/new");
  });

  test("event form prevents submission without required fields", async ({ page }) => {
    await page.goto("/admin/events/new");
    await expect(page.getByRole("heading", { name: "新增活動" })).toBeVisible();

    // Fill only title, leave date and location empty
    await page.getByLabel("標題").fill("Incomplete Event");

    await page.getByRole("button", { name: "儲存" }).click();

    // Should still be on the same page
    await expect(page).toHaveURL("/admin/events/new");
  });

  test("event form submits when all required fields are filled", async ({ page }) => {
    await page.goto("/admin/events/new");
    const uniqueTitle = "E2E Validation Event " + Date.now();

    await page.getByLabel("標題").fill(uniqueTitle);
    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("Valid content");
    await page.getByLabel("活動日期").fill("2026-12-28");
    await page.getByLabel("地點").fill("Valid Location");

    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/events", { timeout: 10000 });

    // Cleanup
    const row = page.locator("tr", { hasText: uniqueTitle });
    page.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "刪除" }).click();
    await page.waitForTimeout(2000);
  });
});
