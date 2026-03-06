import { test, expect } from "@playwright/test";

test.describe("Admin Events CRUD", () => {
  test("events list page loads", async ({ page }) => {
    await page.goto("/admin/events");
    await expect(page.getByRole("heading", { name: "活動課程" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "新增活動" })
    ).toBeVisible();
  });

  test("create a draft event", async ({ page }) => {
    await page.goto("/admin/events/new");

    await page.getByLabel("標題").fill("E2E Test Event " + Date.now());

    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("Test event description");

    await page.getByLabel("活動日期").fill("2026-12-25T10:00");
    await page.getByLabel("地點").fill("Taipei 101");

    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/events", { timeout: 10000 });
  });

  test("delete event with confirmation", async ({ page }) => {
    await page.goto("/admin/events/new");
    const uniqueTitle = "E2E Delete Event " + Date.now();
    await page.getByLabel("標題").fill(uniqueTitle);
    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("Delete me");
    await page.getByLabel("活動日期").fill("2026-12-31T10:00");
    await page.getByLabel("地點").fill("Nowhere");
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/events", { timeout: 10000 });

    const row = page.locator("tr", { hasText: uniqueTitle });
    page.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "刪除" }).click();

    await page.waitForTimeout(2000);
    await page.reload();
    await expect(page.getByText(uniqueTitle)).not.toBeVisible();
  });
});
