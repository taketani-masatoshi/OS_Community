import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    moduleRole: { groupBy: vi.fn() },
    module: { count: vi.fn() },
    certification: { groupBy: vi.fn() },
    committee: { count: vi.fn(), findMany: vi.fn() },
    agent: { count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  countActiveCertifiedProfessionals,
  countActiveGovernanceCommittees,
  countDistinctModuleRoleHolders,
  countGovernanceCommittees,
  countRegisteredAgents,
  countRegistryModules,
  getCommunityStats,
} from "./community-stats";

describe("community-stats", () => {
  beforeEach(() => {
    vi.mocked(prisma.moduleRole.groupBy).mockReset();
    vi.mocked(prisma.module.count).mockReset();
    vi.mocked(prisma.certification.groupBy).mockReset();
    vi.mocked(prisma.committee.count).mockReset();
    vi.mocked(prisma.committee.findMany).mockReset();
    vi.mocked(prisma.agent.count).mockReset();
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
    vi.mocked(prisma.committee.count).mockResolvedValue(47);
    await expect(countGovernanceCommittees()).resolves.toBe(47);
    expect(prisma.committee.count).toHaveBeenCalledWith({
      where: { type: { in: ["DOMAIN", "STANDARD"] } },
    });
  });

  it("counts active governance committees with members", async () => {
    vi.mocked(prisma.committee.findMany).mockResolvedValue([
      { id: "c1" },
      { id: "c2" },
      { id: "c3" },
      { id: "c4" },
    ] as never);
    await expect(countActiveGovernanceCommittees()).resolves.toBe(4);
    expect(prisma.committee.findMany).toHaveBeenCalledWith({
      where: {
        type: { in: ["DOMAIN", "STANDARD"] },
        members: { some: {} },
      },
      select: { id: true },
    });
  });

  it("prefers DB agent registry when populated", async () => {
    vi.mocked(prisma.agent.count).mockResolvedValue(6);
    await expect(countRegisteredAgents()).resolves.toBe(6);
  });

  it("falls back to CORE_AGENTS when agent table is empty", async () => {
    vi.mocked(prisma.agent.count).mockResolvedValue(0);
    await expect(countRegisteredAgents()).resolves.toBe(6);
  });

  it("aggregates community stats", async () => {
    vi.mocked(prisma.module.count)
      .mockResolvedValueOnce(26)
      .mockResolvedValueOnce(1);
    vi.mocked(prisma.moduleRole.groupBy)
      .mockResolvedValueOnce([{ userId: "m1" }] as never)
      .mockResolvedValueOnce([{ userId: "c1" }, { userId: "c2" }] as never);
    vi.mocked(prisma.certification.groupBy).mockResolvedValue([{ userId: "p1" }] as never);
    vi.mocked(prisma.committee.findMany).mockResolvedValue([
      { id: "a" },
      { id: "b" },
      { id: "c" },
      { id: "d" },
    ] as never);
    vi.mocked(prisma.agent.count).mockResolvedValue(6);

    const stats = await getCommunityStats();
    expect(stats).toEqual({
      moduleCount: 26,
      wildModuleCount: 1,
      maintainerCount: 1,
      contributorCount: 2,
      certCount: 1,
      committeeCount: 4,
      agentCount: 6,
    });
  });
});
