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

/** Domain + Standard governance committees (excludes per-module committees). */
export async function countGovernanceCommittees(): Promise<number> {
  return prisma.committee.count({
    where: { type: { in: ["DOMAIN", "STANDARD"] } },
  });
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

export async function getCommunityStats(): Promise<CommunityStats> {
  const [
    moduleCount,
    wildModuleCount,
    maintainerCount,
    contributorCount,
    certCount,
    committeeCount,
  ] = await Promise.all([
    countRegistryModules({ includeWild: true }),
    countWildModules(),
    countDistinctModuleRoleHolders("MAINTAINER"),
    countDistinctModuleRoleHolders("CONTRIBUTOR"),
    countActiveCertifiedProfessionals(),
    countGovernanceCommittees(),
  ]);

  return {
    moduleCount,
    wildModuleCount,
    maintainerCount,
    contributorCount,
    certCount,
    committeeCount,
    agentCount: countCoreAgents(),
  };
}
