import type { CommitteeMemberRole, CommitteeType, ModuleRoleType } from "@os-community/db";
import { getUserDashboardData } from "@/lib/committees";

export type UserModuleCommunity = {
  moduleSlug: string;
  moduleName: string;
  moduleRole: ModuleRoleType | null;
  committeeRole: CommitteeMemberRole | null;
  committeeSlug: string | null;
  committeeType: CommitteeType | null;
  githubRepo: string | null;
};

export type UserStandardCommunity = {
  committeeSlug: string;
  committeeRole: CommitteeMemberRole;
};

export type UserDomainCommunity = {
  committeeSlug: string;
  committeeRole: CommitteeMemberRole;
  jurisdictionCode: string | null;
  expertDomainKey: string | null;
};

export type UserCommunities = {
  modules: UserModuleCommunity[];
  standard: UserStandardCommunity | null;
  domain: UserDomainCommunity[];
};

/** モジュール役割と委員会メンバーシップをモジュール単位に統合 */
export async function getUserCommunities(userId: string): Promise<UserCommunities> {
  const { memberships, moduleRoles } = await getUserDashboardData(userId);
  const byModule = new Map<string, UserModuleCommunity>();

  for (const mr of moduleRoles) {
    byModule.set(mr.module.slug, {
      moduleSlug: mr.module.slug,
      moduleName: mr.module.name,
      moduleRole: mr.role,
      committeeRole: null,
      committeeSlug: null,
      committeeType: null,
      githubRepo: mr.module.githubRepo,
    });
  }

  let standard: UserStandardCommunity | null = null;
  const domain: UserDomainCommunity[] = [];

  for (const m of memberships) {
    if (m.committee.type === "STANDARD") {
      standard = {
        committeeSlug: m.committee.slug,
        committeeRole: m.role,
      };
      continue;
    }

    if (m.committee.type === "DOMAIN") {
      domain.push({
        committeeSlug: m.committee.slug,
        committeeRole: m.role,
        jurisdictionCode: m.committee.jurisdictionCode ?? null,
        expertDomainKey: m.committee.expertDomainKey ?? null,
      });
      continue;
    }

    const mod = m.committee.module;
    if (!mod) continue;

    const existing = byModule.get(mod.slug);
    if (existing) {
      existing.committeeRole = m.role;
      existing.committeeSlug = m.committee.slug;
      existing.committeeType = m.committee.type;
      if (!existing.githubRepo) existing.githubRepo = mod.githubRepo;
    } else {
      byModule.set(mod.slug, {
        moduleSlug: mod.slug,
        moduleName: mod.name,
        moduleRole: null,
        committeeRole: m.role,
        committeeSlug: m.committee.slug,
        committeeType: m.committee.type,
        githubRepo: mod.githubRepo,
      });
    }
  }

  return {
    modules: Array.from(byModule.values()).sort((a, b) =>
      a.moduleName.localeCompare(b.moduleName),
    ),
    standard,
    domain: domain.sort((a, b) => a.committeeSlug.localeCompare(b.committeeSlug)),
  };
}
