import type { SiteRole, UserStatusAuditAction } from "@os-community/db";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_USERS_PAGE_SIZE,
  evaluateSiteRoleChange,
  evaluateUserStatusChange,
  isAllowedSiteRole,
  resolveAdminListPage,
  type RoleChangeResult,
  type StatusAuditAction,
  type StatusChangeResult,
} from "@/lib/admin-users-shared";

export {
  ADMIN_USERS_PAGE_SIZE,
  ALLOWED_SITE_ROLES,
  evaluateSiteRoleChange,
  evaluateUserStatusChange,
  isAllowedSiteRole,
  resolveAdminListPage,
  roleChangeHttpStatus,
  statusChangeHttpStatus,
  type RoleChangeErrorCode,
  type RoleChangeResult,
  type StatusChangeErrorCode,
  type StatusChangeResult,
  type StatusAuditAction,
} from "@/lib/admin-users-shared";

export async function updateUserSiteRole(
  actorId: string,
  targetUserId: string,
  newRole: SiteRole,
): Promise<RoleChangeResult> {
  if (!isAllowedSiteRole(newRole)) {
    return { ok: false, code: "INVALID_ROLE" };
  }

  const result = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, siteRole: true, accountStatus: true, deletedAt: true },
    });
    if (!target || target.deletedAt) {
      return { ok: false as const, code: "USER_NOT_FOUND" as const };
    }

    const adminCount = await tx.user.count({ where: { siteRole: "ADMIN" } });
    const evaluation = evaluateSiteRoleChange({
      targetCurrentRole: target.siteRole,
      newRole,
      adminCount,
    });

    if (!evaluation.ok) {
      return evaluation;
    }
    if ("changed" in evaluation && evaluation.changed === false) {
      return { ok: true as const, user: target, changed: false as const };
    }

    const updated = await tx.user.update({
      where: { id: targetUserId },
      data: { siteRole: newRole },
      select: { id: true, siteRole: true },
    });
    await tx.userRoleAuditLog.create({
      data: {
        userId: targetUserId,
        actorId,
        oldRole: target.siteRole,
        newRole,
      },
    });
    return { ok: true as const, user: updated, changed: true as const };
  });

  return result;
}

export type AdminUserListQuery = {
  q?: string;
  role?: SiteRole;
  page?: number;
};

export async function listUsersForAdmin(query: AdminUserListQuery = {}) {
  const requestedPage = Math.max(1, query.page ?? 1);
  const pageSize = ADMIN_USERS_PAGE_SIZE;
  const q = query.q?.trim();

  const where = {
    deletedAt: null,
    ...(query.role ? { siteRole: query.role } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { githubLogin: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const total = await prisma.user.count({ where });
  const { page, totalPages, pageClamped } = resolveAdminListPage(requestedPage, total, pageSize);

  const users =
    total === 0
      ? []
      : await prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            githubLogin: true,
            siteRole: true,
            accountStatus: true,
            createdAt: true,
            _count: {
              select: {
                moduleRoles: true,
                certifications: true,
                committeeMemberships: true,
              },
            },
          },
          orderBy: [{ siteRole: "desc" }, { createdAt: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        });

  return {
    users,
    total,
    page,
    requestedPage,
    pageClamped,
    pageSize,
    totalPages,
  };
}

export async function listRecentRoleAuditLogs(limit = 25) {
  return prisma.userRoleAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, githubLogin: true } },
      actor: { select: { id: true, name: true, githubLogin: true } },
    },
  });
}

export type RoleAuditLogQuery = {
  from?: Date;
  to?: Date;
  userId?: string;
  limit?: number;
  offset?: number;
};

export async function listRoleAuditLogs(query: RoleAuditLogQuery = {}) {
  const limit = Math.min(Math.max(1, query.limit ?? 100), 1000);
  const offset = Math.max(0, query.offset ?? 0);
  const where = {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from ? { gte: query.from } : {}),
            ...(query.to ? { lte: query.to } : {}),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.userRoleAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        user: { select: { id: true, name: true, githubLogin: true } },
        actor: { select: { id: true, name: true, githubLogin: true } },
      },
    }),
    prisma.userRoleAuditLog.count({ where }),
  ]);

  return { logs, total, limit, offset };
}

function auditActionToDb(action: StatusAuditAction): UserStatusAuditAction {
  return action;
}

export async function updateUserAccountStatus(
  actorId: string,
  targetUserId: string,
  action: StatusAuditAction,
): Promise<StatusChangeResult | { ok: true; noop: true }> {
  const result = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        siteRole: true,
        accountStatus: true,
        deletedAt: true,
      },
    });
    if (!target || target.deletedAt) {
      return { ok: false as const, code: "USER_NOT_FOUND" as const };
    }

    const adminCount = await tx.user.count({
      where: { siteRole: "ADMIN", deletedAt: null, accountStatus: "ACTIVE" },
    });

    const evaluation = evaluateUserStatusChange({
      actorId,
      targetUserId,
      targetCurrentRole: target.siteRole,
      targetAccountStatus: target.accountStatus,
      targetDeleted: Boolean(target.deletedAt),
      adminCount,
      action,
    });

    if (!evaluation.ok) return evaluation;
    if ("noop" in evaluation && evaluation.noop) {
      return evaluation;
    }

    if (action === "DELETE") {
      await tx.session.deleteMany({ where: { userId: targetUserId } });
      await tx.user.update({
        where: { id: targetUserId },
        data: { deletedAt: new Date(), accountStatus: "SUSPENDED" },
      });
    } else if (action === "SUSPEND") {
      await tx.session.deleteMany({ where: { userId: targetUserId } });
      await tx.user.update({
        where: { id: targetUserId },
        data: { accountStatus: "SUSPENDED" },
      });
    } else {
      await tx.user.update({
        where: { id: targetUserId },
        data: { accountStatus: "ACTIVE" },
      });
    }

    await tx.userStatusAuditLog.create({
      data: {
        userId: targetUserId,
        actorId,
        action: auditActionToDb(action),
      },
    });

    return evaluation;
  });

  return result;
}

export function formatRoleAuditCsv(
  logs: Awaited<ReturnType<typeof listRoleAuditLogs>>["logs"],
): string {
  const header = "createdAt,actorId,actor,targetId,target,oldRole,newRole";
  const rows = logs.map((log) => {
    const actor = log.actor.githubLogin ?? log.actor.name ?? log.actor.id;
    const target = log.user.githubLogin ?? log.user.name ?? log.user.id;
    return [
      log.createdAt.toISOString(),
      log.actor.id,
      csvEscape(actor),
      log.user.id,
      csvEscape(target),
      log.oldRole,
      log.newRole,
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
