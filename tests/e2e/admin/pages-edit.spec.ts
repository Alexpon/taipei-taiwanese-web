import { test, expect } from "@playwright/test";

test.describe("Admin Pages Edit", () => {
  test("pages list shows seeded pages", async ({ page }) => {
    await page.goto("/admin/pages");
    await expect(page.getByText("about")).toBeVisible();
    await expect(page.getByText("contact")).toBeVisible();
  });

  test("edit about page and see success message", async ({ page }) => {
    await page.goto("/admin/pages/about/edit");
    await expect(page.getByRole("heading", { name: "編輯頁面" })).toBeVisible();

    await expect(page.getByLabel("頁面標題")).not.toHaveValue("", {
      timeout: 10000,
    });

    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page.getByText("儲存成功！")).toBeVisible({ timeout: 10000 });
  });
});
