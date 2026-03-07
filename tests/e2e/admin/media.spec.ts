import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Admin Media", () => {
  test("media page loads", async ({ page }) => {
    await page.goto("/admin/media");
    await expect(page.getByRole("heading", { name: "媒體庫" })).toBeVisible();
    await expect(page.getByRole("button", { name: "上傳圖片" })).toBeVisible();
  });

  test("upload an image file", async ({ page }) => {
    await page.goto("/admin/media");

    const testImagePath = path.join(__dirname, "test-image.png");
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(testImagePath, pngBuffer);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);

    await page.waitForTimeout(3000);
    await page.reload();

    const mediaCards = page.locator('[class*="grid"] > div');
    await expect(mediaCards.first()).toBeVisible({ timeout: 10000 });

    fs.unlinkSync(testImagePath);
  });

  test("delete an uploaded image", async ({ page }) => {
    await page.goto("/admin/media");

    // Upload a test image first
    const testImagePath = path.join(__dirname, "test-delete-image.png");
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(testImagePath, pngBuffer);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(3000);
    await page.reload();

    // Count images before delete
    const cardsBefore = page.locator('[class*="grid"] > div');
    const countBefore = await cardsBefore.count();
    expect(countBefore).toBeGreaterThan(0);

    // Accept the confirm dialog and click delete on first card
    page.on("dialog", (dialog) => dialog.accept());
    await cardsBefore.first().getByRole("button", { name: "刪除" }).click();

    await page.waitForTimeout(2000);
    await page.reload();

    const cardsAfter = page.locator('[class*="grid"] > div');
    const countAfter = await cardsAfter.count();
    expect(countAfter).toBeLessThan(countBefore);

    fs.unlinkSync(testImagePath);
  });

  test("copy URL button shows confirmation alert", async ({ page }) => {
    await page.goto("/admin/media");
    await page.waitForTimeout(2000);

    const cards = page.locator('[class*="grid"] > div');
    const hasCards = await cards.count();

    if (hasCards > 0) {
      page.on("dialog", async (dialog) => {
        expect(dialog.message()).toBe("已複製網址");
        await dialog.accept();
      });

      await cards.first().getByRole("button", { name: "複製網址" }).click();
    }
  });
});
