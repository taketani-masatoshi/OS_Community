#!/usr/bin/env node
/**
 * Grant (or confirm) SiteRole ADMIN for a user by email.
 *
 * Usage:
 *   node scripts/grant-site-admin.mjs k.lab.masa@gmail.com
 *
 * Requires DATABASE_URL (e.g. via `bash scripts/with-env.sh …` or docker).
 */
import { PrismaClient } from "@prisma/client";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/grant-site-admin.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, deletedAt: null },
    select: { id: true, email: true, name: true, siteRole: true, accountStatus: true },
  });

  if (!user) {
    console.error(`User not found for email: ${email}`);
    process.exit(2);
  }

  if (user.siteRole === "ADMIN") {
    console.log(
      `Already ADMIN: ${user.email} (${user.name ?? "—"}) id=${user.id} status=${user.accountStatus}`,
    );
    return;
  }

  const oldRole = user.siteRole;
  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.user.update({
      where: { id: user.id },
      data: { siteRole: "ADMIN" },
      select: { id: true, email: true, name: true, siteRole: true },
    });
    await tx.userRoleAuditLog.create({
      data: {
        userId: user.id,
        actorId: user.id,
        oldRole,
        newRole: "ADMIN",
      },
    });
    return next;
  });

  console.log(
    `Granted ADMIN: ${updated.email} (${updated.name ?? "—"}) ${oldRole} → ${updated.siteRole}`,
  );
  console.log("Note: JWT claims refresh within a few minutes, or sign out/in to see Admin nav immediately.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
