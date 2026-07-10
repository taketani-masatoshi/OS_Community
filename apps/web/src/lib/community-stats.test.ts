import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    moduleRole: { groupBy: vi.fn() },
    module: { count: vi.fn() },
    certification: { groupBy: vi.fn() },
    committee: { count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  countActiveCertifiedProfessionals,
  countDistinctModuleRoleHolders,
  countGovernanceCommittees,
  countRegistryModules,
  getCommunityStats,
} from "./community-stats";

describe("community-stats", () => {
  beforeEach(() => {
    vi.mocked(prisma.moduleRole.groupBy).mockReset();
    vi.mocked(prisma.module.count).mockReset();
    vi.mocked(prisma.certification.groupBy).mockReset();
    vi.mocked(prisma.committee.count).mockReset();
  });

  it("counts distinct module role holders", async () => {
    vi.mocked(prisma.moduleRole.groupBy).mockResolvedValue([
      { userId: "u1" },
      { userId: "u2" },
    ] as never);

    await expect(countDistinctModuleRoleHolders("CONTRIBUTOR")).resolves.toBe(2);
    expect(prisma.moduleRole.groupBy).toHaveBeenCalledWith({
      by: ["userId"],
      where: { role: "CONTRIBUTOR", termEnd: null },
    });
  });

  it("counts registry modules including wild by default", async () => {
    vi.mocked(prisma.module.count).mockResolvedValue(26);
    await expect(countRegistryModules()).resolves.toBe(26);
    expect(prisma.module.count).toHaveBeenCalledWith();
  });

  it("counts active certified professionals by distinct user", async () => {
    vi.mocked(prisma.certification.groupBy).mockResolvedValue([{ userId: "u1" }] as never);
    await expect(countActiveCertifiedProfessionals()).resolves.toBe(1);
  });

  it("counts governance committees as domain + standard", async () => {
    vi.mocked(prisma.committee.count).mockResolvedValue(7);
    await expect(countGovernanceCommittees()).resolves.toBe(7);
    expect(prisma.committee.count).toHaveBeenCalledWith({
      where: { type: { in: ["DOMAIN", "STANDARD"] } },
    });
  });

  it("aggregates community stats", async () => {
    vi.mocked(prisma.module.count)
      .mockResolvedValueOnce(26)
      .mockResolvedValueOnce(1);
    vi.mocked(prisma.moduleRole.groupBy)
      .mockResolvedValueOnce([{ userId: "m1" }] as never)
      .mockResolvedValueOnce([{ userId: "c1" }] as never);
    vi.mocked(prisma.certification.groupBy).mockResolvedValue([{ userId: "p1" }] as never);
    vi.mocked(prisma.committee.count).mockResolvedValue(7);

    const stats = await getCommunityStats();
    expect(stats).toEqual({
      moduleCount: 26,
      wildModuleCount: 1,
      maintainerCount: 1,
      contributorCount: 1,
      certCount: 1,
      committeeCount: 7,
      agentCount: 6,
    });
  });
});
