import { test, expect } from "@playwright/test";

test.describe("Admin News CRUD", () => {
  test("news list page loads", async ({ page }) => {
    await page.goto("/admin/news");
    await expect(page.getByRole("heading", { name: "最新消息" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "新增消息" })
    ).toBeVisible();
  });

  test("create a draft news item", async ({ page }) => {
    await page.goto("/admin/news/new");
    await expect(page.getByRole("heading", { name: "新增消息" })).toBeVisible();

    await page.getByLabel("標題").fill("E2E Test News " + Date.now());
    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("This is test content from E2E");

    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/news", { timeout: 10000 });
  });

  test("news list shows table", async ({ page }) => {
    await page.goto("/admin/news");
    await expect(page.locator("table")).toBeVisible();
  });

  test("delete news item with confirmation", async ({ page }) => {
    // First create a news item to delete
    await page.goto("/admin/news/new");
    const uniqueTitle = "E2E Delete Test " + Date.now();
    await page.getByLabel("標題").fill(uniqueTitle);
    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("To be deleted");
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/news", { timeout: 10000 });

    // Find the row with our title and click delete
    const row = page.locator("tr", { hasText: uniqueTitle });
    page.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "刪除" }).click();

    // Wait for page to reload and verify item is gone
    await page.waitForTimeout(2000);
    await page.reload();
    await expect(page.getByText(uniqueTitle)).not.toBeVisible();
  });

  test("edit an existing news item", async ({ page }) => {
    // First create a news item
    await page.goto("/admin/news/new");
    const uniqueTitle = "E2E Edit News " + Date.now();
    await page.getByLabel("標題").fill(uniqueTitle);
    const editor = page.locator(".tiptap");
    await editor.click();
    await editor.pressSequentially("Original content");
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/news", { timeout: 10000 });

    // Click edit on the created item
    const row = page.locator("tr", { hasText: uniqueTitle });
    await row.getByRole("link", { name: "編輯" }).click();
    await expect(page.getByRole("heading", { name: "編輯消息" })).toBeVisible();

    // Verify form is populated
    await expect(page.getByLabel("標題")).toHaveValue(uniqueTitle, { timeout: 10000 });

    // Modify the title
    const updatedTitle = "E2E Updated News " + Date.now();
    await page.getByLabel("標題").fill(updatedTitle);
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page).toHaveURL("/admin/news", { timeout: 10000 });

    // Verify updated title appears in list
    await expect(page.getByText(updatedTitle)).toBeVisible();

    // Cleanup: delete the item
    const updatedRow = page.locator("tr", { hasText: updatedTitle });
    page.on("dialog", (dialog) => dialog.accept());
    await updatedRow.getByRole("button", { name: "刪除" }).click();
    await page.waitForTimeout(2000);
  });
});
