import fs from "node:fs";
import path from "node:path";
import { test, expect, type APIResponse } from "@playwright/test";

const AUTH_DIR = path.join(__dirname, ".auth");
const FOUNDER_STATE = path.join(AUTH_DIR, "founder.json");
const SKIP_MARKER = path.join(AUTH_DIR, "skip-signed-in");
const signedInAvailable =
  !fs.existsSync(SKIP_MARKER) && fs.existsSync(FOUNDER_STATE);

/** 5xx = 未処理例外。503 は依存サービス不可として許容 */
function expectStable(res: APIResponse) {
  const status = res.status();
  expect(status, `unexpected server error ${status}`).not.toBe(500);
  expect(status).toBeLessThan(600);
}

function expectStablePageStatus(status: number | undefined) {
  expect(status ?? 0, "page returned 500").not.toBe(500);
  expect(status ?? 0).toBeLessThan(600);
}

const MALFORMED_JSON_ENDPOINTS: Array<{
  method: "POST" | "PATCH" | "PUT";
  path: string;
  body?: string;
}> = [
  { method: "POST", path: "/api/user/profile", body: "{broken" },
  { method: "PATCH", path: "/api/user/profile", body: "null" },
  { method: "POST", path: "/api/academy/progress", body: "[]" },
  { method: "POST", path: "/api/academy/exams/grade", body: "{{{{" },
  { method: "POST", path: "/api/wild-modules/register", body: "undefined" },
  { method: "POST", path: "/api/certifications/apply", body: "" },
  { method: "POST", path: "/api/module-roles/request", body: "NaN" },
  { method: "PATCH", path: "/api/admin/users/nonexistent-id", body: "{}" },
  { method: "POST", path: "/api/admin/certifications", body: "{" },
  { method: "POST", path: "/api/admin/bootstrap-founder", body: "not-json" },
  { method: "POST", path: "/api/github/webhook", body: "not-json" },
];

const UNAUTHENTICATED_WRITE_ENDPOINTS = [
  "/api/user/profile",
  "/api/academy/progress",
  "/api/academy/exams/grade",
  "/api/admin/users/fake-user-id",
  "/api/admin/audit/role-changes",
  "/api/wild-modules/register",
  "/api/certifications/apply",
  "/api/github/provision",
];

test.describe("異常系 — 未認証 API がサーバーを落とさない", () => {
  for (const { method, path, body } of MALFORMED_JSON_ENDPOINTS) {
    test(`${method} ${path} with malformed JSON`, async ({ request }) => {
      const res = await request.fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        data: body ?? "{",
      });
      expectStable(res);
    });
  }

  for (const apiPath of UNAUTHENTICATED_WRITE_ENDPOINTS) {
    test(`POST ${apiPath} without session`, async ({ request }) => {
      const res = await request.post(apiPath, {
        data: { probe: true },
        headers: { "Content-Type": "application/json" },
      });
      expectStable(res);
      expect([401, 403, 404, 405, 503]).toContain(res.status());
    });
  }

  test("GET on POST-only academy grade returns stable status", async ({ request }) => {
    const res = await request.get("/api/academy/exams/grade");
    expectStable(res);
    expect([404, 405]).toContain(res.status());
  });

  test("DELETE on profile route returns stable status", async ({ request }) => {
    const res = await request.delete("/api/user/profile");
    expectStable(res);
  });

  test("invalid forged session cookie does not crash server", async ({ request }) => {
    const res = await request.get("/api/user/profile", {
      headers: {
        Cookie: "authjs.session-token=invalid.jwt.token",
      },
    });
    expectStable(res);
    expect([401, 403]).toContain(res.status());
  });
});

test.describe("異常系 — 不正 URL・パス", () => {
  const weirdPaths = [
    "/this-path-does-not-exist-404",
    "/modules/../../etc/passwd",
    "/modules/' OR 1=1--",
    `/modules/${"a".repeat(200)}`,
    "/academy/tracks/INVALID/track/modules/not-real/quiz",
    "/users/<script>alert(1)</script>",
    "/admin/users?page=-1",
    "/admin/users?page=not-a-number",
    "/admin/users?page=999999",
    "/api/academy/tracks/%00%00%00",
    "/content/published/docs/../../../../etc/passwd",
  ];

  for (const weirdPath of weirdPaths) {
    test(`GET ${weirdPath.slice(0, 60)}…`, async ({ page }) => {
      const res = await page.goto(weirdPath, { waitUntil: "domcontentloaded" });
      expectStablePageStatus(res?.status());
    });
  }

  test("double-encoded path segments stay stable", async ({ page }) => {
    const res = await page.goto("/modules/%252e%252e%252fadmin", {
      waitUntil: "domcontentloaded",
    });
    expectStablePageStatus(res?.status());
  });
});

