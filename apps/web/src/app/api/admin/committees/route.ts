import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { createCommitteeAdmin } from "@/lib/admin-committees";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authResult = await requireRoleApi(["ADMIN"]);
  if ("error" in authResult) return authResult.error;

  const limited = await enforceAdminRateLimit(req, authResult.session.user.id);
  if (limited) return limited;

  const bodyResult = await readJsonBody<{
    type?: string;
    slug?: string;
    name?: string;
    description?: string;
    jurisdictionCode?: string;
    expertDomainKey?: string;
    moduleId?: string;
  }>(req);
  if (bodyResult instanceof Response) return bodyResult;

  if (!bodyResult.type || !bodyResult.slug || !bodyResult.name) {
    return apiErrorResponse("VALIDATION", 400);
  }

  if (bodyResult.type !== "STANDARD" && bodyResult.type !== "DOMAIN" && bodyResult.type !== "MODULE") {
    return apiErrorResponse("VALIDATION", 400);
  }

  const result = await createCommitteeAdmin({
    type: bodyResult.type,
    slug: bodyResult.slug,
    name: bodyResult.name,
    description: bodyResult.description,
    jurisdictionCode: bodyResult.jurisdictionCode,
    expertDomainKey: bodyResult.expertDomainKey,
    moduleId: bodyResult.moduleId,
  });

  if (!result.ok) {
    if (result.code === "DUPLICATE_SLUG" || result.code === "DUPLICATE_DOMAIN" || result.code === "DUPLICATE_MODULE") {
      return apiErrorResponse("DUPLICATE", 409);
    }
    if (result.code === "MODULE_NOT_FOUND") return apiErrorResponse("NOT_FOUND", 404);
    return apiErrorResponse("VALIDATION", 400);
  }

  return Response.json({ ok: true, slug: result.committee.slug, id: result.committee.id });
}
