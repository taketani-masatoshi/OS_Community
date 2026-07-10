import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import {
  removeCommitteeMemberAdmin,
  updateCommitteeMemberRoleAdmin,
} from "@/lib/admin-committees";
import { getCommitteeBySlug } from "@/lib/committees";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string; userId: string }> },
) {
  const authResult = await requireRoleApi(["ADMIN"]);
  if ("error" in authResult) return authResult.error;

  const limited = await enforceAdminRateLimit(req, authResult.session.user.id);
  if (limited) return limited;

  const { slug, userId } = await params;
  const committee = await getCommitteeBySlug(slug);
  if (!committee) return apiErrorResponse("NOT_FOUND", 404);

  const bodyResult = await readJsonBody<{ role?: string }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  if (!bodyResult.role) return apiErrorResponse("VALIDATION", 400);

  const result = await updateCommitteeMemberRoleAdmin({
    committeeId: committee.id,
    userId,
    role: bodyResult.role as "CHAIR" | "REVIEWER" | "MEMBER" | "OBSERVER",
    actorId: authResult.session.user.id,
  });

  if (!result.ok) {
    if (result.code === "NOT_FOUND") return apiErrorResponse("NOT_FOUND", 404);
    if (result.code === "LAST_CHAIR") return apiErrorResponse("LAST_CHAIR", 409);
    return apiErrorResponse("VALIDATION", 400);
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string; userId: string }> },
) {
  const authResult = await requireRoleApi(["ADMIN"]);
  if ("error" in authResult) return authResult.error;

  const limited = await enforceAdminRateLimit(req, authResult.session.user.id);
  if (limited) return limited;

  const { slug, userId } = await params;
  const committee = await getCommitteeBySlug(slug);
  if (!committee) return apiErrorResponse("NOT_FOUND", 404);

  const result = await removeCommitteeMemberAdmin({
    committeeId: committee.id,
    userId,
    actorId: authResult.session.user.id,
  });

  if (!result.ok) {
    if (result.code === "NOT_FOUND") return apiErrorResponse("NOT_FOUND", 404);
    if (result.code === "LAST_CHAIR") return apiErrorResponse("LAST_CHAIR", 409);
    return apiErrorResponse("VALIDATION", 400);
  }

  return Response.json({ ok: true });
}
