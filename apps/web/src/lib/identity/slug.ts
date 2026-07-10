import {
  FOUNDER_NAME,
  FOUNDER_PROFILE_SLUG,
  FOUNDER_GITHUB_DEFAULT,
  FOUNDER_GITHUB_LEGACY,
} from "@os-community/shared";
import { prisma } from "@/lib/prisma";

const SLUG_MAX = 48;

function isFounderUser(user: { name?: string | null; githubLogin?: string | null }) {
  return (
    user.name === FOUNDER_NAME ||
    user.githubLogin === FOUNDER_GITHUB_DEFAULT ||
    user.githubLogin === FOUNDER_GITHUB_LEGACY
  );
}

export function normalizePublicSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX);
}

export function isValidPublicSlug(slug: string): boolean {
  return slug.length >= 2 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug);
}

async function slugTaken(slug: string, excludeUserId?: string): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: {
      publicSlug: slug,
      ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function pickUniqueSlug(base: string, excludeUserId?: string): Promise<string> {
  const normalized = normalizePublicSlug(base);
  if (!normalized || !isValidPublicSlug(normalized)) {
    return pickUniqueSlug(`user-${excludeUserId?.slice(-8) ?? "member"}`, excludeUserId);
  }
  if (!(await slugTaken(normalized, excludeUserId))) return normalized;

  for (let i = 2; i < 1000; i++) {
    const candidate = `${normalized.slice(0, SLUG_MAX - String(i).length - 1)}-${i}`;
    if (isValidPublicSlug(candidate) && !(await slugTaken(candidate, excludeUserId))) {
      return candidate;
    }
  }
  throw new Error("Could not allocate public slug");
}

export async function ensurePublicSlug(
  userId: string,
  hints?: { githubLogin?: string | null; name?: string | null }
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, publicSlug: true, githubLogin: true, name: true },
  });
  if (!user) throw new Error("User not found");
  if (user.publicSlug) return user.publicSlug;

  if (isFounderUser(user)) {
    const slug = FOUNDER_PROFILE_SLUG;
    await prisma.user.update({ where: { id: userId }, data: { publicSlug: slug } });
    return slug;
  }

  const githubLogin = hints?.githubLogin ?? user.githubLogin;
  const name = hints?.name ?? user.name;
  const preferred = githubLogin ?? name ?? userId;
  const slug = await pickUniqueSlug(preferred, userId);
  await prisma.user.update({ where: { id: userId }, data: { publicSlug: slug } });
  return slug;
}
