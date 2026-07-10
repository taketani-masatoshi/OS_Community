import type { Prisma } from "@os-community/db";
import { prisma } from "@/lib/prisma";
import type { CommitteeMemberRole, ModuleRoleType } from "@os-community/db";
import type { Locale } from "@os-community/shared";
import {
  STANDARD_COMMITTEE_SLUG,
  moduleCommitteeSlug,
  STANDARD_COMMITTEE_DESCRIPTION,
  MODULE_COMMITTEE_DESCRIPTION,
  DOMAIN_COMMITTEE_DESCRIPTION,
  getModuleCommitteeName,
  getStandardCommitteeName,
  getDomainCommitteeName,
  getDomainCommitteeDomainLabel,
  COMMITTEE_TYPE_LABELS,
  COMMITTEE_MEMBER_ROLE_LABELS,
  resolveMessagesLocale,
  getDomainCommitteeDefinition,
  buildGovernanceCommitteeDefinitions,
  GOVERNANCE_JURISDICTIONS,
  GOVERNANCE_EXPERT_DOMAINS,
  getGovernanceJurisdictionLabel,
  getGovernanceExpertDomainLabel,
  resolveDomainCommitteeSlugsForModule,
} from "@os-community/shared";
import type { Committee, Module } from "@os-community/db";

type DbClient = Prisma.TransactionClient | typeof prisma;

const MEMBER_ROLE_ORDER: Record<CommitteeMemberRole, number> = {
  CHAIR: 0,
  REVIEWER: 1,
  MEMBER: 2,
  OBSERVER: 3,
};

