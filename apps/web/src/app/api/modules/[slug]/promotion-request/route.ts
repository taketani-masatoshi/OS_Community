import { requireProfileCompleteApi } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import {
  buildPromotionMetadata,
  getModulePromotionRequest,
  isModuleMaintainer,
  isWildModuleAuthor,
} from "@/lib/module-promotion";
import { TrustLevel } from "@os-community/db";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(req: Request, context: RouteContext) {
  const authResult = await requireProfileCompleteApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const { slug } = await context.params;
  const mod = await prisma.module.findUnique({
    where: { slug },
    select: { id: true, slug: true, trustLevel: true, metadata: true },
  });
  if (!mod) return apiErrorResponse("MODULE_NOT_FOUND", 404);
  if (mod.trustLevel !== TrustLevel.WILD) {
    return apiErrorResponse("VALIDATION", 400, { extra: { reason: "not_wild" } });
  }

  const [isAuthor, isMaintainer] = await Promise.all([
    isWildModuleAuthor(session.user.id, slug),
    isModuleMaintainer(session.user.id, mod.id),
  ]);
  if (!isAuthor && !isMaintainer) {
    return apiErrorResponse("FORBIDDEN", 403);
  }

  const existing = getModulePromotionRequest(mod.metadata);
  if (existing?.status === "PENDING") {
    return apiErrorResponse("PENDING_REQUEST", 409);
  }

  const bodyResult = await readJsonBody<{ message?: string }>(req);
  if (bodyResult instanceof Response) return bodyResult;

  const promotionRequest = {
    status: "PENDING" as const,
    userId: session.user.id,
    message: bodyResult.message?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  await prisma.module.update({
    where: { id: mod.id },
    data: {
      metadata: buildPromotionMetadata(mod.metadata, promotionRequest),
    },
  });

  return Response.json({ ok: true });
}
