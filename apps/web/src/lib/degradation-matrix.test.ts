/**
 * R3 dependency degradation contract matrix (requirements §R3).
 *
 * | Dependency      | API expectation              | Page expectation                    |
 * |-----------------|------------------------------|-------------------------------------|
 * | DB down         | 503 + DATABASE_UNAVAILABLE   | login shows DB unavailable message  |
 * | Academy down    | 503 SERVICE_UNAVAILABLE      | BFF routes return structured error  |
 * | Auth misconfig  | health 503 (no AUTH_SECRET)  | login shows providers not configured|
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AcademyConfigError } from "@/lib/academy/server-client";

vi.mock("@/lib/api-error", () => ({
  apiErrorResponse: vi.fn(async (code: string, status: number) =>
    Response.json({ code }, { status }),
  ),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAuthApi } from "@/lib/session";
import { academyUnavailableResponse } from "@/lib/academy/bff-error";
import { isPrimaryLoginConfigured } from "@/lib/auth-env";
import { isDatabaseAvailable } from "@/lib/db-health";

describe("R3 degradation matrix", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(prisma.$queryRaw).mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllEnvs();
  });

  it("DB down → authenticated API returns 503 DATABASE_UNAVAILABLE", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", githubLogin: "alice", siteRole: "MEMBER" },
    } as Awaited<ReturnType<typeof auth>>);
    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error("Can't reach database server at localhost:5432"),
    );

    const result = await requireAuthApi();
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(503);
      expect((await result.error.json()).code).toBe("DATABASE_UNAVAILABLE");
    }
  });

  it("DB down → isDatabaseAvailable returns false for login page gate", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(
      new Error("Can't reach database server at localhost:5432"),
    );
    await expect(isDatabaseAvailable()).resolves.toBe(false);
  });

  it("Academy down → BFF maps config error to 503 SERVICE_UNAVAILABLE", async () => {
    const res = await academyUnavailableResponse(new AcademyConfigError("missing url"));
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe("SERVICE_UNAVAILABLE");
  });

  it("Academy not configured → progress layer reports unconfigured", async () => {
    vi.stubEnv("ACADEMY_API_URL", "");
    const { isAcademyConfigured } = await import("@/lib/academy/progress-academy");
    expect(isAcademyConfigured()).toBe(false);
  });

  it("Auth misconfig → primary login providers not configured", () => {
    process.env = {
      ...originalEnv,
      AUTH_GOOGLE_ID: "",
      AUTH_GOOGLE_SECRET: "",
      AUTH_GITHUB_ID: "",
      AUTH_GITHUB_SECRET: "",
      AUTH_LINKEDIN_ID: "",
      AUTH_LINKEDIN_SECRET: "",
    };
    expect(isPrimaryLoginConfigured()).toBe(false);
  });

  it("Auth misconfig → at least one provider enables primary login", () => {
    process.env = {
      ...originalEnv,
      AUTH_GOOGLE_ID: "id",
      AUTH_GOOGLE_SECRET: "secret",
      AUTH_GITHUB_ID: "",
      AUTH_GITHUB_SECRET: "",
    };
    expect(isPrimaryLoginConfigured()).toBe(true);
  });
});