export function sortCommitteeMembers<T extends { role: CommitteeMemberRole; createdAt: Date }>(
  members: T[],
): T[] {
  return [...members].sort((a, b) => {
    const roleDiff = MEMBER_ROLE_ORDER[a.role] - MEMBER_ROLE_ORDER[b.role];
    if (roleDiff !== 0) return roleDiff;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

function db(client?: DbClient): DbClient {
  return client ?? prisma;
}

export async function ensureStandardCommittee(client?: DbClient) {
  const d = db(client);
  return d.committee.upsert({
    where: { slug: STANDARD_COMMITTEE_SLUG },
    create: {
      slug: STANDARD_COMMITTEE_SLUG,
      name: getStandardCommitteeName("en"),
      type: "STANDARD",
      description: STANDARD_COMMITTEE_DESCRIPTION.en,
    },
    update: {},
  });
}

export async function ensureModuleCommittee(
  moduleId: string,
  moduleName: string,
  moduleSlug: string,
  client?: DbClient
) {
  const d = db(client);
  return d.committee.upsert({
    where: { slug: moduleCommitteeSlug(moduleSlug) },
    create: {
      slug: moduleCommitteeSlug(moduleSlug),
      name: getModuleCommitteeName(moduleName, "en"),
      type: "MODULE",
      moduleId,
      description: MODULE_COMMITTEE_DESCRIPTION.en,
    },
    update: {
      name: getModuleCommitteeName(moduleName, "en"),
    },
  });
}

export async function ensureDomainCommittees(client?: DbClient) {
  const d = db(client);
  for (const def of buildGovernanceCommitteeDefinitions()) {
    await d.committee.upsert({
      where: { slug: def.id },
      create: {
        slug: def.id,
        domainKey: def.id,
        jurisdictionCode: def.jurisdictionCode,
        expertDomainKey: def.expertDomainKey,
        name: def.name.en,
        type: "DOMAIN",
        description: DOMAIN_COMMITTEE_DESCRIPTION.en,
      },
      update: {
        name: def.name.en,
        domainKey: def.id,
        jurisdictionCode: def.jurisdictionCode,
        expertDomainKey: def.expertDomainKey,
      },
    });
  }
}

export async function syncModuleDomainAssignments(client?: DbClient) {
  const d = db(client);
  await ensureDomainCommittees(client);

  const modules = await d.module.findMany({
    select: { id: true, slug: true, jurisdictionCode: true },
  });
  for (const mod of modules) {
    const slugs = resolveDomainCommitteeSlugsForModule(mod);
    for (const slug of slugs) {
      const committee = await d.committee.findUnique({ where: { slug } });
      if (!committee) continue;
      await d.moduleDomainCommittee.upsert({
        where: {
          moduleId_committeeId: { moduleId: mod.id, committeeId: committee.id },
        },
        create: { moduleId: mod.id, committeeId: committee.id },
        update: {},
      });
    }
  }
}

export async function syncAllModuleCommittees() {
  await ensureStandardCommittee();
  await ensureDomainCommittees();
  const modules = await prisma.module.findMany({ select: { id: true, slug: true, name: true } });
  for (const mod of modules) {
    await ensureModuleCommittee(mod.id, mod.name, mod.slug);
  }
  await syncModuleDomainAssignments();
}

function moduleRoleToCommitteeRole(role: ModuleRoleType): CommitteeMemberRole | null {
  if (role === "MAINTAINER") return "CHAIR";
  if (role === "DEPUTY") return "REVIEWER";
  if (role === "CONTRIBUTOR") return "MEMBER";
  return null;
}

/** ModuleRole 承認時にモジュール委員会メンバーシップを同期 */
export async function syncCommitteeMembershipForModuleRole(
  userId: string,
  moduleId: string,
  role: ModuleRoleType,
  client?: DbClient
) {
  const d = db(client);
  const committeeRole = moduleRoleToCommitteeRole(role);
  if (!committeeRole) return;

  let committee = await d.committee.findUnique({ where: { moduleId } });
  if (!committee) {
    const mod = await d.module.findUnique({ where: { id: moduleId } });
    if (!mod) return;
    committee = await ensureModuleCommittee(mod.id, mod.name, mod.slug, client);
  }

  if (committeeRole === "CHAIR") {
    const existingChair = await d.committeeMember.findFirst({
      where: { committeeId: committee.id, role: "CHAIR", userId: { not: userId } },
    });
    const roleToAssign: CommitteeMemberRole = existingChair ? "MEMBER" : "CHAIR";
    await d.committeeMember.upsert({
      where: { committeeId_userId: { committeeId: committee.id, userId } },
      create: { committeeId: committee.id, userId, role: roleToAssign },
      update: { role: roleToAssign },
    });
    return;
  }

  await d.committeeMember.upsert({
    where: { committeeId_userId: { committeeId: committee.id, userId } },
    create: { committeeId: committee.id, userId, role: committeeRole },
    update: { role: committeeRole },
  });

  await syncDomainCommitteeObserverForModuleRole(userId, moduleId, role, client);
}

/** 管轄モジュールで CONTRIBUTOR 承認時、関連ドメイン委員会へ OBSERVER を付与 */
export async function syncDomainCommitteeObserverForModuleRole(
  userId: string,
  moduleId: string,
  role: ModuleRoleType,
  client?: DbClient,
) {
  if (role !== "CONTRIBUTOR") return;

  const d = db(client);
  const links = await d.moduleDomainCommittee.findMany({
    where: { moduleId },
    select: { committeeId: true },
  });

  for (const link of links) {
    const existing = await d.committeeMember.findUnique({
      where: { committeeId_userId: { committeeId: link.committeeId, userId } },
      select: { role: true },
    });
    if (existing) continue;

    await d.committeeMember.create({
      data: { committeeId: link.committeeId, userId, role: "OBSERVER" },
    });
  }
}

export async function getCommitteeBySlug(slug: string) {
  const committee = await prisma.committee.findUnique({
    where: { slug },
    include: {
      module: { select: { slug: true, name: true, githubRepo: true } },
      governedModules: {
        include: { module: { select: { slug: true, name: true, trustLevel: true } } },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              githubLogin: true,
              image: true,
              publicSlug: true,
              specialty: true,
              region: true,
            },
          },
        },
      },
    },
  });

  if (!committee) return null;
  return { ...committee, members: sortCommitteeMembers(committee.members) };
}

export async function getRelatedModuleCommitteesForDomain(committeeId: string) {
  const links = await prisma.moduleDomainCommittee.findMany({
    where: { committeeId },
    include: {
      module: { select: { id: true, slug: true, name: true } },
    },
  });
  if (links.length === 0) return [];

  const moduleIds = links.map((l) => l.module.id);
  const moduleCommittees = await prisma.committee.findMany({
    where: { type: "MODULE", moduleId: { in: moduleIds } },
    include: { module: { select: { slug: true, name: true } } },
    orderBy: { slug: "asc" },
  });

  return moduleCommittees.map((c) => ({
    committeeSlug: c.slug,
    moduleSlug: c.module!.slug,
    moduleName: c.module!.name,
  }));
}

