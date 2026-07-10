import { prisma } from "@/lib/prisma";
import { ensurePublicSlug } from "@/lib/identity/slug";

export type UserProfileInput = {
  name: string;
  specialty: string;
  region: string;
  organization?: string;
  bio?: string;
};

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      githubLogin: true,
      image: true,
      bio: true,
      specialty: true,
      region: true,
      organization: true,
      profileCompletedAt: true,
    },
  });
}

export function isProfileComplete(user: { profileCompletedAt: Date | null; specialty: string | null; region: string | null }) {
  return Boolean(user.profileCompletedAt && user.specialty && user.region);
}

export async function saveUserProfile(userId: string, input: UserProfileInput) {
  const name = input.name.trim();
  const specialty = input.specialty.trim();
  const region = input.region.trim();
  const organization = input.organization?.trim() || null;
  const bio = input.bio?.trim() || null;

  if (!name || !specialty || !region) {
    throw new Error("Name, specialty, and region are required");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      specialty,
      region,
      organization,
      bio,
      profileCompletedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      githubLogin: true,
      publicSlug: true,
      profileCompletedAt: true,
    },
  });

  if (!user.publicSlug) {
    await ensurePublicSlug(userId, { githubLogin: user.githubLogin, name: user.name });
  }

  return user;
}
