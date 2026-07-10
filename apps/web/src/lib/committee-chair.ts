import { prisma } from "@/lib/prisma";
import type { SiteRole } from "@os-community/db";
import { canAccessCommitteeReviewPage } from "@/lib/review-authorization";

export async function listPendingChairNominations(committeeId: string) {
  return prisma.committeeChairNomination.findMany({
    where: { committeeId, status: "PENDING" },
    include: {
      candidate: { select: { id: true, name: true, githubLogin: true, publicSlug: true } },
      nominator: { select: { id: true, name: true, githubLogin: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createChairNomination(input: {
  committeeId: string;
  candidateUserId: string;
  nominatedById: string;
  statement?: string;
  termMonths?: number;
}) {
  const committee = await prisma.committee.findUnique({
    where: { id: input.committeeId },
    include: { members: { where: { userId: input.nominatedById, termEnd: null } } },
  });
  if (!committee) return { ok: false as const, code: "NOT_FOUND" as const };

  const membership = committee.members[0];
  if (!membership || !["CHAIR", "REVIEWER", "MEMBER"].includes(membership.role)) {
    return { ok: false as const, code: "FORBIDDEN" as const };
  }

  const candidateMember = await prisma.committeeMember.findUnique({
    where: {
      committeeId_userId: {
        committeeId: input.committeeId,
        userId: input.candidateUserId,
      },
    },
  });
  if (!candidateMember || candidateMember.termEnd) {
    return { ok: false as const, code: "CANDIDATE_NOT_MEMBER" as const };
  }

  const existing = await prisma.committeeChairNomination.findFirst({
    where: {
      committeeId: input.committeeId,
      candidateUserId: input.candidateUserId,
      status: "PENDING",
    },
  });
  if (existing) return { ok: false as const, code: "DUPLICATE" as const };

  const nomination = await prisma.committeeChairNomination.create({
    data: {
      committeeId: input.committeeId,
      candidateUserId: input.candidateUserId,
      nominatedById: input.nominatedById,
      statement: input.statement?.trim() || null,
      termMonths: input.termMonths ?? 24,
    },
  });

  await prisma.committeeReviewAuditLog.create({
    data: {
      committeeId: input.committeeId,
      targetUserId: input.candidateUserId,
      actorId: input.nominatedById,
      action: "CHAIR_NOMINATED",
      referenceId: nomination.id,
      note: input.statement?.trim() || null,
    },
  });

  return { ok: true as const, nomination };
}

export async function reviewChairNomination(input: {
  nominationId: string;
  reviewerId: string;
  reviewerSiteRole: SiteRole;
  committee: { id: string; type: string; members: { userId: string; role: string }[] };
  decision: "APPROVED" | "REJECTED";
  reviewNote?: string;
}) {
  const canReview = await canAccessCommitteeReviewPage(
    input.reviewerId,
    input.reviewerSiteRole,
    input.committee,
  );
  if (!canReview) return { ok: false as const, code: "FORBIDDEN" as const };

  const nomination = await prisma.committeeChairNomination.findUnique({
    where: { id: input.nominationId },
  });
  if (!nomination || nomination.committeeId !== input.committee.id) {
    return { ok: false as const, code: "NOT_FOUND" as const };
  }
  if (nomination.status !== "PENDING") {
    return { ok: false as const, code: "ALREADY_REVIEWED" as const };
  }

  if (input.decision === "REJECTED") {
    await prisma.$transaction([
      prisma.committeeChairNomination.update({
        where: { id: nomination.id },
        data: {
          status: "REJECTED",
          reviewerId: input.reviewerId,
          reviewNote: input.reviewNote?.trim() || null,
        },
      }),
      prisma.committeeReviewAuditLog.create({
        data: {
          committeeId: nomination.committeeId,
          targetUserId: nomination.candidateUserId,
          actorId: input.reviewerId,
          action: "CHAIR_REJECTED",
          referenceId: nomination.id,
          note: input.reviewNote?.trim() || null,
        },
      }),
    ]);
    return { ok: true as const, decision: "REJECTED" as const };
  }

  const termEnd = new Date();
  termEnd.setMonth(termEnd.getMonth() + nomination.termMonths);

  await prisma.$transaction(async (tx) => {
    await tx.committeeMember.updateMany({
      where: {
        committeeId: nomination.committeeId,
        role: "CHAIR",
        termEnd: null,
        userId: { not: nomination.candidateUserId },
      },
      data: { role: "MEMBER" },
    });

    await tx.committeeMember.update({
      where: {
        committeeId_userId: {
          committeeId: nomination.committeeId,
          userId: nomination.candidateUserId,
        },
      },
      data: {
        role: "CHAIR",
        termStart: new Date(),
        termEnd,
      },
    });

    await tx.committeeChairNomination.update({
      where: { id: nomination.id },
      data: {
        status: "APPROVED",
        reviewerId: input.reviewerId,
        reviewNote: input.reviewNote?.trim() || null,
      },
    });

    await tx.committeeReviewAuditLog.create({
      data: {
        committeeId: nomination.committeeId,
        targetUserId: nomination.candidateUserId,
        actorId: input.reviewerId,
        action: "CHAIR_APPROVED",
        referenceId: nomination.id,
        note: input.reviewNote?.trim() || null,
      },
    });
  });

  return { ok: true as const, decision: "APPROVED" as const };
}