export async function getAllCommitteesGrouped() {
  const committees = await prisma.committee.findMany({
    include: {
      module: { select: { slug: true, name: true } },
      _count: { select: { members: true, governedModules: true } },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return {
    standard: committees.filter((c) => c.type === "STANDARD"),
    domain: committees.filter((c) => c.type === "DOMAIN"),
    module: committees.filter((c) => c.type === "MODULE"),
  };
}

export async function getDomainCommitteesForHome(limit = 4) {
  return prisma.committee.findMany({
    where: { type: "DOMAIN" },
    include: { _count: { select: { members: true, governedModules: true } } },
    orderBy: { slug: "asc" },
    take: limit,
  });
}

export async function getUserMemberships(userId: string) {
  return prisma.committeeMember.findMany({
    where: { userId, termEnd: null },
    include: {
      committee: {
        include: {
          module: { select: { slug: true, name: true, githubRepo: true } },
        },
      },
    },
    orderBy: [{ committee: { type: "asc" } }, { createdAt: "asc" }],
  });
}

export async function getUserDashboardData(userId: string) {
  const [memberships, moduleRoles, githubConnections] = await Promise.all([
    getUserMemberships(userId),
    prisma.moduleRole.findMany({
      where: { userId, termEnd: null },
      include: {
        module: { select: { slug: true, name: true, githubRepo: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.gitHubConnection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { memberships, moduleRoles, githubConnections };
}

export function getCommitteeGovernanceLabels(
  committee: Pick<Committee, "type" | "jurisdictionCode" | "expertDomainKey" | "domainKey">,
  locale: Locale
): { jurisdiction: string | null; expertDomain: string | null } {
  if (committee.type !== "DOMAIN") {
    return { jurisdiction: null, expertDomain: null };
  }
  const jurisdiction = committee.jurisdictionCode
    ? getGovernanceJurisdictionLabel(committee.jurisdictionCode, locale)
    : null;
  const expertDomain = committee.expertDomainKey
    ? getGovernanceExpertDomainLabel(committee.expertDomainKey, locale)
    : committee.domainKey
      ? getDomainCommitteeDomainLabel(
          committee.domainKey as Parameters<typeof getDomainCommitteeDomainLabel>[0],
          locale
        )
      : null;
  return { jurisdiction, expertDomain };
}

export async function getCommitteeGovernanceMatrix() {
  const committees = await prisma.committee.findMany({
    where: { type: "DOMAIN" },
    include: {
      members: {
        where: { role: "CHAIR", termEnd: null },
        include: {
          user: {
            select: { id: true, name: true, githubLogin: true, publicSlug: true },
          },
        },
        take: 1,
      },
      _count: { select: { members: true, governedModules: true } },
    },
    orderBy: [{ jurisdictionCode: "asc" }, { expertDomainKey: "asc" }],
  });

  return {
    jurisdictions: GOVERNANCE_JURISDICTIONS,
    expertDomains: GOVERNANCE_EXPERT_DOMAINS,
    cells: committees,
  };
}

export function getActiveCommitteeChair(
  members: Array<{
    role: CommitteeMemberRole;
    termEnd: Date | null;
    termStart: Date;
    user: { id: string; name: string | null; githubLogin: string | null; publicSlug: string | null };
  }>
) {
  return members.find((member) => member.role === "CHAIR" && !member.termEnd) ?? null;
}

export function getCommitteeDisplayName(
  committee: Pick<Committee, "type" | "name" | "domainKey"> & { module?: Pick<Module, "name"> | null },
  locale: Locale
) {
  if (committee.type === "STANDARD") return getStandardCommitteeName(locale);
  if (committee.type === "DOMAIN" && committee.domainKey) {
    return getDomainCommitteeName(committee.domainKey as Parameters<typeof getDomainCommitteeName>[0], locale);
  }
  if (committee.module) return getModuleCommitteeName(committee.module.name, locale);
  return committee.name;
}

export function getCommitteeDescription(committee: Pick<Committee, "type">, locale: Locale): string {
  const uiLocale = resolveMessagesLocale(locale);
  if (committee.type === "STANDARD") return STANDARD_COMMITTEE_DESCRIPTION[uiLocale];
  if (committee.type === "DOMAIN") return DOMAIN_COMMITTEE_DESCRIPTION[uiLocale];
  return MODULE_COMMITTEE_DESCRIPTION[uiLocale];
}

export function getCommitteeDomainLabel(
  committee: Pick<Committee, "type" | "domainKey" | "jurisdictionCode" | "expertDomainKey">,
  locale: Locale
): string | null {
  if (committee.type !== "DOMAIN") return null;
  const labels = getCommitteeGovernanceLabels(committee, locale);
  if (labels.jurisdiction && labels.expertDomain) {
    return `${labels.jurisdiction} · ${labels.expertDomain}`;
  }
  if (!committee.domainKey) return null;
  return getDomainCommitteeDomainLabel(
    committee.domainKey as Parameters<typeof getDomainCommitteeDomainLabel>[0],
    locale
  );
}

export function getCommitteeTypeLabel(type: Committee["type"], locale: Locale) {
  return COMMITTEE_TYPE_LABELS[type][resolveMessagesLocale(locale)];
}

export function getCommitteeMemberRoleLabel(
  role: "CHAIR" | "MEMBER" | "REVIEWER" | "OBSERVER",
  locale: Locale,
) {
  return COMMITTEE_MEMBER_ROLE_LABELS[role][resolveMessagesLocale(locale)];
}
