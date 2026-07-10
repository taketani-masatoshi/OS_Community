#!/usr/bin/env node
/**
 * Backfill User.publicSlug for existing rows.
 * Usage: node scripts/backfill-public-slugs.mjs
 */
import { PrismaClient } from "@prisma/client";

const FOUNDER_PROFILE_SLUG = "taketani-masatoshi";
const FOUNDER_GITHUB_DEFAULT = "taketani-masatoshi";
const FOUNDER_GITHUB_LEGACY = "takaya-masatoshi";
const FOUNDER_NAME = "竹谷昌敏";
const SLUG_MAX = 48;

const prisma = new PrismaClient();

function normalizePublicSlug(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX);
}

function isValidPublicSlug(slug) {
  return slug.length >= 2 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug);
}

function isFounderUser(user) {
  return (
    user.name === FOUNDER_NAME ||
    user.githubLogin === FOUNDER_GITHUB_DEFAULT ||
    user.githubLogin === FOUNDER_GITHUB_LEGACY
  );
}

async function slugTaken(slug, excludeUserId) {
  const existing = await prisma.user.findFirst({
    where: { publicSlug: slug, ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}) },
    select: { id: true },
  });
  return Boolean(existing);
}

async function pickUniqueSlug(base, excludeUserId) {
  const normalized = normalizePublicSlug(base);
  if (!normalized || !isValidPublicSlug(normalized)) {
    return pickUniqueSlug(`user-${excludeUserId.slice(-8)}`, excludeUserId);
  }
  if (!(await slugTaken(normalized, excludeUserId))) return normalized;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${normalized.slice(0, SLUG_MAX - String(i).length - 1)}-${i}`;
    if (isValidPublicSlug(candidate) && !(await slugTaken(candidate, excludeUserId))) {
      return candidate;
    }
  }
  throw new Error(`Could not allocate slug for ${excludeUserId}`);
}

async function main() {
  const users = await prisma.user.findMany({
    where: { publicSlug: null },
    select: { id: true, name: true, githubLogin: true },
  });

  let updated = 0;
  for (const user of users) {
    let slug;
    if (isFounderUser(user)) {
      slug = FOUNDER_PROFILE_SLUG;
    } else {
      slug = await pickUniqueSlug(user.githubLogin ?? user.name ?? user.id, user.id);
    }
    await prisma.user.update({ where: { id: user.id }, data: { publicSlug: slug } });
    updated++;
    console.log(`${user.id} → ${slug}`);
  }
  console.log(`Backfilled ${updated} user(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
