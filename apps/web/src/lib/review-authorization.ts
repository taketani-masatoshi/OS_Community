import type {
  CommitteeMembershipDesiredRole,
  ModuleRoleType,
  SiteRole,
} from "@os-community/db";
import { prisma } from "@/lib/prisma";

export async function getCommitteeMemberRole(
  userId: string,
  committeeId: string,
): Promise<"CHAIR" | "REVIEWER" | "MEMBER" | "OBSERVER" | null> {
  const row = await prisma.committeeMember.findUnique({
    where: { committeeId_userId: { committeeId, userId } },
    select: { role: true },
  });
  return row?.role ?? null;
}

export async function isCommitteeChair(userId: string, committeeId: string): Promise<boolean> {
  return (await getCommitteeMemberRole(userId, committeeId)) === "CHAIR";
}

export async function isCommitteeReviewer(userId: string, committeeId: string): Promise<boolean> {
  const role = await getCommitteeMemberRole(userId, committeeId);
  return role === "CHAIR" || role === "REVIEWER";
}

export async function getModuleCommitteeId(moduleId: string): Promise<string | null> {
  const committee = await prisma.committee.findUnique({
    where: { moduleId },
    select: { id: true },
  });
  return committee?.id ?? null;
}

function isSiteAdmin(siteRole: SiteRole): boolean {
  return siteRole === "ADMIN";
}

export async function canReviewModuleRoleRequest(
  userId: string,
  siteRole: SiteRole,
  moduleId: string,
  requestedRole: ModuleRoleType,
): Promise<boolean> {
  if (isSiteAdmin(siteRole)) return true;

  const committeeId = await getModuleCommitteeId(moduleId);
  if (!committeeId) return false;

  const memberRole = await getCommitteeMemberRole(userId, committeeId);
  if (memberRole === "CHAIR") return true;
  if (memberRole === "REVIEWER" && requestedRole !== "MAINTAINER") return true;
  return false;
}

export async function canReviewCommitteeMembershipRequest(
  userId: string,
  siteRole: SiteRole,
  committeeId: string,
  desiredRole: CommitteeMembershipDesiredRole,
): Promise<boolean> {
  if (isSiteAdmin(siteRole)) return true;

  const memberRole = await getCommitteeMemberRole(userId, committeeId);
  if (memberRole === "CHAIR") return true;
  if (memberRole === "REVIEWER" && desiredRole === "MEMBER") return true;
  return false;
}

export async function listReviewableCommitteeSlugs(userId: string, siteRole: SiteRole) {
  if (isSiteAdmin(siteRole)) {
    return prisma.committee.findMany({
      select: { slug: true, name: true, type: true },
      orderBy: { slug: "asc" },
    });
  }

  const memberships = await prisma.committeeMember.findMany({
    where: {
      userId,
      role: { in: ["CHAIR", "REVIEWER"] },
    },
    include: {
      committee: { select: { slug: true, name: true, type: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map((m) => m.committee);
}

export async function canAccessCommitteeReviewPage(
  userId: string,
  siteRole: SiteRole,
  committee: { id: string },
): Promise<boolean> {
  if (isSiteAdmin(siteRole)) return true;
  const memberRole = await getCommitteeMemberRole(userId, committee.id);
  return memberRole === "CHAIR" || memberRole === "REVIEWER";
}

export async function filterReviewableModuleRoleRequests<
  T extends { moduleId: string; role: ModuleRoleType },
>(userId: string, siteRole: SiteRole, requests: T[]): Promise<T[]> {
  const results: T[] = [];
  for (const request of requests) {
    if (await canReviewModuleRoleRequest(userId, siteRole, request.moduleId, request.role)) {
      results.push(request);
    }
  }
  return results;
}

export async function filterReviewableCommitteeMembershipRequests<
  T extends { committeeId: string; desiredRole: CommitteeMembershipDesiredRole },
>(userId: string, siteRole: SiteRole, requests: T[]): Promise<T[]> {
  const results: T[] = [];
  for (const request of requests) {
    if (
      await canReviewCommitteeMembershipRequest(
        userId,
        siteRole,
        request.committeeId,
        request.desiredRole,
      )
    ) {
      results.push(request);
    }
  }
  return results;
}
