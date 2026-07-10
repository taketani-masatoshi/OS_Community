import type { Prisma } from "@os-community/db";

export type ModulePromotionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ModulePromotionRequest = {
  status: ModulePromotionStatus;
  userId: string;
  message?: string;
  createdAt: string;
  reviewNote?: string;
  reviewerId?: string;
  reviewedAt?: string;
};

type ModuleMetadata = {
  promotionRequest?: ModulePromotionRequest;
  [key: string]: unknown;
};

export function getModulePromotionRequest(
  metadata: Prisma.JsonValue | null | undefined
): ModulePromotionRequest | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const promotionRequest = (metadata as ModuleMetadata).promotionRequest;
  if (!promotionRequest || typeof promotionRequest !== "object") return null;
  if (!promotionRequest.status || !promotionRequest.userId) return null;
  return promotionRequest as ModulePromotionRequest;
}

export function buildPromotionMetadata(
  current: Prisma.JsonValue | null | undefined,
  promotionRequest: ModulePromotionRequest
): Prisma.InputJsonValue {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {};
  return { ...base, promotionRequest };
}

export async function isWildModuleAuthor(userId: string, slug: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");
  const reg = await prisma.wildModuleRegistration.findUnique({
    where: { slug },
    select: { userId: true },
  });
  return reg?.userId === userId;
}

export async function isModuleMaintainer(userId: string, moduleId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");
  const role = await prisma.moduleRole.findFirst({
    where: { userId, moduleId, role: "MAINTAINER" },
    select: { id: true },
  });
  return Boolean(role);
}
