import { describe, expect, it, vi, beforeEach } from "vitest";
import type { CommitteeMembershipDesiredRole, ModuleRoleType, SiteRole } from "@os-community/db";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    committeeMember: {
      findUnique: vi.fn(),
    },
    committee: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  canAccessCommitteeReviewPage,
  canReviewCommitteeMembershipRequest,
  canReviewModuleRoleRequest,
  getCommitteeMemberRole,
} from "@/lib/review-authorization";

describe("review-authorization", () => {
  beforeEach(() => {
    vi.mocked(prisma.committeeMember.findUnique).mockReset();
    vi.mocked(prisma.committee.findUnique).mockReset();
  });

  it("returns committee member role from database", async () => {
    vi.mocked(prisma.committeeMember.findUnique).mockResolvedValue({ role: "REVIEWER" } as never);
    await expect(getCommitteeMemberRole("u1", "c1")).resolves.toBe("REVIEWER");
  });

  it("allows site admin to review any module role", async () => {
    const siteRole: SiteRole = "ADMIN";
    await expect(
      canReviewModuleRoleRequest("u1", siteRole, "mod1", "MAINTAINER" as ModuleRoleType),
    ).resolves.toBe(true);
  });

  it("allows committee chair to review maintainer requests", async () => {
    vi.mocked(prisma.committee.findUnique).mockResolvedValue({ id: "committee-1" } as never);
    vi.mocked(prisma.committeeMember.findUnique).mockResolvedValue({ role: "CHAIR" } as never);

    await expect(
      canReviewModuleRoleRequest("u1", "MEMBER", "mod1", "MAINTAINER" as ModuleRoleType),
    ).resolves.toBe(true);
  });

  it("denies module role review without committee membership", async () => {
    vi.mocked(prisma.committee.findUnique).mockResolvedValue({ id: "committee-1" } as never);
    vi.mocked(prisma.committeeMember.findUnique).mockResolvedValue(null);

    await expect(
      canReviewModuleRoleRequest("u1", "MEMBER", "mod1", "CONTRIBUTOR" as ModuleRoleType),
    ).resolves.toBe(false);
  });

  it("allows reviewer to approve member applications only", async () => {
    vi.mocked(prisma.committeeMember.findUnique).mockResolvedValue({ role: "REVIEWER" } as never);

    await expect(
      canReviewCommitteeMembershipRequest(
        "u1",
        "MEMBER",
        "c1",
        "MEMBER" as CommitteeMembershipDesiredRole,
      ),
    ).resolves.toBe(true);
    await expect(
      canReviewCommitteeMembershipRequest(
        "u1",
        "MEMBER",
        "c1",
        "REVIEWER" as CommitteeMembershipDesiredRole,
      ),
    ).resolves.toBe(false);
  });

  it("grants review page access to chair without module maintainer fallback", async () => {
    vi.mocked(prisma.committeeMember.findUnique).mockResolvedValue({ role: "CHAIR" } as never);

    await expect(
      canAccessCommitteeReviewPage("u1", "MEMBER", { id: "c1" }),
    ).resolves.toBe(true);
  });

  it("denies review page access to module maintainers without committee role", async () => {
    vi.mocked(prisma.committeeMember.findUnique).mockResolvedValue(null);

    await expect(
      canAccessCommitteeReviewPage("u1", "MEMBER", { id: "c1" }),
    ).resolves.toBe(false);
  });
});
