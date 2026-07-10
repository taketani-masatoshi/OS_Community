import { describe, expect, it } from "vitest";
import {
  isAutoApprovedCommitteeMembershipRole,
  isAutoApprovedModuleRole,
} from "@/lib/membership-auto-approval";

describe("membership auto-approval policy", () => {
  it("auto-approves module contributor (view-only member)", () => {
    expect(isAutoApprovedModuleRole("CONTRIBUTOR")).toBe(true);
    expect(isAutoApprovedModuleRole("DEPUTY")).toBe(false);
    expect(isAutoApprovedModuleRole("MAINTAINER")).toBe(false);
  });

  it("auto-approves committee member applications only", () => {
    expect(isAutoApprovedCommitteeMembershipRole("MEMBER")).toBe(true);
    expect(isAutoApprovedCommitteeMembershipRole("REVIEWER")).toBe(false);
  });
});
