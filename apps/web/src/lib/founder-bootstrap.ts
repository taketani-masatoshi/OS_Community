import { prisma } from "@/lib/prisma";
import {
  FOUNDER_NAME,
  FOUNDER_GITHUB_DEFAULT,
  FOUNDER_GITHUB_LEGACY,
  FOUNDER_PROFILE_SLUG,
  STANDARD_COMMITTEE_SLUG,
} from "@os-community/shared";

async function upsertFounderUser(name: string, githubLogin: string) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ githubLogin }, { githubLogin: FOUNDER_GITHUB_LEGACY }, { name }],
    },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { name, githubLogin, siteRole: "ADMIN" },
    });
  }

  return prisma.user.create({
    data: { name, githubLogin, siteRole: "ADMIN" },
  });
}

async function ensureFounderProfile(userId: string, name: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      specialty: "ガバナンス・OrgOS",
      region: "日本",
      organization: "OpenOrgOS",
      bio: "OpenOrgOS 創設者。OrgOS のオープンソースコミュニティを牽引。",
      profileCompletedAt: new Date(),
    },
  });
}

/** DB マイグレーション不要 — 既存 User テーブルだけで創設者データを投入 */
export async function bootstrapFounder(options?: { githubLogin?: string; name?: string }) {
  const name = options?.name ?? process.env.SEED_FOUNDER_NAME ?? FOUNDER_NAME;
  const githubLogin =
    options?.githubLogin ??
    process.env.SEED_FOUNDER_GITHUB ??
    process.env.SEED_ADMIN_GITHUB ??
    FOUNDER_GITHUB_DEFAULT;

  const founder = await upsertFounderUser(name, githubLogin);
  await ensureFounderProfile(founder.id, name);

  const modules = await prisma.module.findMany();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 3);

  let moduleRoleCount = 0;
  for (const mod of modules) {
    for (const role of ["MAINTAINER", "CONTRIBUTOR"] as const) {
      await prisma.moduleRole.upsert({
        where: { moduleId_userId_role: { moduleId: mod.id, userId: founder.id, role } },
        create: { moduleId: mod.id, userId: founder.id, role },
        update: {},
      });
      moduleRoleCount++;
    }

    const maintainers = mod.maintainers.includes(name) ? mod.maintainers : [...mod.maintainers, name];
    await prisma.module.update({ where: { id: mod.id }, data: { maintainers } });

    const committee = await prisma.committee.findUnique({ where: { moduleId: mod.id } });
    if (committee) {
      await prisma.committeeMember.upsert({
        where: { committeeId_userId: { committeeId: committee.id, userId: founder.id } },
        create: { committeeId: committee.id, userId: founder.id, role: "CHAIR" },
        update: { role: "CHAIR" },
      });
    }
  }

  for (const [type, prefix] of [
    ["STEWARD_OPERATOR", "OOO"],
    ["STEWARD_DESIGNER", "OOD"],
  ] as const) {
    const certificateNo = `${prefix}-TAKETANI-MASATOSHI-001`;
    await prisma.certification.upsert({
      where: { certificateNo },
      create: {
        userId: founder.id,
        type,
        certificateNo,
        status: "APPROVED",
        expiresAt,
        notes: "Founding certified professional",
      },
      update: { userId: founder.id, status: "APPROVED", expiresAt },
    });
  }

  const defaultOperatorId =
    process.env.COMMUNITY_DEFAULT_ORGOS_OPERATOR_ID?.trim() || "OP-001";
  await prisma.user.update({
    where: { id: founder.id },
    data: { orgosOperatorId: defaultOperatorId },
  });

  const standard = await prisma.committee.findUnique({ where: { slug: STANDARD_COMMITTEE_SLUG } });
  if (standard) {
    await prisma.committeeMember.upsert({
      where: { committeeId_userId: { committeeId: standard.id, userId: founder.id } },
      create: { committeeId: standard.id, userId: founder.id, role: "CHAIR" },
      update: { role: "CHAIR" },
    });
  }

  return {
    userId: founder.id,
    name,
    githubLogin,
    moduleCount: modules.length,
    moduleRoleCount,
    profileUrl: `/users/${FOUNDER_PROFILE_SLUG}`,
  };
}
