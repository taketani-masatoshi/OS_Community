import { test, expect } from "@playwright/test";

test.describe("Wire node governance pages", () => {
  test("apply page does not 500", async ({ page }) => {
    const res = await page.goto("/protocol/wire-node/apply");
    expect(res?.status() ?? 0).toBeLessThan(500);
  });

  test("review page does not 500", async ({ page }) => {
    const res = await page.goto("/protocol/wire-node/review");
    expect(res?.status() ?? 0).toBeLessThan(500);
  });
});
