import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const AUTH_DIR = path.join(__dirname, ".auth");
const SKIP_MARKER = path.join(AUTH_DIR, "skip-signed-in");

const signedInUnavailable = fs.existsSync(SKIP_MARKER);

test.describe("Signed-in session UI", () => {
  test.skip(signedInUnavailable, "Seed founder user and DATABASE_URL for signed-in E2E");

  test("header hides sign-in and shows my page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /My Page|マイページ/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign in|ログイン/i })).toHaveCount(0);
  });

  test("mypage loads for authenticated founder", async ({ page }) => {
    const res = await page.goto("/mypage");
    expect(res?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/mypage/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("admin dashboard opens for authenticated admin", async ({ page }) => {
    const res = await page.goto("/admin");
    expect(res?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator("h1.page-title")).toBeVisible();
  });

  test("admin committees page opens for authenticated admin", async ({ page }) => {
    const res = await page.goto("/admin/committees");
    expect(res?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/admin\/committees$/);
    await expect(page.locator("h1.page-title")).toBeVisible();
  });

  test("login page has no local-dev setup hints", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/npm run db:seed/i)).toHaveCount(0);
    await expect(page.getByText(/oauthLocalDevHint/i)).toHaveCount(0);
    await expect(page.getByText(/Microsoft/i)).toHaveCount(0);
  });
});
