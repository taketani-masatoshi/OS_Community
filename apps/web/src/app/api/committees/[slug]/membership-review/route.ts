import { requireAuthApi } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { getCommitteeBySlug } from "@/lib/committees";
import { canReviewCommitteeMembershipRequest } from "@/lib/review-authorization";
import {
  approveCommitteeMembershipRequest,
  rejectCommitteeMembershipRequest,
} from "@/lib/committee-membership-review";

import { isCommitteeMembershipRequestAvailable } from "@/lib/prisma-committee-models";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  if (!isCommitteeMembershipRequestAvailable()) {
    return apiErrorResponse("DATABASE_UNAVAILABLE", 503);
  }

  const limited = await enforceAdminRateLimit(req, session.user.id);
  if (limited) return limited;

  const { slug } = await params;
  const committee = await getCommitteeBySlug(slug);
  if (!committee) {
    return apiErrorResponse("NOT_FOUND", 404);
  }

  const bodyResult = await readJsonBody<{
    requestId?: string;
    action?: string;
    note?: string;
  }>(req);
  if (bodyResult instanceof Response) return bodyResult;

  if (!bodyResult.requestId || (bodyResult.action !== "approve" && bodyResult.action !== "reject")) {
    return apiErrorResponse("VALIDATION", 400);
  }

  const request = await prisma.committeeMembershipRequest.findUnique({
    where: { id: bodyResult.requestId },
  });
  if (!request || request.status !== "PENDING" || request.committeeId !== committee.id) {
    return apiErrorResponse("NOT_FOUND", 404);
  }

  const allowed = await canReviewCommitteeMembershipRequest(
    session.user.id,
    session.user.siteRole,
    committee.id,
    request.desiredRole,
  );
  if (!allowed) {
    return apiErrorResponse("FORBIDDEN", 403);
  }

  const result =
    bodyResult.action === "reject"
      ? await rejectCommitteeMembershipRequest(
          bodyResult.requestId,
          session.user.id,
          bodyResult.note?.trim(),
        )
      : await approveCommitteeMembershipRequest(
          bodyResult.requestId,
          session.user.id,
          bodyResult.note?.trim(),
        );

  if (!result.ok) {
    return apiErrorResponse("NOT_FOUND", 404);
  }

  return Response.json({ ok: true });
}
