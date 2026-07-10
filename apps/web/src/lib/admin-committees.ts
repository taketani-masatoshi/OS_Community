import type { CommitteeMemberRole, CommitteeType, Prisma, SiteRole } from "@os-community/db";
import { prisma } from "@/lib/prisma";
import {
  getActiveCommitteeChair,
  sortCommitteeMembers,
  syncAllModuleCommittees,
} from "@/lib/committees";
import { listPendingChairNominations } from "@/lib/committee-chair";
import { isCommitteeMembershipRequestAvailable } from "@/lib/prisma-committee-models";

export const ADMIN_COMMITTEES_PAGE_SIZE = 50;

const COMMITTEE_MEMBER_ROLES: CommitteeMemberRole[] = ["CHAIR", "REVIEWER", "MEMBER", "OBSERVER"];

export type AdminCommitteeListQuery = {
  type?: CommitteeType;
  q?: string;
  page?: number;
};

export type CreateCommitteeAdminInput = {
  type: CommitteeType;
  slug: string;
  name: string;
  description?: string;
  jurisdictionCode?: string;
  expertDomainKey?: string;
  moduleId?: string;
};

export type AdminCommitteeMemberInput = {
  committeeId: string;
  userId: string;
  role: CommitteeMemberRole;
  actorId: string;
};

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function getCommitteeAdminSummary() {
  const [total, membershipPending, chairPending, moduleRolePending] = await Promise.all([
    prisma.committee.count(),
    isCommitteeMembershipRequestAvailable()
      ? prisma.committeeMembershipRequest.count({ where: { status: "PENDING" } })
      : Promise.resolve(0),
    prisma.committeeChairNomination.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.moduleRoleRequest.count({ where: { status: "PENDING" } }),
  ]);

  return {
    total,
    membershipPending,
    chairPending,
    moduleRolePending,
    pendingTotal: membershipPending + chairPending + moduleRolePending,
  };
}

