import type { OrgAffiliationStatus, Prisma } from "@os-community/db";
import {
  formatCorporateNumberDisplay,
  isJapaneseCorporateNumber,
  normalizeCorporateNumber,
} from "@os-community/shared";
import { prisma } from "@/lib/prisma";

export { formatCorporateNumberDisplay, isJapaneseCorporateNumber, normalizeCorporateNumber };

const affiliationInclude = {
  organization: {
    select: {
      id: true,
      jurisdiction: true,
      corporateNumber: true,
      legalName: true,
    },
  },
} satisfies Prisma.OrgAffiliationInclude;

export type OrgAffiliationWithOrg = Prisma.OrgAffiliationGetPayload<{
  include: typeof affiliationInclude;
}>;

export async function listUserAffiliations(userId: string): Promise<OrgAffiliationWithOrg[]> {
  return prisma.orgAffiliation.findMany({
    where: { userId },
    include: affiliationInclude,
    orderBy: [{ status: "asc" }, { claimedAt: "desc" }],
  });
}

export async function getActiveAffiliation(
  userId: string,
): Promise<OrgAffiliationWithOrg | null> {
  const preferred = await prisma.orgAffiliation.findFirst({
    where: { userId, status: { in: ["VERIFIED", "PENDING"] } },
    include: affiliationInclude,
    orderBy: [{ status: "asc" }, { claimedAt: "desc" }],
  });
  return preferred;
}

/** Operator apply: PENDING or VERIFIED is enough. */
export async function userHasClaimedAffiliation(userId: string): Promise<boolean> {
  const count = await prisma.orgAffiliation.count({
    where: { userId, status: { in: ["PENDING", "VERIFIED"] } },
  });
  return count > 0;
}

/** Operator approve/issue: VERIFIED required. */
export async function userHasVerifiedAffiliation(userId: string): Promise<boolean> {
  const count = await prisma.orgAffiliation.count({
    where: { userId, status: "VERIFIED" },
  });
  return count > 0;
}

export type ClaimOrgInput = {
  corporateNumber: string;
  legalName: string;
  title?: string;
};

export type ClaimOrgResult =
  | { ok: true; affiliation: OrgAffiliationWithOrg }
  | { ok: false; code: "INVALID_CORPORATE_NUMBER" | "LEGAL_NAME_REQUIRED" | "ALREADY_CLAIMED" };

export async function claimOrganization(
  userId: string,
  input: ClaimOrgInput,
): Promise<ClaimOrgResult> {
  const corporateNumber = normalizeCorporateNumber(input.corporateNumber);
  const legalName = input.legalName.trim();
  const title = input.title?.trim() || null;

  if (!isJapaneseCorporateNumber(corporateNumber)) {
    return { ok: false, code: "INVALID_CORPORATE_NUMBER" };
  }
  if (!legalName) {
    return { ok: false, code: "LEGAL_NAME_REQUIRED" };
  }

  const existingSame = await prisma.orgAffiliation.findFirst({
    where: {
      userId,
      organization: { jurisdiction: "JP", corporateNumber },
      status: { in: ["PENDING", "VERIFIED"] },
    },
  });
  if (existingSame) {
    return { ok: false, code: "ALREADY_CLAIMED" };
  }

  const affiliation = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.upsert({
      where: {
        jurisdiction_corporateNumber: { jurisdiction: "JP", corporateNumber },
      },
      create: {
        jurisdiction: "JP",
        corporateNumber,
        legalName,
      },
      update: {
        // Keep existing legalName if already set; only fill when blank
        legalName: legalName,
      },
    });

    const rejected = await tx.orgAffiliation.findUnique({
      where: {
        userId_organizationId: { userId, organizationId: org.id },
      },
    });

    let row;
    if (rejected) {
      row = await tx.orgAffiliation.update({
        where: { id: rejected.id },
        data: {
          status: "PENDING",
          title,
          claimedAt: new Date(),
          verifiedAt: null,
          verifiedById: null,
          rejectReason: null,
        },
        include: affiliationInclude,
      });
    } else {
      row = await tx.orgAffiliation.create({
        data: {
          userId,
          organizationId: org.id,
          status: "PENDING",
          title,
        },
        include: affiliationInclude,
      });
    }

    await tx.orgAffiliationAuditLog.create({
      data: {
        affiliationId: row.id,
        actorId: userId,
        action: "CLAIM",
        note: `${corporateNumber} ${legalName}`,
      },
    });

    return row;
  });

  return { ok: true, affiliation };
}

export async function removeAffiliation(
  userId: string,
  affiliationId: string,
): Promise<{ ok: true } | { ok: false; code: "NOT_FOUND" | "FORBIDDEN" }> {
  const row = await prisma.orgAffiliation.findUnique({ where: { id: affiliationId } });
  if (!row) return { ok: false, code: "NOT_FOUND" };
  if (row.userId !== userId) return { ok: false, code: "FORBIDDEN" };
  if (row.status === "VERIFIED") {
    // Users cannot self-remove verified affiliations; admin must reject/rework.
    return { ok: false, code: "FORBIDDEN" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.orgAffiliationAuditLog.create({
      data: {
        affiliationId: row.id,
        actorId: userId,
        action: "REMOVE",
      },
    });
    await tx.orgAffiliation.delete({ where: { id: row.id } });
  });

  return { ok: true };
}

export type DecideAffiliationInput = {
  action: "verify" | "reject";
  note?: string;
};

export async function decideAffiliation(
  actorId: string,
  affiliationId: string,
  input: DecideAffiliationInput,
): Promise<
  | { ok: true; affiliation: OrgAffiliationWithOrg }
  | { ok: false; code: "NOT_FOUND" | "INVALID_STATUS" }
> {
  const row = await prisma.orgAffiliation.findUnique({ where: { id: affiliationId } });
  if (!row) return { ok: false, code: "NOT_FOUND" };
  if (row.status !== "PENDING") return { ok: false, code: "INVALID_STATUS" };

  const status: OrgAffiliationStatus = input.action === "verify" ? "VERIFIED" : "REJECTED";
  const auditAction = input.action === "verify" ? "VERIFY" : "REJECT";
  const note = input.note?.trim() || null;

  const affiliation = await prisma.$transaction(async (tx) => {
    const updated = await tx.orgAffiliation.update({
      where: { id: affiliationId },
      data: {
        status,
        verifiedAt: input.action === "verify" ? new Date() : null,
        verifiedById: input.action === "verify" ? actorId : null,
        rejectReason: input.action === "reject" ? note : null,
      },
      include: affiliationInclude,
    });
    await tx.orgAffiliationAuditLog.create({
      data: {
        affiliationId,
        actorId,
        action: auditAction,
        note,
      },
    });
    return updated;
  });

  return { ok: true, affiliation };
}

export function serializeAffiliation(row: OrgAffiliationWithOrg) {
  return {
    id: row.id,
    status: row.status,
    title: row.title,
    claimedAt: row.claimedAt.toISOString(),
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    rejectReason: row.rejectReason,
    organization: {
      id: row.organization.id,
      jurisdiction: row.organization.jurisdiction,
      corporateNumber: row.organization.corporateNumber,
      corporateNumberDisplay: formatCorporateNumberDisplay(row.organization.corporateNumber),
      legalName: row.organization.legalName,
    },
  };
}