test.describe("異常系 — クエリ・ヘッダ abuse", () => {
  test("SQL injection in query string", async ({ request }) => {
    const res = await request.get(
      "/modules?slug='; DROP TABLE users;--&q=1 OR 1=1",
    );
    expectStable(res);
  });

  test("extremely long query string", async ({ request }) => {
    const res = await request.get(`/modules?x=${"y".repeat(8000)}`);
    expectStable(res);
  });

  test("wrong Content-Type with JSON body", async ({ request }) => {
    const res = await request.post("/api/user/profile", {
      headers: { "Content-Type": "text/plain" },
      data: JSON.stringify({ name: "test" }),
    });
    expectStable(res);
  });

  test("missing Content-Type on JSON POST", async ({ request }) => {
    const res = await request.post("/api/academy/progress", {
      data: JSON.stringify({ type: "lesson_completed", lessonId: "x" }),
    });
    expectStable(res);
  });
});

test.describe("異常系 — 連続リクエスト後も health が応答", () => {
  test("20 concurrent health checks", async ({ request }) => {
    const results = await Promise.all(
      Array.from({ length: 20 }, () => request.get("/api/health")),
    );
    for (const res of results) {
      expectStable(res);
    }
  });

  test("rapid malformed API burst then health", async ({ request }) => {
    await Promise.all([
      request.post("/api/user/profile", { data: "{" }),
      request.post("/api/academy/progress", { data: "null" }),
      request.get("/api/admin/users/not-real"),
      request.get("/modules/../../admin"),
    ]);

    const health = await request.get("/api/health");
    expectStable(health);
    const body = await health.json();
    expect(body).toHaveProperty("status");
  });
});

test.describe("異常系 — 認証済み abuse", () => {
  test.skip(!signedInAvailable, "founder session not available");

  test.use({ storageState: FOUNDER_STATE });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("PATCH profile with empty object returns validation, not 500", async ({
    page,
  }) => {
    const res = await page.request.patch("/api/user/profile", {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expectStable(res);
    expect([400, 401]).toContain(res.status());
  });

  test("PATCH profile with oversized strings", async ({ page }) => {
    const res = await page.request.patch("/api/user/profile", {
      data: {
        name: "x".repeat(50_000),
        specialty: "y".repeat(50_000),
        region: "z".repeat(50_000),
      },
      headers: { "Content-Type": "application/json" },
    });
    expectStable(res);
  });

  test("PATCH admin user with invalid role", async ({ page }) => {
    const res = await page.request.patch("/api/admin/users/nonexistent-user-id", {
      data: { siteRole: "SUPERADMIN" },
      headers: { "Content-Type": "application/json" },
    });
    expectStable(res);
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("POST academy progress with invalid payload", async ({ page }) => {
    const res = await page.request.post("/api/academy/progress", {
      data: { type: "exam_passed", lessonId: "" },
      headers: { "Content-Type": "application/json" },
    });
    expectStable(res);
    expect([400, 401]).toContain(res.status());
  });

  test("GET academy progress without trackId", async ({ page }) => {
    const res = await page.request.get("/api/academy/progress");
    expectStable(res);
    expect([400, 401]).toContain(res.status());
  });

  test("POST exam grade with empty answers", async ({ page }) => {
    const res = await page.request.post("/api/academy/exams/grade", {
      data: {
        bankId: "",
        formId: "",
        trackId: "",
        answers: [],
      },
      headers: { "Content-Type": "application/json" },
    });
    expectStable(res);
    expect([400, 401, 503]).toContain(res.status());
  });

  test("authenticated weird pages stay stable", async ({ page }) => {
    const paths = ["/mypage", "/admin/users?page=abc", "/settings/profile?edit=1"];
    for (const p of paths) {
      const res = await page.goto(p, { waitUntil: "domcontentloaded" });
      expectStablePageStatus(res?.status());
    }
  });
});
