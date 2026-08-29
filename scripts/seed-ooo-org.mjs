/**
 * Seed VERIFIED OrgAffiliation + OOO Certification(organizationId) for an email.
 *
 * Defaults to 株式会社MAL (public corporate number) for k.lab.masa@gmail.com.
 *
 * Prerequisites:
 *   - Migration SQL applied (Certification.organizationId column exists)
 *   - Docker web Client regenerated after schema change:
 *     `docker compose up -d --force-recreate web` (+ cloudflared-inc)
 *
 * Usage:
 *   bash scripts/with-env.sh node scripts/seed-ooo-org.mjs
 *   DATABASE_URL=… node scripts/seed-ooo-org.mjs [email] [legalName] [corporateNumber] [certificateNo]
 */
import { PrismaClient } from "@prisma/client";

const email = (process.argv[2] ?? "k.lab.masa@gmail.com").trim().toLowerCase();
const legalName = (process.argv[3] ?? "株式会社MAL").trim();
const corporateNumber = (process.argv[4] ?? "4010001189530").replace(/\D/g, "");
const certificateNo = (process.argv[5] ?? "OOO-TAKETANI-MASATOSHI-001").trim();

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, deletedAt: null },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(2);
  }

  if (!/^\d{13}$/.test(corporateNumber)) {
    console.error(`Invalid corporate number (need 13 digits): ${corporateNumber}`);
    process.exit(2);
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 3);

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.upsert({
      where: {
        jurisdiction_corporateNumber: { jurisdiction: "JP", corporateNumber },
      },
      create: {
        jurisdiction: "JP",
        corporateNumber,
        legalName,
      },
      update: { legalName },
    });

    const existingAff = await tx.orgAffiliation.findUnique({
      where: {
        userId_organizationId: { userId: user.id, organizationId: org.id },
      },
    });

    const affiliation = existingAff
      ? await tx.orgAffiliation.update({
          where: { id: existingAff.id },
          data: {
            status: "VERIFIED",
            title: existingAff.title ?? "代表取締役",
            verifiedAt: existingAff.verifiedAt ?? new Date(),
            verifiedById: user.id,
            rejectReason: null,
          },
        })
      : await tx.orgAffiliation.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            status: "VERIFIED",
            title: "代表取締役",
            verifiedAt: new Date(),
            verifiedById: user.id,
          },
        });

    if (!existingAff || existingAff.status !== "VERIFIED") {
      await tx.orgAffiliationAuditLog.create({
        data: {
          affiliationId: affiliation.id,
          actorId: user.id,
          action: existingAff ? "VERIFY" : "CLAIM",
          note: existingAff
            ? `Seed VERIFY ${corporateNumber} ${legalName}`
            : `Seed CLAIM+VERIFY ${corporateNumber} ${legalName}`,
        },
      });
      if (!existingAff) {
        await tx.orgAffiliationAuditLog.create({
          data: {
            affiliationId: affiliation.id,
            actorId: user.id,
            action: "VERIFY",
            note: `Seed VERIFY ${corporateNumber} ${legalName}`,
          },
        });
      }
    }

    const cert = await tx.certification.upsert({
      where: { certificateNo },
      create: {
        userId: user.id,
        organizationId: org.id,
        type: "STEWARD_OPERATOR",
        certificateNo,
        status: "APPROVED",
        expiresAt,
        notes: "Seeded OOO linked to organization",
      },
      update: {
        userId: user.id,
        organizationId: org.id,
        status: "APPROVED",
        revokedAt: null,
        expiresAt,
        notes: "Seeded OOO linked to organization",
      },
    });

    return { org, affiliation, cert };
  });

  console.log(
    JSON.stringify(
      {
        user: { id: user.id, email: user.email, name: user.name },
        organization: {
          id: result.org.id,
          legalName: result.org.legalName,
          corporateNumber: result.org.corporateNumber,
        },
        affiliation: {
          id: result.affiliation.id,
          status: result.affiliation.status,
        },
        certification: {
          id: result.cert.id,
          certificateNo: result.cert.certificateNo,
          organizationId: result.cert.organizationId,
          expiresAt: result.cert.expiresAt,
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
