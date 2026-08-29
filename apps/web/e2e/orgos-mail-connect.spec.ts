import { test, expect } from "@playwright/test";

test.describe("OrgOS tenant-mail connect API", () => {
  test("status is 503 when COMMUNITY_TENANT_MAIL_CONNECT_SHIPPED is off", async ({
    request,
  }) => {
    const res = await request.get("/api/integrations/orgos-mail/status");
    expect(res.status()).toBe(503);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("FEATURE_NOT_SHIPPED");
  });

  test("start is 503 when unshipped", async ({ request }) => {
    const res = await request.get(
      "/api/integrations/orgos-mail/start?tenant_id=mal&nonce=test-nonce",
    );
    expect(res.status()).toBe(503);
  });

  test("callback is 503 when unshipped", async ({ request }) => {
    const res = await request.get("/api/integrations/orgos-mail/callback?code=x&state=y");
    expect(res.status()).toBe(503);
  });
});

test.describe("OrgOS tenant-mail connect API (shipped opt-in)", () => {
  test("status is not FEATURE_NOT_SHIPPED when SHIPPED=1", async ({ request }) => {
    test.skip(
      process.env.COMMUNITY_TENANT_MAIL_CONNECT_SHIPPED !== "1",
      "CEO Wave 2 — do not set SHIPPED in default CI",
    );
    const res = await request.get("/api/integrations/orgos-mail/status");
    expect(res.status()).not.toBe(503);
  });
});
