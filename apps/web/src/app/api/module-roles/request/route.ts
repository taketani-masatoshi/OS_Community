import { requireProfileCompleteApi, requireGitHubLoginApi } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import type { ModuleRoleType } from "@os-community/db";
import { grantModuleRole } from "@/lib/module-role-grant";
import { isAutoApprovedModuleRole } from "@/lib/membership-auto-approval";
import { enforceWriteRateLimit } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";

const ALLOWED_ROLES: ModuleRoleType[] = ["MAINTAINER", "DEPUTY", "CONTRIBUTOR"];

export async function POST(req: Request) {
  const authResult = await requireProfileCompleteApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const limited = await enforceWriteRateLimit(req, session.user.id);
  if (limited) return limited;

  const bodyResult = await readJsonBody<{ moduleId?: string; role?: string; message?: string }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  const body = bodyResult;

  if (!body.moduleId?.trim()) {
    return apiErrorResponse("MODULE_REQUIRED", 400);
  }

  const role = body.role as ModuleRoleType;
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return apiErrorResponse("INVALID_ROLE", 400);
  }

  if (!isAutoApprovedModuleRole(role)) {
    const githubResult = await requireGitHubLoginApi();
    if ("error" in githubResult) return githubResult.error;
  }

  const targetModule = await prisma.module.findUnique({
    where: { id: body.moduleId },
    select: { id: true, slug: true, trustLevel: true },
  });
  if (!targetModule) {
    return apiErrorResponse("MODULE_NOT_FOUND", 404);
  }
  if (targetModule.trustLevel === "WILD" && role === "MAINTAINER") {
    return apiErrorResponse("WILD_MODULE", 400);
  }

  const existingRole = await prisma.moduleRole.findUnique({
    where: {
      moduleId_userId_role: {
        moduleId: body.moduleId,
        userId: session.user.id,
        role,
      },
    },
  });
  if (existingRole) {
    return Response.json({ ok: true, autoApproved: isAutoApprovedModuleRole(role), alreadyMember: true });
  }

  const pending = await prisma.moduleRoleRequest.findFirst({
    where: { moduleId: body.moduleId, userId: session.user.id, status: "PENDING" },
  });
  if (pending) {
    return apiErrorResponse("PENDING_REQUEST", 409);
  }

  if (isAutoApprovedModuleRole(role)) {
    try {
      const result = await grantModuleRole({
        moduleId: body.moduleId,
        userId: session.user.id,
        role,
        message: body.message,
      });
      return Response.json({ ok: true, autoApproved: true, alreadyMember: result.alreadyGranted });
    } catch {
      return apiErrorResponse("SAVE_FAILED", 500);
    }
  }

  try {
    await prisma.moduleRoleRequest.create({
      data: {
        moduleId: body.moduleId,
        userId: session.user.id,
        role,
        message: body.message?.trim() || null,
      },
    });
  } catch {
    return apiErrorResponse("SAVE_FAILED", 500);
  }

  return Response.json({ ok: true, autoApproved: false });
}
