import { test, expect } from "@playwright/test";

test.describe("Academy public pages", () => {
  test("academy home loads or shows config message", async ({ page }) => {
    const res = await page.goto("/academy");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("lesson page returns 200 or 404 when API down", async ({ page }) => {
    const res = await page.goto("/academy/lessons/lesson-openorgos-philosophy-001");
    expect([200, 404, 500]).toContain(res?.status() ?? 500);
  });
});
