import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { apiErrorResponse } from "@/lib/api-error";
import {
  isAllowedSiteRole,
  roleChangeHttpStatus,
  statusChangeHttpStatus,
  updateUserAccountStatus,
  updateUserSiteRole,
  type StatusAuditAction,
} from "@/lib/admin-users";
import { readJsonBody } from "@/lib/api-body";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRoleApi(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const limited = await enforceAdminRateLimit(request, auth.session.user.id);
  if (limited) return limited;

  const { id } = await params;

  const bodyResult = await readJsonBody<{ siteRole?: string }>(request);
  if (bodyResult instanceof Response) return bodyResult;
  const body = bodyResult;

  if (!body.siteRole || !isAllowedSiteRole(body.siteRole)) {
    return apiErrorResponse("INVALID_ROLE", 400);
  }

  const result = await updateUserSiteRole(auth.session.user.id, id, body.siteRole);
  if (!result.ok) {
    return apiErrorResponse(result.code, roleChangeHttpStatus(result.code));
  }

  return Response.json({ ...result.user, changed: result.changed });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRoleApi(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const limited = await enforceAdminRateLimit(request, auth.session.user.id);
  if (limited) return limited;

  const { id } = await params;
  const result = await updateUserAccountStatus(auth.session.user.id, id, "DELETE");
  if (!result.ok) {
    return apiErrorResponse(result.code, statusChangeHttpStatus(result.code));
  }
  if ("noop" in result && result.noop) {
    return Response.json({ ok: true, changed: false });
  }
  return Response.json({ ok: true, changed: true, action: "DELETE" });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRoleApi(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const limited = await enforceAdminRateLimit(request, auth.session.user.id);
  if (limited) return limited;

  const { id } = await params;

  const bodyResult = await readJsonBody<{ action?: StatusAuditAction }>(request);
  if (bodyResult instanceof Response) return bodyResult;
  const body = bodyResult;

  if (body.action !== "SUSPEND" && body.action !== "RESTORE") {
    return apiErrorResponse("INVALID_ACTION", 400);
  }

  const result = await updateUserAccountStatus(auth.session.user.id, id, body.action);
  if (!result.ok) {
    return apiErrorResponse(result.code, statusChangeHttpStatus(result.code));
  }
  if ("noop" in result && result.noop) {
    return Response.json({ ok: true, changed: false });
  }
  return Response.json({ ok: true, changed: true, action: body.action });
}
