#!/usr/bin/env node
/**
 * Clear all auth-linked user records (User, Account, Session, profiles, etc.).
 * Usage: node scripts/clear-auth-users.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [usersBefore, sessionsBefore, accountsBefore] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.account.count(),
  ]);

  console.log(`Before: users=${usersBefore}, sessions=${sessionsBefore}, accounts=${accountsBefore}`);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const [usersAfter, sessionsAfter, accountsAfter] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.account.count(),
  ]);

  console.log(`After: users=${usersAfter}, sessions=${sessionsAfter}, accounts=${accountsAfter}`);
  console.log("Auth user data cleared.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
