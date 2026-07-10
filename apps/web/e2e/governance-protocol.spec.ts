import { test, expect } from "@playwright/test";

test.describe("Governance protocol (C4-W4)", () => {
  test("SLA API returns policy", async ({ request }) => {
    const res = await request.get("/api/protocol/sla");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.policy?.max_hours).toBeGreaterThan(0);
  });

  test("readiness API returns score", async ({ request }) => {
    const res = await request.get("/api/protocol/readiness");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.score).toBeGreaterThanOrEqual(45);
  });

  test("SLA dashboard page loads", async ({ page }) => {
    await page.goto("/governance/sla");
    await expect(page.getByRole("heading", { name: /Protocol SLA dashboard/i })).toBeVisible();
  });

  test("lifecycle page loads", async ({ page }) => {
    await page.goto("/governance/lifecycle");
    await expect(page.getByRole("heading", { name: /Application lifecycle/i })).toBeVisible();
  });

  test("trusted operators page loads", async ({ page }) => {
    await page.goto("/protocol/trusted-operators");
    await expect(page.getByRole("heading", { name: /Trusted Wire operators/i })).toBeVisible();
  });

  test("jurisdiction registry page loads", async ({ page }) => {
    await page.goto("/protocol/jurisdiction");
    await expect(page.getByRole("heading", { name: /Committee jurisdiction registry/i })).toBeVisible();
  });

  test("jurisdiction API returns nodes", async ({ request }) => {
    const res = await request.get("/api/protocol/jurisdiction");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.nodes)).toBe(true);
  });
});
