import type { ModuleRoleType } from "@os-community/db";
import { prisma } from "@/lib/prisma";
import { syncCommitteeMembershipForModuleRole } from "@/lib/committees";
import { logCommitteeReview } from "@/lib/committee-review-audit";
import { getModuleCommitteeId } from "@/lib/review-authorization";
import { triggerGitHubProvisioning } from "@/lib/github-provisioning";

export async function grantModuleRole(input: {
  moduleId: string;
  userId: string;
  role: ModuleRoleType;
  message?: string | null;
  reviewerId?: string | null;
  requestId?: string;
}) {
  const existingRole = await prisma.moduleRole.findUnique({
    where: {
      moduleId_userId_role: {
        moduleId: input.moduleId,
        userId: input.userId,
        role: input.role,
      },
    },
  });
  if (existingRole) {
    return { ok: true as const, alreadyGranted: true as const };
  }

  let requestId = input.requestId;

  if (requestId) {
    await prisma.moduleRoleRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewerId: input.reviewerId ?? null,
      },
    });
  } else {
    const request = await prisma.moduleRoleRequest.create({
      data: {
        moduleId: input.moduleId,
        userId: input.userId,
        role: input.role,
        message: input.message?.trim() || null,
        status: "APPROVED",
        reviewerId: input.reviewerId ?? null,
      },
    });
    requestId = request.id;
  }

  await prisma.moduleRole.upsert({
    where: {
      moduleId_userId_role: {
        moduleId: input.moduleId,
        userId: input.userId,
        role: input.role,
      },
    },
    create: {
      moduleId: input.moduleId,
      userId: input.userId,
      role: input.role,
    },
    update: {},
  });

  await syncCommitteeMembershipForModuleRole(input.userId, input.moduleId, input.role);

  const committeeId = await getModuleCommitteeId(input.moduleId);
  if (committeeId && requestId) {
    await logCommitteeReview({
      committeeId,
      targetUserId: input.userId,
      actorId: input.reviewerId ?? input.userId,
      action: "MODULE_ROLE_APPROVED",
      referenceId: requestId,
      note: input.reviewerId ? undefined : "Auto-approved (member / view-only)",
    });
  }

  triggerGitHubProvisioning(input.userId);

  return { ok: true as const, alreadyGranted: false as const };
}
