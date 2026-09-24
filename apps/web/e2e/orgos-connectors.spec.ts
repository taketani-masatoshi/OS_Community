import { test, expect } from "@playwright/test";

const PROVIDERS = ["slack", "asana", "gdrive"] as const;

const SHIPPED_ENV: Record<(typeof PROVIDERS)[number], string> = {
  slack: "COMMUNITY_SLACK_CONNECT_SHIPPED",
  asana: "COMMUNITY_ASANA_CONNECT_SHIPPED",
  gdrive: "COMMUNITY_GDRIVE_CONNECT_SHIPPED",
};

test.describe("OrgOS connector OAuth API", () => {
  for (const provider of PROVIDERS) {
    test(`${provider} status is 503 when unshipped`, async ({ request }) => {
      test.skip(process.env[SHIPPED_ENV[provider]] === "1", "shipped in this environment");
      const res = await request.get(`/api/integrations/orgos-connectors/${provider}/status`);
      expect(res.status()).toBe(503);
      const body = (await res.json()) as { code?: string };
      expect(body.code).toBe("FEATURE_NOT_SHIPPED");
    });

    test(`${provider} start is 503 when unshipped`, async ({ request }) => {
      test.skip(process.env[SHIPPED_ENV[provider]] === "1", "shipped in this environment");
      const res = await request.get(
        `/api/integrations/orgos-connectors/${provider}/start?tenant_id=mal&nonce=test-nonce`,
      );
      expect(res.status()).toBe(503);
    });

    test(`${provider} callback is 503 when unshipped`, async ({ request }) => {
      test.skip(process.env[SHIPPED_ENV[provider]] === "1", "shipped in this environment");
      const res = await request.get(
        `/api/integrations/orgos-connectors/${provider}/callback?code=x&state=y`,
      );
      expect(res.status()).toBe(503);
    });
  }

  test("unknown provider is 404", async ({ request }) => {
    const res = await request.get("/api/integrations/orgos-connectors/dropbox/status");
    expect(res.status()).toBe(404);
  });
});
