import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db-health", () => ({
  checkDatabaseHealth: vi.fn(),
}));

vi.mock("@/lib/academy/health", () => ({
  checkAcademyHealth: vi.fn(),
}));

import { checkDatabaseHealth } from "@/lib/db-health";
import { checkAcademyHealth } from "@/lib/academy/health";
import { GET, OPTIONS } from "./route";

function healthRequest(origin?: string) {
  return new Request("http://localhost:3000/api/health", {
    headers: origin ? { Origin: origin } : {},
  });
}

describe("/api/health", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      AUTH_SECRET: "test-secret",
      AUTH_GOOGLE_ID: "test-google-id",
      AUTH_GOOGLE_SECRET: "test-google-secret",
    };
    vi.mocked(checkDatabaseHealth).mockResolvedValue({ ok: true, latencyMs: 2 });
    vi.mocked(checkAcademyHealth).mockResolvedValue({ configured: false, reachable: true });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns ok when database and auth secret are healthy", async () => {
    const res = await GET(healthRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.checks.database).toBe(true);
  });

  it("returns degraded 503 when database is down", async () => {
    vi.mocked(checkDatabaseHealth).mockResolvedValue({
      ok: false,
      latencyMs: 5,
      error: "Can't reach database server",
    });

    const res = await GET(healthRequest());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("degraded");
    expect(body.checks.database).toBe(false);
    expect(body.databaseError).toContain("Can't reach database server");
  });

  it("returns degraded 503 when AUTH_SECRET is missing", async () => {
    delete process.env.AUTH_SECRET;

    const res = await GET(healthRequest());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("degraded");
    expect(body.checks.authSecret).toBe(false);
  });

  it("returns degraded 503 when primary login is not configured", async () => {
    delete process.env.AUTH_GOOGLE_ID;
    delete process.env.AUTH_GOOGLE_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const res = await GET(healthRequest());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("degraded");
    expect(body.checks.primaryLogin).toBe(false);
  });

  it("reports academy unreachable without failing liveness when configured", async () => {
    vi.mocked(checkAcademyHealth).mockResolvedValue({
      configured: true,
      reachable: false,
      latencyMs: 10,
      error: "HTTP 503",
    });

    const res = await GET(healthRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.checks.academyReachable).toBe(false);
    expect(body.academyError).toBe("HTTP 503");
  });

  it("allows CORS from oorgos.org overview site", async () => {
    const res = await GET(healthRequest("https://oorgos.org"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://oorgos.org");
  });

  it("does not emit CORS headers for other origins", async () => {
    const res = await GET(healthRequest("https://example.com"));
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("handles CORS preflight for overview site", async () => {
    const res = await OPTIONS(healthRequest("https://oorgos.org"));
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://oorgos.org");
  });
});
