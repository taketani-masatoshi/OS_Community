import { describe, it, expect, vi, beforeEach } from "vitest";
import { isPrismaConnectionError, checkDatabaseHealth } from "@/lib/db-health";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

describe("db-health", () => {
  beforeEach(() => {
    vi.mocked(prisma.$queryRaw).mockReset();
  });

  it("detects Prisma connection errors", () => {
    expect(isPrismaConnectionError(new Error("Can't reach database server at localhost:5432"))).toBe(
      true,
    );
    expect(isPrismaConnectionError(new Error("Connection refused"))).toBe(true);
    expect(isPrismaConnectionError(new Error("validation failed"))).toBe(false);
  });

  it("checkDatabaseHealth returns ok on successful query", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const result = await checkDatabaseHealth();
    expect(result.ok).toBe(true);
    expect(result.latencyMs).toBeTypeOf("number");
  });

  it("checkDatabaseHealth returns unreachable on connection error", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(
      new Error("Can't reach database server at localhost:5432"),
    );

    const result = await checkDatabaseHealth();
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Can't reach database server");
  });
});
