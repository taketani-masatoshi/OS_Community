import { requireAuthApi } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { canReviewModuleRoleRequest } from "@/lib/review-authorization";
import { approveModuleRoleRequest, rejectModuleRoleRequest } from "@/lib/module-role-review";

export const runtime = "nodejs";

/** Committee chairs/reviewers review module role requests for their module committee. */
export async function POST(req: Request) {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const limited = await enforceAdminRateLimit(req, session.user.id);
  if (limited) return limited;

  const bodyResult = await readJsonBody<{ requestId?: string; action?: string; note?: string }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  const body = bodyResult;

  if (!body.requestId || (body.action !== "approve" && body.action !== "reject")) {
    return apiErrorResponse("VALIDATION", 400);
  }

  const request = await prisma.moduleRoleRequest.findUnique({ where: { id: body.requestId } });
  if (!request || request.status !== "PENDING") {
    return apiErrorResponse("NOT_FOUND", 404);
  }

  const allowed = await canReviewModuleRoleRequest(
    session.user.id,
    session.user.siteRole,
    request.moduleId,
    request.role,
  );
  if (!allowed) {
    return apiErrorResponse("FORBIDDEN", 403);
  }

  const result =
    body.action === "reject"
      ? await rejectModuleRoleRequest(body.requestId, session.user.id, body.note?.trim())
      : await approveModuleRoleRequest(body.requestId, session.user.id, body.note?.trim());

  if (!result.ok) {
    return apiErrorResponse("NOT_FOUND", 404);
  }

  return Response.json({ ok: true });
}
