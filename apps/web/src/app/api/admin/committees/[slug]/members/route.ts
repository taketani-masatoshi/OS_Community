import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { addCommitteeMemberAdmin } from "@/lib/admin-committees";
import { getCommitteeBySlug } from "@/lib/committees";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authResult = await requireRoleApi(["ADMIN"]);
  if ("error" in authResult) return authResult.error;

  const limited = await enforceAdminRateLimit(req, authResult.session.user.id);
  if (limited) return limited;

  const { slug } = await params;
  const committee = await getCommitteeBySlug(slug);
  if (!committee) return apiErrorResponse("NOT_FOUND", 404);

  const bodyResult = await readJsonBody<{ userId?: string; role?: string }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  if (!bodyResult.userId || !bodyResult.role) return apiErrorResponse("VALIDATION", 400);

  const result = await addCommitteeMemberAdmin({
    committeeId: committee.id,
    userId: bodyResult.userId,
    role: bodyResult.role as "CHAIR" | "REVIEWER" | "MEMBER" | "OBSERVER",
    actorId: authResult.session.user.id,
  });

  if (!result.ok) {
    if (result.code === "USER_NOT_FOUND" || result.code === "NOT_FOUND") {
      return apiErrorResponse("NOT_FOUND", 404);
    }
    return apiErrorResponse("VALIDATION", 400);
  }

  return Response.json({ ok: true });
}
