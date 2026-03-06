import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("loads with hero section and association name", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "台北市台灣語協會" })
    ).toBeVisible();
    await expect(page.getByText("推廣台灣語言文化教育")).toBeVisible();
  });

  test("has latest news section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "最新消息" })).toBeVisible();
  });

  test("has events section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "活動課程" })).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");

    await nav.getByRole("link", { name: "最新消息" }).click();
    await expect(page).toHaveURL("/news");

    await nav.getByRole("link", { name: "活動課程" }).click();
    await expect(page).toHaveURL("/events");

    await nav.getByRole("link", { name: "關於我們" }).click();
    await expect(page).toHaveURL("/about");

    await nav.getByRole("link", { name: "聯絡我們" }).click();
    await expect(page).toHaveURL("/contact");
  });
});
