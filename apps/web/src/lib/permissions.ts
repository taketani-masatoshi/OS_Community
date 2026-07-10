import type { Locale, CommitteeType, CommitteeMemberRole } from "@os-community/shared";
import { resolveMessagesLocale, CORE_AGENTS, DEFAULT_STEWARD_AGENT_REPO } from "@os-community/shared";
import {
  buildEffectiveGitHubPermissions,
  getGitHubLevelLabel,
  mergePermissionLevel,
  type EffectiveGitHubPermission,
  type GitHubPermissionLevel,
} from "@os-community/shared";
import { getUserDashboardData } from "@/lib/committees";
import { prisma } from "@/lib/prisma";

export type PermissionRow = EffectiveGitHubPermission & {
  sourceLabel: string;
  levelLabel: string;
};

export type ConsolidatedPermission = {
  scope: "repo" | "org";
  target: string;
  level: GitHubPermissionLevel;
  levelLabel: string;
  sources: string[];
};

export async function getUserPermissionRows(userId: string, locale: Locale): Promise<PermissionRow[]> {
  const { memberships, moduleRoles } = await getUserDashboardData(userId);
  const agentMembers = await prisma.agentMember.findMany({
    where: { userId },
    select: { agentSlug: true },
  });
  const dbAgents =
    agentMembers.length > 0
      ? await prisma.agent.findMany({
          where: { slug: { in: agentMembers.map((m) => m.agentSlug) } },
          select: { slug: true, githubRepo: true },
        })
      : [];
  const dbAgentBySlug = new Map(dbAgents.map((a) => [a.slug, a.githubRepo]));

  const permissions = buildEffectiveGitHubPermissions({
    locale,
    moduleRoles: moduleRoles.map((mr) => ({
      moduleSlug: mr.module.slug,
      moduleName: mr.module.name,
      role: mr.role,
      githubRepo: mr.module.githubRepo,
    })),
    committeeMemberships: memberships.map((m) => ({
      committeeType: m.committee.type as CommitteeType,
      committeeSlug: m.committee.slug,
      committeeName: m.committee.name,
      role: m.role as CommitteeMemberRole,
      moduleSlug: m.committee.module?.slug ?? null,
      githubRepo: m.committee.module?.githubRepo ?? null,
    })),
    agentMemberships: agentMembers.map((member) => {
      const core = CORE_AGENTS.find((a) => a.id === member.agentSlug);
      return {
        agentSlug: member.agentSlug,
        githubRepo:
          dbAgentBySlug.get(member.agentSlug) ??
          core?.githubRepo ??
          DEFAULT_STEWARD_AGENT_REPO ??
          null,
      };
    }),
  });

  return permissions.map((p) => ({
    ...p,
    sourceLabel: formatSourceLabel(p.sourceKey, locale, moduleRoles, memberships),
    levelLabel: getGitHubLevelLabel(p.level, locale),
  }));
}

function formatSourceLabel(
  sourceKey: string,
  locale: Locale,
  moduleRoles: Awaited<ReturnType<typeof getUserDashboardData>>["moduleRoles"],
  memberships: Awaited<ReturnType<typeof getUserDashboardData>>["memberships"]
): string {
  const labels = {
    ja: {
      moduleRole: "モジュール役割",
      moduleCommittee: "モジュール委員会",
      standardCommittee: "全体標準委員会",
      agentMember: "エージェントメンバー",
    },
    en: {
      moduleRole: "Module role",
      moduleCommittee: "Module committee",
      standardCommittee: "Standard committee",
      agentMember: "Agent member",
    },
    pt: {
      moduleRole: "Papel no módulo",
      moduleCommittee: "Comitê do módulo",
      standardCommittee: "Comitê de padrões",
      agentMember: "Membro do agente",
    },
    es: {
      moduleRole: "Rol del módulo",
      moduleCommittee: "Comité del módulo",
      standardCommittee: "Comité de estándares",
      agentMember: "Miembro del agente",
    },
    et: {
      moduleRole: "Mooduli roll",
      moduleCommittee: "Mooduli komitee",
      standardCommittee: "Standardikomitee",
      agentMember: "Agendi liige",
    },
    fr: {
      moduleRole: "Rôle de module",
      moduleCommittee: "Comité de module",
      standardCommittee: "Comité standard",
      agentMember: "Membre agent",
    },
    zh: {
      moduleRole: "模块角色",
      moduleCommittee: "模块委员会",
      standardCommittee: "整体标准委员会",
      agentMember: "代理成员",
    },
    de: {
      moduleRole: "Modulrolle",
      moduleCommittee: "Modulausschuss",
      standardCommittee: "Standardausschuss",
      agentMember: "Agent-Mitglied",
    },
    ru: {
      moduleRole: "Роль модуля",
      moduleCommittee: "Комитет модуля",
      standardCommittee: "Комитет стандартов",
      agentMember: "Участник агента",
    },
  }[resolveMessagesLocale(locale)];

  if (sourceKey.startsWith("agent-member:")) {
    const slug = sourceKey.split(":")[1];
    return `${labels.agentMember}: ${slug}`;
  }
  if (sourceKey.startsWith("module-role:")) {
    const [, slug, role] = sourceKey.split(":");
    const mod = moduleRoles.find((m) => m.module.slug === slug);
    return `${labels.moduleRole}: ${mod?.module.name ?? slug} (${role})`;
  }
  if (sourceKey.startsWith("module-committee:")) {
    const [, slug, role] = sourceKey.split(":");
    const mem = memberships.find((m) => m.committee.module?.slug === slug || m.committee.slug.includes(slug));
    return `${labels.moduleCommittee}: ${mem?.committee.name ?? slug} (${role})`;
  }
  if (sourceKey.startsWith("standard-committee:")) {
    const role = sourceKey.split(":")[1];
    return `${labels.standardCommittee} (${role})`;
  }
  return sourceKey;
}

export function consolidatePermissions(rows: PermissionRow[], locale: Locale): ConsolidatedPermission[] {
  const map = new Map<string, ConsolidatedPermission>();

  for (const row of rows) {
    const key = `${row.scope}:${row.target}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        scope: row.scope,
        target: row.target,
        level: row.level,
        levelLabel: row.levelLabel,
        sources: [row.sourceLabel],
      });
    } else {
      existing.level = mergePermissionLevel(existing.level, row.level);
      existing.levelLabel = getGitHubLevelLabel(existing.level, locale);
      if (!existing.sources.includes(row.sourceLabel)) {
        existing.sources.push(row.sourceLabel);
      }
    }
  }

  return Array.from(map.values());
}
