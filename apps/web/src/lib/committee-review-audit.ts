import type { CommitteeReviewAction } from "@os-community/db";
import { prisma } from "@/lib/prisma";
import { isCommitteeReviewAuditLogAvailable } from "@/lib/prisma-committee-models";

export async function logCommitteeReview(params: {
  committeeId: string;
  targetUserId: string;
  actorId: string;
  action: CommitteeReviewAction;
  referenceId?: string;
  note?: string;
}) {
  if (!isCommitteeReviewAuditLogAvailable()) return;

  try {
    await prisma.committeeReviewAuditLog.create({
      data: {
        committeeId: params.committeeId,
        targetUserId: params.targetUserId,
        actorId: params.actorId,
        action: params.action,
        referenceId: params.referenceId ?? null,
        note: params.note ?? null,
      },
    });
  } catch {
    // Audit failure must not block primary workflow.
  }
}
