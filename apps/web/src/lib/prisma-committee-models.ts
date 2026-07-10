import { prisma } from "@/lib/prisma";

type PrismaWithCommitteeModels = typeof prisma & {
  committeeMembershipRequest?: { findMany?: unknown; create?: unknown };
  committeeReviewAuditLog?: { create?: unknown };
  committeeChairNomination?: { findMany?: unknown; create?: unknown };
};

/** Prisma Client が委員会参加申請モデルを含むか（generate/push 前の graceful 判定） */
export function isCommitteeMembershipRequestAvailable(): boolean {
  const client = prisma as PrismaWithCommitteeModels;
  return typeof client.committeeMembershipRequest?.findMany === "function";
}

export function isCommitteeReviewAuditLogAvailable(): boolean {
  const client = prisma as PrismaWithCommitteeModels;
  return typeof client.committeeReviewAuditLog?.create === "function";
}

export function isCommitteeChairNominationAvailable(): boolean {
  const client = prisma as PrismaWithCommitteeModels;
  return typeof client.committeeChairNomination?.findMany === "function";
}
