import { prisma } from "@/lib/prisma";
import { logCommitteeReview } from "@/lib/committee-review-audit";
import { triggerGitHubProvisioning } from "@/lib/github-provisioning";

export async function approveCommitteeMembershipRequest(
  requestId: string,
  reviewerId: string,
  reviewNote?: string,
) {
  const request = await prisma.committeeMembershipRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || request.status !== "PENDING") {
    return { ok: false as const, reason: "NOT_FOUND" as const };
  }

  const committeeRole =
    request.desiredRole === "REVIEWER" ? ("REVIEWER" as const) : ("MEMBER" as const);

  await prisma.$transaction([
    prisma.committeeMembershipRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", reviewerId, reviewNote: reviewNote ?? null },
    }),
    prisma.committeeMember.upsert({
      where: {
        committeeId_userId: { committeeId: request.committeeId, userId: request.userId },
      },
      create: {
        committeeId: request.committeeId,
        userId: request.userId,
        role: committeeRole,
      },
      update: { role: committeeRole },
    }),
  ]);

  await logCommitteeReview({
    committeeId: request.committeeId,
    targetUserId: request.userId,
    actorId: reviewerId,
    action: "MEMBERSHIP_APPROVED",
    referenceId: requestId,
    note: reviewNote,
  });

  triggerGitHubProvisioning(request.userId);

  return { ok: true as const };
}

export async function rejectCommitteeMembershipRequest(
  requestId: string,
  reviewerId: string,
  reviewNote?: string,
) {
  const request = await prisma.committeeMembershipRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || request.status !== "PENDING") {
    return { ok: false as const, reason: "NOT_FOUND" as const };
  }

  await prisma.committeeMembershipRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", reviewerId, reviewNote: reviewNote ?? null },
  });

  await logCommitteeReview({
    committeeId: request.committeeId,
    targetUserId: request.userId,
    actorId: reviewerId,
    action: "MEMBERSHIP_REJECTED",
    referenceId: requestId,
    note: reviewNote,
  });

  return { ok: true as const };
}
