import { requireProfileCompleteApi } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { getCommitteeBySlug } from "@/lib/committees";
import { logCommitteeReview } from "@/lib/committee-review-audit";
import { isCommitteeMembershipRequestAvailable } from "@/lib/prisma-committee-models";
import { approveCommitteeMembershipRequest } from "@/lib/committee-membership-review";
import { isAutoApprovedCommitteeMembershipRole } from "@/lib/membership-auto-approval";
import type { CommitteeMembershipDesiredRole } from "@os-community/db";

export const runtime = "nodejs";

const ALLOWED_ROLES: CommitteeMembershipDesiredRole[] = ["MEMBER", "REVIEWER"];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isCommitteeMembershipRequestAvailable()) {
    return apiErrorResponse("DATABASE_UNAVAILABLE", 503);
  }

  const authResult = await requireProfileCompleteApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const { slug } = await params;
  const committee = await getCommitteeBySlug(slug);
  if (!committee) {
    return apiErrorResponse("NOT_FOUND", 404);
  }

  if (committee.type !== "DOMAIN") {
    return apiErrorResponse("COMMITTEE_APPLY_NOT_SUPPORTED", 400);
  }

  const bodyResult = await readJsonBody<{
    desiredRole?: string;
    message?: string;
    bridgeExpertise?: string;
    bridgeRegion?: string;
    nominatorName?: string;
    conflictAccepted?: boolean;
  }>(req);
  if (bodyResult instanceof Response) return bodyResult;

  const desiredRole = bodyResult.desiredRole as CommitteeMembershipDesiredRole;
  if (!desiredRole || !ALLOWED_ROLES.includes(desiredRole)) {
    return apiErrorResponse("INVALID_ROLE", 400);
  }

  const bridgeExpertise = bodyResult.bridgeExpertise?.trim() ?? "";
  const bridgeRegion = bodyResult.bridgeRegion?.trim() ?? "";
  const nominatorName = bodyResult.nominatorName?.trim() ?? "";
  if (!bridgeExpertise || !bridgeRegion || !nominatorName) {
    return apiErrorResponse("VALIDATION", 400);
  }
  if (!bodyResult.conflictAccepted) {
    return apiErrorResponse("VALIDATION", 400);
  }

  const existingMember = await prisma.committeeMember.findUnique({
    where: {
      committeeId_userId: { committeeId: committee.id, userId: session.user.id },
    },
  });
  if (existingMember) {
    return apiErrorResponse("ALREADY_MEMBER", 409);
  }

  const pending = await prisma.committeeMembershipRequest.findFirst({
    where: { committeeId: committee.id, userId: session.user.id, status: "PENDING" },
  });
  if (pending) {
    return apiErrorResponse("PENDING_REQUEST", 409);
  }

  try {
    const created = await prisma.committeeMembershipRequest.create({
      data: {
        committeeId: committee.id,
        userId: session.user.id,
        desiredRole,
        message: bodyResult.message?.trim() || null,
        bridgeExpertise,
        bridgeRegion,
        nominatorName,
        conflictAcceptedAt: new Date(),
      },
    });

    await logCommitteeReview({
      committeeId: committee.id,
      targetUserId: session.user.id,
      actorId: session.user.id,
      action: "MEMBERSHIP_APPLIED",
      referenceId: created.id,
    });

    if (isAutoApprovedCommitteeMembershipRole(desiredRole)) {
      await approveCommitteeMembershipRequest(created.id, session.user.id);
      return Response.json({ ok: true, autoApproved: true });
    }
  } catch {
    return apiErrorResponse("SAVE_FAILED", 500);
  }

  return Response.json({ ok: true, autoApproved: false });
}
