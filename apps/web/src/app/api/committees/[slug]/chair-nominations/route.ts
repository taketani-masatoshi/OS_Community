import { requireProfileCompleteApi } from "@/lib/session";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { getCommitteeBySlug } from "@/lib/committees";
import { createChairNomination, reviewChairNomination } from "@/lib/committee-chair";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireProfileCompleteApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const { slug } = await params;
  const committee = await getCommitteeBySlug(slug);
  if (!committee) return apiErrorResponse("NOT_FOUND", 404);
  if (committee.type !== "DOMAIN" && committee.type !== "MODULE") {
    return apiErrorResponse("CHAIR_NOMINATION_NOT_SUPPORTED", 400);
  }

  const bodyResult = await readJsonBody<{ candidateUserId?: string; statement?: string }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  if (!bodyResult.candidateUserId) return apiErrorResponse("VALIDATION", 400);

  const result = await createChairNomination({
    committeeId: committee.id,
    candidateUserId: bodyResult.candidateUserId,
    nominatedById: session.user.id,
    statement: bodyResult.statement,
  });

  if (!result.ok) {
    if (result.code === "FORBIDDEN") return apiErrorResponse("FORBIDDEN", 403);
    if (result.code === "CANDIDATE_NOT_MEMBER") return apiErrorResponse("VALIDATION", 400);
    if (result.code === "DUPLICATE") return apiErrorResponse("PENDING_REQUEST", 409);
    return apiErrorResponse("NOT_FOUND", 404);
  }

  return Response.json({ ok: true, nominationId: result.nomination.id });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireProfileCompleteApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const { slug } = await params;
  const committee = await getCommitteeBySlug(slug);
  if (!committee) return apiErrorResponse("NOT_FOUND", 404);

  const bodyResult = await readJsonBody<{
    nominationId?: string;
    decision?: "APPROVED" | "REJECTED";
    reviewNote?: string;
  }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  if (!bodyResult.nominationId || !bodyResult.decision) {
    return apiErrorResponse("VALIDATION", 400);
  }

  const result = await reviewChairNomination({
    nominationId: bodyResult.nominationId,
    reviewerId: session.user.id,
    reviewerSiteRole: session.user.siteRole,
    committee,
    decision: bodyResult.decision,
    reviewNote: bodyResult.reviewNote,
  });

  if (!result.ok) {
    if (result.code === "FORBIDDEN") return apiErrorResponse("FORBIDDEN", 403);
    if (result.code === "ALREADY_REVIEWED") return apiErrorResponse("ALREADY_REVIEWED", 409);
    return apiErrorResponse("NOT_FOUND", 404);
  }

  return Response.json({ ok: true, decision: result.decision });
}
