import { test, expect } from "@playwright/test";

test("login page shows provider actions without dev hints", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByText(/npm run db:seed/i)).toHaveCount(0);
});
