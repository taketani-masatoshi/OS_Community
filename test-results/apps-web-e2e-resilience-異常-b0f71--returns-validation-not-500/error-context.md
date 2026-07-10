# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/web/e2e/resilience.spec.ts >> 異常系 — 認証済み abuse >> PATCH profile with empty object returns validation, not 500
- Location: apps/web/e2e/resilience.spec.ts:185:7

# Error details

```
TypeError: apiRequestContext.patch: Invalid URL
```

# Test source

```ts
  88  |         Cookie: "authjs.session-token=invalid.jwt.token",
  89  |       },
  90  |     });
  91  |     expectStable(res);
  92  |     expect([401, 403]).toContain(res.status());
  93  |   });
  94  | });
  95  | 
  96  | test.describe("異常系 — 不正 URL・パス", () => {
  97  |   const weirdPaths = [
  98  |     "/this-path-does-not-exist-404",
  99  |     "/modules/../../etc/passwd",
  100 |     "/modules/' OR 1=1--",
  101 |     `/modules/${"a".repeat(200)}`,
  102 |     "/academy/tracks/INVALID/track/modules/not-real/quiz",
  103 |     "/users/<script>alert(1)</script>",
  104 |     "/admin/users?page=-1",
  105 |     "/admin/users?page=not-a-number",
  106 |     "/admin/users?page=999999",
  107 |     "/api/academy/tracks/%00%00%00",
  108 |     "/content/published/docs/../../../../etc/passwd",
  109 |   ];
  110 | 
  111 |   for (const weirdPath of weirdPaths) {
  112 |     test(`GET ${weirdPath.slice(0, 60)}…`, async ({ page }) => {
  113 |       const res = await page.goto(weirdPath, { waitUntil: "domcontentloaded" });
  114 |       expectStablePageStatus(res?.status());
  115 |     });
  116 |   }
  117 | 
  118 |   test("double-encoded path segments stay stable", async ({ page }) => {
  119 |     const res = await page.goto("/modules/%252e%252e%252fadmin", {
  120 |       waitUntil: "domcontentloaded",
  121 |     });
  122 |     expectStablePageStatus(res?.status());
  123 |   });
  124 | });
  125 | 
  126 | test.describe("異常系 — クエリ・ヘッダ abuse", () => {
  127 |   test("SQL injection in query string", async ({ request }) => {
  128 |     const res = await request.get(
  129 |       "/modules?slug='; DROP TABLE users;--&q=1 OR 1=1",
  130 |     );
  131 |     expectStable(res);
  132 |   });
  133 | 
  134 |   test("extremely long query string", async ({ request }) => {
  135 |     const res = await request.get(`/modules?x=${"y".repeat(8000)}`);
  136 |     expectStable(res);
  137 |   });
  138 | 
  139 |   test("wrong Content-Type with JSON body", async ({ request }) => {
  140 |     const res = await request.post("/api/user/profile", {
  141 |       headers: { "Content-Type": "text/plain" },
  142 |       data: JSON.stringify({ name: "test" }),
  143 |     });
  144 |     expectStable(res);
  145 |   });
  146 | 
  147 |   test("missing Content-Type on JSON POST", async ({ request }) => {
  148 |     const res = await request.post("/api/academy/progress", {
  149 |       data: JSON.stringify({ type: "lesson_completed", lessonId: "x" }),
  150 |     });
  151 |     expectStable(res);
  152 |   });
  153 | });
  154 | 
  155 | test.describe("異常系 — 連続リクエスト後も health が応答", () => {
  156 |   test("20 concurrent health checks", async ({ request }) => {
  157 |     const results = await Promise.all(
  158 |       Array.from({ length: 20 }, () => request.get("/api/health")),
  159 |     );
  160 |     for (const res of results) {
  161 |       expectStable(res);
  162 |     }
  163 |   });
  164 | 
  165 |   test("rapid malformed API burst then health", async ({ request }) => {
  166 |     await Promise.all([
  167 |       request.post("/api/user/profile", { data: "{" }),
  168 |       request.post("/api/academy/progress", { data: "null" }),
  169 |       request.get("/api/admin/users/not-real"),
  170 |       request.get("/modules/../../admin"),
  171 |     ]);
  172 | 
  173 |     const health = await request.get("/api/health");
  174 |     expectStable(health);
  175 |     const body = await health.json();
  176 |     expect(body).toHaveProperty("status");
  177 |   });
  178 | });
  179 | 
  180 | test.describe("異常系 — 認証済み abuse", () => {
  181 |   test.skip(!signedInAvailable, "founder session not available");
  182 | 
  183 |   test.use({ storageState: FOUNDER_STATE });
  184 | 
  185 |   test("PATCH profile with empty object returns validation, not 500", async ({
  186 |     request,
  187 |   }) => {
> 188 |     const res = await request.patch("/api/user/profile", {
      |                               ^ TypeError: apiRequestContext.patch: Invalid URL
  189 |       data: {},
  190 |       headers: { "Content-Type": "application/json" },
  191 |     });
  192 |     expectStable(res);
  193 |   });
  194 | 
  195 |   test("PATCH profile with oversized strings", async ({ request }) => {
  196 |     const res = await request.patch("/api/user/profile", {
  197 |       data: {
  198 |         name: "x".repeat(50_000),
  199 |         specialty: "y".repeat(50_000),
  200 |         region: "z".repeat(50_000),
  201 |       },
  202 |       headers: { "Content-Type": "application/json" },
  203 |     });
  204 |     expectStable(res);
  205 |   });
  206 | 
  207 |   test("PATCH admin user with invalid role", async ({ request }) => {
  208 |     const res = await request.patch("/api/admin/users/nonexistent-user-id", {
  209 |       data: { siteRole: "SUPERADMIN" },
  210 |       headers: { "Content-Type": "application/json" },
  211 |     });
  212 |     expectStable(res);
  213 |     expect([400, 404, 409]).toContain(res.status());
  214 |   });
  215 | 
  216 |   test("POST academy progress with invalid payload", async ({ request }) => {
  217 |     const res = await request.post("/api/academy/progress", {
  218 |       data: { type: "exam_passed", lessonId: "" },
  219 |       headers: { "Content-Type": "application/json" },
  220 |     });
  221 |     expectStable(res);
  222 |     expect(res.status()).toBe(400);
  223 |   });
  224 | 
  225 |   test("GET academy progress without trackId", async ({ request }) => {
  226 |     const res = await request.get("/api/academy/progress");
  227 |     expectStable(res);
  228 |     expect(res.status()).toBe(400);
  229 |   });
  230 | 
  231 |   test("POST exam grade with empty answers", async ({ request }) => {
  232 |     const res = await request.post("/api/academy/exams/grade", {
  233 |       data: {
  234 |         bankId: "",
  235 |         formId: "",
  236 |         trackId: "",
  237 |         answers: [],
  238 |       },
  239 |       headers: { "Content-Type": "application/json" },
  240 |     });
  241 |     expectStable(res);
  242 |     expect(res.status()).toBe(400);
  243 |   });
  244 | 
  245 |   test("authenticated weird pages stay stable", async ({ page }) => {
  246 |     const paths = ["/mypage", "/admin/users?page=abc", "/settings/profile?edit=1"];
  247 |     for (const p of paths) {
  248 |       const res = await page.goto(p, { waitUntil: "domcontentloaded" });
  249 |       expectStablePageStatus(res?.status());
  250 |     }
  251 |   });
  252 | });
  253 | 
```