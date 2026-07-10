import type { ModuleRoleType } from "@os-community/db";
import { prisma } from "@/lib/prisma";
import { logCommitteeReview } from "@/lib/committee-review-audit";
import { getModuleCommitteeId } from "@/lib/review-authorization";
import { grantModuleRole } from "@/lib/module-role-grant";

export async function approveModuleRoleRequest(requestId: string, reviewerId: string, reviewNote?: string) {
  const request = await prisma.moduleRoleRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") {
    return { ok: false as const, reason: "NOT_FOUND" as const };
  }

  if (reviewNote) {
    await prisma.moduleRoleRequest.update({
      where: { id: requestId },
      data: { reviewNote },
    });
  }

  await grantModuleRole({
    moduleId: request.moduleId,
    userId: request.userId,
    role: request.role as ModuleRoleType,
    reviewerId,
    requestId,
  });

  return { ok: true as const };
}

export async function rejectModuleRoleRequest(requestId: string, reviewerId: string, reviewNote?: string) {
  const request = await prisma.moduleRoleRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") {
    return { ok: false as const, reason: "NOT_FOUND" as const };
  }

  await prisma.moduleRoleRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", reviewerId, reviewNote: reviewNote ?? null },
  });

  const committeeId = await getModuleCommitteeId(request.moduleId);
  if (committeeId) {
    await logCommitteeReview({
      committeeId,
      targetUserId: request.userId,
      actorId: reviewerId,
      action: "MODULE_ROLE_REJECTED",
      referenceId: requestId,
      note: reviewNote,
    });
  }

  return { ok: true as const };
}
