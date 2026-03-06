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
});
