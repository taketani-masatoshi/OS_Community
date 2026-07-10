import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-error", () => ({
  apiErrorResponse: vi.fn(async (code: string, status: number) =>
    Response.json({ code }, { status })
  ),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireGitHubLoginApi } from "./session";

describe("requireGitHubLoginApi", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await requireGitHubLoginApi();
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(401);
      const body = await result.error.json();
      expect(body.code).toBe("UNAUTHORIZED");
    }
  });

  it("returns 403 when GitHub login is missing from session", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", githubLogin: null, siteRole: "MEMBER" },
    } as Awaited<ReturnType<typeof auth>>);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      accountStatus: "ACTIVE",
      deletedAt: null,
      siteRole: "MEMBER",
      profileCompletedAt: null,
      specialty: null,
      region: null,
    });

    const result = await requireGitHubLoginApi();
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(403);
      const body = await result.error.json();
      expect(body.code).toBe("GITHUB_LOGIN_REQUIRED");
    }
  });

  it("returns 503 when database is unavailable", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", githubLogin: "alice", siteRole: "MEMBER" },
    } as Awaited<ReturnType<typeof auth>>);
    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error("Can't reach database server at localhost:5432")
    );

    const { requireAuthApi } = await import("./session");
    const result = await requireAuthApi();
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(503);
      const body = await result.error.json();
      expect(body.code).toBe("DATABASE_UNAVAILABLE");
    }
  });

  it("returns session when GitHub login is present", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", githubLogin: "alice", siteRole: "MEMBER" },
    } as Awaited<ReturnType<typeof auth>>);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      accountStatus: "ACTIVE",
      deletedAt: null,
      siteRole: "MEMBER",
      profileCompletedAt: null,
      specialty: null,
      region: null,
    });

    const result = await requireGitHubLoginApi();
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.session.user.githubLogin).toBe("alice");
    }
  });
});

describe("getAuthSession", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
  });

  it("syncs siteRole from database when JWT is stale", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", siteRole: "MEMBER" },
    } as Awaited<ReturnType<typeof auth>>);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      accountStatus: "ACTIVE",
      deletedAt: null,
      siteRole: "ADMIN",
      profileCompletedAt: new Date("2026-01-01"),
      specialty: "Governance",
      region: "JP",
    });

    const { getAuthSession } = await import("./session");
    const session = await getAuthSession();
    expect(session?.user.siteRole).toBe("ADMIN");
    expect(session?.user.profileComplete).toBe(true);
  });
});
