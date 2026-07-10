import { prisma } from "@/lib/prisma";
import { activeCertificationWhere } from "@/lib/active-certification";
import {
  FOUNDER_NAME,
  FOUNDER_PROFILE_SLUG,
  FOUNDER_GITHUB_DEFAULT,
  FOUNDER_GITHUB_LEGACY,
} from "@os-community/shared";
import { ensurePublicSlug } from "@/lib/identity/slug";

export async function resolveUserBySlug(slug: string) {
  const orConditions: Array<
    { publicSlug: string } | { githubLogin: string } | { id: string } | { name: string }
  > = [{ publicSlug: slug }, { githubLogin: slug }, { id: slug }];

  if (slug === FOUNDER_PROFILE_SLUG || slug === FOUNDER_GITHUB_LEGACY) {
    orConditions.push(
      { name: FOUNDER_NAME },
      { githubLogin: FOUNDER_GITHUB_DEFAULT },
      { githubLogin: FOUNDER_GITHUB_LEGACY }
    );
  }

  return prisma.user.findFirst({
    where: { OR: orConditions },
    select: {
      id: true,
      name: true,
      githubLogin: true,
      publicSlug: true,
      image: true,
      siteRole: true,
      bio: true,
      specialty: true,
      region: true,
      organization: true,
      createdAt: true,
    },
  });
}

export async function getUserPublicProfile(userId: string) {
  const [memberships, moduleRoles, certifications, wildModules, professionalProfile, githubConnections] =
    await Promise.all([
      prisma.committeeMember.findMany({
        where: { userId, termEnd: null },
        include: {
          committee: {
            include: {
              module: { select: { slug: true, name: true } },
            },
          },
        },
        orderBy: [{ committee: { type: "asc" } }, { createdAt: "asc" }],
      }),
      prisma.moduleRole.findMany({
        where: { userId, termEnd: null },
        include: {
          module: {
            select: { slug: true, name: true, moduleType: true, trustLevel: true, githubRepo: true },
          },
        },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      }),
      prisma.certification.findMany({
        where: { userId, ...activeCertificationWhere() },
        orderBy: { issuedAt: "desc" },
      }),
      prisma.wildModuleRegistration.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.professionalProfile.findUnique({ where: { userId } }),
      prisma.gitHubConnection.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  return { memberships, moduleRoles, certifications, wildModules, professionalProfile, githubConnections };
}

export function isFounderUser(user: { name?: string | null; githubLogin?: string | null }) {
  return (
    user.name === FOUNDER_NAME ||
    user.githubLogin === FOUNDER_GITHUB_DEFAULT ||
    user.githubLogin === FOUNDER_GITHUB_LEGACY
  );
}

export function getUserProfilePath(user: {
  name?: string | null;
  githubLogin?: string | null;
  publicSlug?: string | null;
  id: string;
}) {
  if (isFounderUser(user)) return `/users/${FOUNDER_PROFILE_SLUG}`;
  if (user.publicSlug) return `/users/${user.publicSlug}`;
  return `/users/${user.githubLogin ?? user.id}`;
}

export function getCanonicalProfileSlug(user: {
  publicSlug?: string | null;
  githubLogin?: string | null;
  id: string;
  name?: string | null;
}) {
  if (isFounderUser(user)) return FOUNDER_PROFILE_SLUG;
  return user.publicSlug ?? user.githubLogin ?? user.id;
}

export function isFounderProfile(slug: string) {
  return slug === FOUNDER_PROFILE_SLUG;
}

export async function ensureUserPublicSlug(userId: string) {
  return ensurePublicSlug(userId);
}
