import { test, expect } from "@playwright/test";

test.describe("Identity layers (C MVP)", () => {
  test("settings connections requires authentication", async ({ page }) => {
    await page.goto("/settings/connections");
    await expect(page).toHaveURL(/\/login/);
  });

  test("experts page shows identity layer filters", async ({ page }) => {
    const res = await page.goto("/experts");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator(".experts-filter-bar")).toBeVisible();
    await expect(page.getByRole("link", { name: /LinkedIn connected|LinkedIn 連携済み/i })).toBeVisible();
  });

  test("experts linkedin filter query loads", async ({ page }) => {
    const res = await page.goto("/experts?linkedin=1");
    expect(res?.status()).toBe(200);
    await expect(page.locator(".experts-filter-bar")).toBeVisible();
  });

  test("legacy githubLogin profile URL redirects to canonical slug", async ({ page }) => {
    await page.goto("/users/takaya-masatoshi", { waitUntil: "commit" });
    await expect(page).toHaveURL(/\/users\/taketani-masatoshi$/);
  });

  test("founder canonical profile loads", async ({ page }) => {
    const res = await page.goto("/users/taketani-masatoshi");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("founder profile shows technical layer when GitHub login exists", async ({ page }) => {
    await page.goto("/users/taketani-masatoshi");
    await expect(page.locator(".profile-layer-card")).toHaveCount(1);
  });
});

test.describe("Identity API guards", () => {
  test("module role request requires authentication", async ({ request }) => {
    const res = await request.post("/api/module-roles/request", {
      data: { moduleId: "test", role: "CONTRIBUTOR" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.code).toBe("UNAUTHORIZED");
  });

  test("github connect requires authentication", async ({ request }) => {
    const res = await request.post("/api/github/connect", {
      data: { repoUrl: "https://github.com/octocat/Hello-World" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.code).toBe("UNAUTHORIZED");
  });

  test("professional profile delete requires authentication", async ({ request }) => {
    const res = await request.delete("/api/user/professional-profile");
    expect(res.status()).toBe(401);
  });
});
