import type { SiteRole } from "@os-community/db";
import { prisma } from "@/lib/prisma";
import {
  canAccessCommitteeReviewPage,
  filterReviewableCommitteeMembershipRequests,
  filterReviewableModuleRoleRequests,
  listReviewableCommitteeSlugs,
} from "@/lib/review-authorization";
import { isCommitteeMembershipRequestAvailable } from "@/lib/prisma-committee-models";

type CommitteeRef = {
  id: string;
  slug: string;
  moduleId: string | null;
  type: "STANDARD" | "DOMAIN" | "MODULE";
};

export async function getPendingReviewCountForCommittee(
  userId: string,
  siteRole: SiteRole,
  committee: CommitteeRef,
): Promise<number> {
  const canAccess = await canAccessCommitteeReviewPage(userId, siteRole, committee);
  if (!canAccess || !isCommitteeMembershipRequestAvailable()) return 0;

  let count = 0;

  if (committee.moduleId) {
    const moduleRequests = await prisma.moduleRoleRequest.findMany({
      where: { moduleId: committee.moduleId, status: "PENDING" },
      select: { moduleId: true, role: true },
    });
    count += (
      await filterReviewableModuleRoleRequests(userId, siteRole, moduleRequests)
    ).length;
  }

  if (committee.type !== "MODULE") {
    const membershipRequests = await prisma.committeeMembershipRequest.findMany({
      where: { committeeId: committee.id, status: "PENDING" },
      select: { committeeId: true, desiredRole: true },
    });
    count += (
      await filterReviewableCommitteeMembershipRequests(userId, siteRole, membershipRequests)
    ).length;
  }

  const chairPending = await prisma.committeeChairNomination.count({
    where: { committeeId: committee.id, status: "PENDING" },
  }).catch(() => 0);
  if (chairPending > 0 && canAccess) {
    count += chairPending;
  }

  return count;
}

export async function getUserPendingReviewCount(userId: string, siteRole: SiteRole): Promise<number> {
  const committees = await listReviewableCommitteeSlugs(userId, siteRole);
  let total = 0;
  for (const committee of committees) {
    const full = await prisma.committee.findUnique({
      where: { slug: committee.slug },
      select: { id: true, slug: true, moduleId: true, type: true },
    });
    if (!full) continue;
    total += await getPendingReviewCountForCommittee(userId, siteRole, full);
  }
  return total;
}
