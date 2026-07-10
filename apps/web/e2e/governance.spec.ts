import { test, expect } from "@playwright/test";

test.describe("Governance & standards public pages", () => {
  test("governance page loads", async ({ page }) => {
    const res = await page.goto("/governance");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("standards page shows localized lifecycle table", async ({ page }) => {
    const res = await page.goto("/standards");
    expect(res?.status()).toBe(200);
    await expect(page.locator(".lifecycle-pipeline")).toBeVisible();
    await expect(page.locator(".lf-table")).toHaveCount(2);
  });

  test("openness policy page loads", async ({ page }) => {
    const res = await page.goto("/governance/openness");
    expect(res?.status()).toBe(200);
  });

  test("governance page shows localized roles in Japanese", async ({ page, context }) => {
    await context.addCookies([
      { name: "locale", value: "ja", domain: "127.0.0.1", path: "/" },
    ]);
    const res = await page.goto("/governance");
    expect(res?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("コントリビューター");
    await expect(page.locator("body")).toContainText("昇格フロー");
  });
});

test.describe("Admin access control", () => {
  test("non-authenticated user is redirected from admin users", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/(login)?/);
  });

  test("admin audit export requires authentication", async ({ request }) => {
    const res = await request.get("/api/admin/audit/role-changes?format=csv");
    expect(res.status()).toBe(401);
  });
});
