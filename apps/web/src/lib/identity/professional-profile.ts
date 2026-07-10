import { prisma } from "@/lib/prisma";
import type { Prisma } from "@os-community/db";

export type LinkedInProfilePayload = {
  linkedinId: string;
  vanityName?: string | null;
  headline?: string | null;
  organization?: string | null;
  profileUrl?: string | null;
  rawProfile?: Record<string, unknown>;
};

export async function getProfessionalProfile(userId: string) {
  return prisma.professionalProfile.findUnique({ where: { userId } });
}

export async function getProfessionalProfileBySlug(slug: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ publicSlug: slug }, { githubLogin: slug }, { id: slug }],
    },
    select: { id: true },
  });
  if (!user) return null;
  return getProfessionalProfile(user.id);
}

export async function upsertProfessionalProfile(userId: string, payload: LinkedInProfilePayload) {
  const rawProfile = payload.rawProfile as Prisma.InputJsonValue | undefined;

  return prisma.professionalProfile.upsert({
    where: { userId },
    create: {
      userId,
      linkedinId: payload.linkedinId,
      vanityName: payload.vanityName ?? null,
      headline: payload.headline ?? null,
      organization: payload.organization ?? null,
      profileUrl: payload.profileUrl ?? null,
      rawProfile,
      verifiedAt: new Date(),
    },
    update: {
      linkedinId: payload.linkedinId,
      vanityName: payload.vanityName ?? null,
      headline: payload.headline ?? null,
      organization: payload.organization ?? null,
      profileUrl: payload.profileUrl ?? null,
      rawProfile,
      verifiedAt: new Date(),
    },
  });
}

export async function deleteProfessionalProfile(userId: string) {
  await prisma.professionalProfile.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId, provider: "linkedin" } });
}