export async function listCommitteesForAdmin(query: AdminCommitteeListQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const where: Prisma.CommitteeWhereInput = {};

  if (query.type) where.type = query.type;
  if (query.q?.trim()) {
    const q = query.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, committees] = await Promise.all([
    prisma.committee.count({ where }),
    prisma.committee.findMany({
      where,
      include: {
        module: { select: { slug: true, name: true } },
        members: {
          where: { role: "CHAIR", termEnd: null },
          include: {
            user: { select: { id: true, name: true, githubLogin: true, publicSlug: true } },
          },
          take: 1,
        },
        _count: { select: { members: true } },
      },
      orderBy: [{ type: "asc" }, { slug: "asc" }],
      skip: (page - 1) * ADMIN_COMMITTEES_PAGE_SIZE,
      take: ADMIN_COMMITTEES_PAGE_SIZE,
    }),
  ]);

  const committeeIds = committees.map((c) => c.id);
  const moduleIdByCommittee = new Map(
    committees.filter((c) => c.moduleId).map((c) => [c.id, c.moduleId!]),
  );
  const moduleIds = [...moduleIdByCommittee.values()];

  const membershipCounts = isCommitteeMembershipRequestAvailable()
    ? await prisma.committeeMembershipRequest.groupBy({
        by: ["committeeId"],
        where: { committeeId: { in: committeeIds }, status: "PENDING" },
        _count: { _all: true },
      })
    : [];

  const chairCounts = await prisma.committeeChairNomination
    .groupBy({
      by: ["committeeId"],
      where: { committeeId: { in: committeeIds }, status: "PENDING" },
      _count: { _all: true },
    })
    .catch(() => [] as { committeeId: string; _count: { _all: number } }[]);

  const moduleRoleCounts =
    moduleIds.length > 0
      ? await prisma.moduleRoleRequest.groupBy({
          by: ["moduleId"],
          where: { moduleId: { in: moduleIds }, status: "PENDING" },
          _count: { _all: true },
        })
      : [];

  const membershipByCommittee = new Map(membershipCounts.map((r) => [r.committeeId, r._count._all]));
  const chairByCommittee = new Map(chairCounts.map((r) => [r.committeeId, r._count._all]));
  const moduleRoleByModule = new Map(moduleRoleCounts.map((r) => [r.moduleId, r._count._all]));

  const rows = committees.map((committee) => {
    const chair = getActiveCommitteeChair(committee.members);
    const moduleRolePending = committee.moduleId
      ? (moduleRoleByModule.get(committee.moduleId) ?? 0)
      : 0;
    return {
      id: committee.id,
      slug: committee.slug,
      name: committee.name,
      type: committee.type,
      jurisdictionCode: committee.jurisdictionCode,
      expertDomainKey: committee.expertDomainKey,
      moduleSlug: committee.module?.slug ?? null,
      memberCount: committee._count.members,
      chairName: chair?.user.githubLogin ?? chair?.user.name ?? null,
      pendingMembership: membershipByCommittee.get(committee.id) ?? 0,
      pendingChair: chairByCommittee.get(committee.id) ?? 0,
      pendingModuleRole: moduleRolePending,
      pendingTotal:
        (membershipByCommittee.get(committee.id) ?? 0) +
        (chairByCommittee.get(committee.id) ?? 0) +
        moduleRolePending,
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_COMMITTEES_PAGE_SIZE));

  return {
    committees: rows,
    total,
    page,
    totalPages,
    pageClamped: page > totalPages && total > 0,
  };
}

export async function getCommitteeAdminDetail(slug: string) {
  const committee = await prisma.committee.findUnique({
    where: { slug },
    include: {
      module: { select: { id: true, slug: true, name: true } },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              githubLogin: true,
              email: true,
              publicSlug: true,
            },
          },
        },
      },
    },
  });

  if (!committee) return null;

  const activeMembers = sortCommitteeMembers(committee.members.filter((m) => !m.termEnd));

  const [membershipRequests, chairNominations, moduleRoleRequests] = await Promise.all([
    committee.type !== "MODULE" && isCommitteeMembershipRequestAvailable()
      ? prisma.committeeMembershipRequest.findMany({
          where: { committeeId: committee.id, status: "PENDING" },
          include: { user: { select: { id: true, name: true, githubLogin: true } } },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    listPendingChairNominations(committee.id),
    committee.moduleId
      ? prisma.moduleRoleRequest.findMany({
          where: { moduleId: committee.moduleId, status: "PENDING" },
          include: {
            user: { select: { id: true, name: true, githubLogin: true } },
            module: { select: { slug: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return {
    committee: { ...committee, members: activeMembers },
    membershipRequests,
    chairNominations,
    moduleRoleRequests,
  };
}

export async function syncCommitteesFromDefinitions() {
  await syncAllModuleCommittees();
  const total = await prisma.committee.count();
  return { total };
}

export async function createCommitteeAdmin(input: CreateCommitteeAdminInput) {
  const slug = normalizeSlug(input.slug);
  const name = input.name.trim();

  if (!slug || !name) return { ok: false as const, code: "VALIDATION" as const };
  if (!["STANDARD", "DOMAIN", "MODULE"].includes(input.type)) {
    return { ok: false as const, code: "VALIDATION" as const };
  }

  const existingSlug = await prisma.committee.findUnique({ where: { slug } });
  if (existingSlug) return { ok: false as const, code: "DUPLICATE_SLUG" as const };

  if (input.type === "DOMAIN") {
    const jurisdictionCode = input.jurisdictionCode?.trim();
    const expertDomainKey = input.expertDomainKey?.trim();
    if (!jurisdictionCode || !expertDomainKey) {
      return { ok: false as const, code: "VALIDATION" as const };
    }
    const existingDomain = await prisma.committee.findFirst({
      where: { jurisdictionCode, expertDomainKey },
    });
    if (existingDomain) return { ok: false as const, code: "DUPLICATE_DOMAIN" as const };

    const committee = await prisma.committee.create({
      data: {
        slug,
        name,
        type: "DOMAIN",
        domainKey: slug,
        jurisdictionCode,
        expertDomainKey,
        description: input.description?.trim() || null,
      },
    });
    return { ok: true as const, committee };
  }

  if (input.type === "MODULE") {
    if (!input.moduleId) return { ok: false as const, code: "VALIDATION" as const };
    const mod = await prisma.module.findUnique({ where: { id: input.moduleId } });
    if (!mod) return { ok: false as const, code: "MODULE_NOT_FOUND" as const };
    const existingModuleCommittee = await prisma.committee.findUnique({ where: { moduleId: input.moduleId } });
    if (existingModuleCommittee) return { ok: false as const, code: "DUPLICATE_MODULE" as const };

    const committee = await prisma.committee.create({
      data: {
        slug,
        name,
        type: "MODULE",
        moduleId: input.moduleId,
        description: input.description?.trim() || null,
      },
    });
    return { ok: true as const, committee };
  }

  const committee = await prisma.committee.create({
    data: {
      slug,
      name,
      type: "STANDARD",
      description: input.description?.trim() || null,
    },
  });
  return { ok: true as const, committee };
}

async function countActiveChairs(committeeId: string, excludeUserId?: string) {
  return prisma.committeeMember.count({
    where: {
      committeeId,
      role: "CHAIR",
      termEnd: null,
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
  });
}

async function writeAdminMemberAudit(input: {
  committeeId: string;
  targetUserId: string;
  actorId: string;
  action: "MEMBERSHIP_APPROVED" | "MEMBERSHIP_REJECTED";
  note: string;
}) {
  await prisma.committeeReviewAuditLog.create({
    data: {
      committeeId: input.committeeId,
      targetUserId: input.targetUserId,
      actorId: input.actorId,
      action: input.action,
      note: input.note,
    },
  });
}

async function applyChairRole(committeeId: string, userId: string, termMonths = 24) {
  const termEnd = new Date();
  termEnd.setMonth(termEnd.getMonth() + termMonths);

  await prisma.$transaction(async (tx) => {
    await tx.committeeMember.updateMany({
      where: {
        committeeId,
        role: "CHAIR",
        termEnd: null,
        userId: { not: userId },
      },
      data: { role: "MEMBER" },
    });

    await tx.committeeMember.upsert({
      where: { committeeId_userId: { committeeId, userId } },
      create: {
        committeeId,
        userId,
        role: "CHAIR",
        termStart: new Date(),
        termEnd,
      },
      update: {
        role: "CHAIR",
        termStart: new Date(),
        termEnd,
      },
    });
  });
}

export async function addCommitteeMemberAdmin(input: AdminCommitteeMemberInput) {
  if (!COMMITTEE_MEMBER_ROLES.includes(input.role)) {
    return { ok: false as const, code: "INVALID_ROLE" as const };
  }

  const committee = await prisma.committee.findUnique({ where: { id: input.committeeId } });
  if (!committee) return { ok: false as const, code: "NOT_FOUND" as const };

  const user = await prisma.user.findFirst({
    where: { id: input.userId, deletedAt: null, accountStatus: "ACTIVE" },
  });
  if (!user) return { ok: false as const, code: "USER_NOT_FOUND" as const };

  if (input.role === "CHAIR") {
    await applyChairRole(committee.id, input.userId);
  } else {
    await prisma.committeeMember.upsert({
      where: { committeeId_userId: { committeeId: committee.id, userId: input.userId } },
      create: { committeeId: committee.id, userId: input.userId, role: input.role },
      update: { role: input.role, termEnd: null },
    });
  }

  await writeAdminMemberAudit({
    committeeId: committee.id,
    targetUserId: input.userId,
    actorId: input.actorId,
    action: "MEMBERSHIP_APPROVED",
    note: `admin direct add (${input.role})`,
  });

  return { ok: true as const };
}

export async function updateCommitteeMemberRoleAdmin(input: AdminCommitteeMemberInput) {
  if (!COMMITTEE_MEMBER_ROLES.includes(input.role)) {
    return { ok: false as const, code: "INVALID_ROLE" as const };
  }

  const membership = await prisma.committeeMember.findUnique({
    where: { committeeId_userId: { committeeId: input.committeeId, userId: input.userId } },
  });
  if (!membership || membership.termEnd) {
    return { ok: false as const, code: "NOT_FOUND" as const };
  }

  if (membership.role === "CHAIR" && input.role !== "CHAIR") {
    const otherChairs = await countActiveChairs(input.committeeId, input.userId);
    if (otherChairs === 0) {
      return { ok: false as const, code: "LAST_CHAIR" as const };
    }
  }

  if (input.role === "CHAIR") {
    await applyChairRole(input.committeeId, input.userId);
  } else {
    await prisma.committeeMember.update({
      where: { committeeId_userId: { committeeId: input.committeeId, userId: input.userId } },
      data: { role: input.role },
    });
  }

  await writeAdminMemberAudit({
    committeeId: input.committeeId,
    targetUserId: input.userId,
    actorId: input.actorId,
    action: "MEMBERSHIP_APPROVED",
    note: `admin direct role change (${membership.role} → ${input.role})`,
  });

  return { ok: true as const };
}

export async function removeCommitteeMemberAdmin(input: {
  committeeId: string;
  userId: string;
  actorId: string;
}) {
  const membership = await prisma.committeeMember.findUnique({
    where: { committeeId_userId: { committeeId: input.committeeId, userId: input.userId } },
  });
  if (!membership || membership.termEnd) {
    return { ok: false as const, code: "NOT_FOUND" as const };
  }

  if (membership.role === "CHAIR") {
    const otherChairs = await countActiveChairs(input.committeeId, input.userId);
    if (otherChairs === 0) {
      return { ok: false as const, code: "LAST_CHAIR" as const };
    }
  }

  await prisma.committeeMember.update({
    where: { committeeId_userId: { committeeId: input.committeeId, userId: input.userId } },
    data: { termEnd: new Date() },
  });

  await writeAdminMemberAudit({
    committeeId: input.committeeId,
    targetUserId: input.userId,
    actorId: input.actorId,
    action: "MEMBERSHIP_REJECTED",
    note: "admin direct removal",
  });

  return { ok: true as const };
}

export async function listModulesWithoutCommittee() {
  return prisma.module.findMany({
    where: { committee: null },
    select: { id: true, slug: true, name: true },
    orderBy: { slug: "asc" },
    take: 200,
  });
}

export { COMMITTEE_MEMBER_ROLES };
