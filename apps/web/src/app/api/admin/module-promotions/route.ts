import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { apiErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/api-body";
import {
  buildPromotionMetadata,
  getModulePromotionRequest,
} from "@/lib/module-promotion";
import { TrustLevel } from "@os-community/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authResult = await requireRoleApi(["ADMIN"]);
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const limited = await enforceAdminRateLimit(req, session.user.id);
  if (limited) return limited;

  const bodyResult = await readJsonBody<{
    moduleId?: string;
    action?: string;
    note?: string;
  }>(req);
  if (bodyResult instanceof Response) return bodyResult;

  if (!bodyResult.moduleId || (bodyResult.action !== "approve" && bodyResult.action !== "reject")) {
    return apiErrorResponse("VALIDATION", 400);
  }

  const mod = await prisma.module.findUnique({
    where: { id: bodyResult.moduleId },
    select: { id: true, metadata: true, trustLevel: true, readinessTier: true },
  });
  if (!mod) return apiErrorResponse("NOT_FOUND", 404);

  const promotion = getModulePromotionRequest(mod.metadata);
  if (!promotion || promotion.status !== "PENDING") {
    return apiErrorResponse("NOT_FOUND", 404);
  }

  const reviewedAt = new Date().toISOString();
  const nextPromotion = {
    ...promotion,
    status: bodyResult.action === "approve" ? ("APPROVED" as const) : ("REJECTED" as const),
    reviewNote: bodyResult.note?.trim() || undefined,
    reviewerId: session.user.id,
    reviewedAt,
  };

  if (bodyResult.action === "approve") {
    await prisma.module.update({
      where: { id: mod.id },
      data: {
        trustLevel: TrustLevel.COMMUNITY,
        readinessTier: mod.readinessTier === "unsupported" ? "skeleton" : mod.readinessTier,
        metadata: buildPromotionMetadata(mod.metadata, nextPromotion),
      },
    });
  } else {
    await prisma.module.update({
      where: { id: mod.id },
      data: {
        metadata: buildPromotionMetadata(mod.metadata, nextPromotion),
      },
    });
  }

  return Response.json({ ok: true });
}
