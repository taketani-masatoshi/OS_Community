import { prisma } from "@/lib/prisma";
import { CORE_AGENTS } from "@os-community/shared";
import type { ModuleRoleType } from "@os-community/db";

export async function countDistinctModuleRoleHolders(
  role: ModuleRoleType,
  options?: { activeOnly?: boolean }
): Promise<number> {
  const rows = await prisma.moduleRole.groupBy({
    by: ["userId"],
    where: {
      role,
      ...(options?.activeOnly !== false ? { termEnd: null } : {}),
    },
  });
  return rows.length;
}

export async function countRegistryModules(options?: { includeWild?: boolean }): Promise<number> {
  if (options?.includeWild === false) {
    return prisma.module.count({ where: { trustLevel: "COMMUNITY" } });
  }
  return prisma.module.count();
}

export async function countWildModules(): Promise<number> {
  return prisma.module.count({ where: { trustLevel: "WILD" } });
}

/** Distinct people with active OOO / OOD (or other) professional certifications. */
export async function countActiveCertifiedProfessionals(): Promise<number> {
  const now = new Date();
  const rows = await prisma.certification.groupBy({
    by: ["userId"],
    where: {
      status: "APPROVED",
      expiresAt: { gt: now },
      revokedAt: null,
    },
  });
  return rows.length;
}

/** Domain + Standard seats in the governance catalog (includes empty jurisdiction shells). */
export async function countGovernanceCommittees(): Promise<number> {
  return prisma.committee.count({
    where: { type: { in: ["DOMAIN", "STANDARD"] } },
  });
}

/**
 * Governance committees that currently have at least one member —
 * the home-page “active review” signal (excludes empty jurisdiction shells).
 */
export async function countActiveGovernanceCommittees(): Promise<number> {
  const rows = await prisma.committee.findMany({
    where: {
      type: { in: ["DOMAIN", "STANDARD"] },
      members: { some: {} },
    },
    select: { id: true },
  });
  return rows.length;
}

export async function countDomainCommittees(): Promise<number> {
  return prisma.committee.count({ where: { type: "DOMAIN" } });
}

export type CommunityStats = {
  moduleCount: number;
  wildModuleCount: number;
  maintainerCount: number;
  contributorCount: number;
  certCount: number;
  committeeCount: number;
  agentCount: number;
};

export function countCoreAgents(): number {
  return CORE_AGENTS.length;
}

/** Prefer DB agent registry; fall back to shared CORE_AGENTS when table is empty. */
export async function countRegisteredAgents(): Promise<number> {
  const dbCount = await prisma.agent.count();
  return dbCount > 0 ? dbCount : countCoreAgents();
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const [
    moduleCount,
    wildModuleCount,
    maintainerCount,
    contributorCount,
    certCount,
    committeeCount,
    agentCount,
  ] = await Promise.all([
    countRegistryModules({ includeWild: true }),
    countWildModules(),
    countDistinctModuleRoleHolders("MAINTAINER"),
    countDistinctModuleRoleHolders("CONTRIBUTOR"),
    countActiveCertifiedProfessionals(),
    countActiveGovernanceCommittees(),
    countRegisteredAgents(),
  ]);

  return {
    moduleCount,
    wildModuleCount,
    maintainerCount,
    contributorCount,
    certCount,
    committeeCount,
    agentCount,
  };
}
