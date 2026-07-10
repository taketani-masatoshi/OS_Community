import { describe, it, expect } from "vitest";
import type { SiteRole } from "@os-community/db";
import {
  ALLOWED_SITE_ROLES,
  evaluateSiteRoleChange,
  evaluateUserStatusChange,
  isAllowedSiteRole,
  resolveAdminListPage,
  roleChangeHttpStatus,
} from "./admin-users-shared";

describe("isAllowedSiteRole", () => {
  it("accepts all schema roles", () => {
    for (const role of ALLOWED_SITE_ROLES) {
      expect(isAllowedSiteRole(role)).toBe(true);
    }
  });

  it("rejects invalid values", () => {
    expect(isAllowedSiteRole("SUPERADMIN")).toBe(false);
    expect(isAllowedSiteRole("admin")).toBe(false);
    expect(isAllowedSiteRole(null)).toBe(false);
  });
});

describe("evaluateSiteRoleChange", () => {
  it("allows noop when role unchanged", () => {
    expect(
      evaluateSiteRoleChange({
        targetCurrentRole: "MEMBER",
        newRole: "MEMBER",
        adminCount: 1,
      }),
    ).toEqual({ ok: true, changed: false });
  });

  it("blocks demoting the last admin", () => {
    expect(
      evaluateSiteRoleChange({
        targetCurrentRole: "ADMIN",
        newRole: "MEMBER",
        adminCount: 1,
      }),
    ).toEqual({ ok: false, code: "LAST_ADMIN" });
  });

  it("allows demoting admin when another admin exists", () => {
    expect(
      evaluateSiteRoleChange({
        targetCurrentRole: "ADMIN",
        newRole: "MEMBER",
        adminCount: 2,
      }),
    ).toEqual({ ok: true, changed: true });
  });

  it("allows promoting member to admin", () => {
    expect(
      evaluateSiteRoleChange({
        targetCurrentRole: "MEMBER",
        newRole: "ADMIN",
        adminCount: 1,
      }),
    ).toEqual({ ok: true, changed: true });
  });

  it("rejects invalid role", () => {
    expect(
      evaluateSiteRoleChange({
        targetCurrentRole: "MEMBER",
        newRole: "INVALID" as SiteRole,
        adminCount: 1,
      }),
    ).toEqual({ ok: false, code: "INVALID_ROLE" });
  });
});

describe("resolveAdminListPage", () => {
  it("clamps out-of-range page to last page", () => {
    expect(resolveAdminListPage(999, 1, 20)).toEqual({
      page: 1,
      totalPages: 1,
      pageClamped: true,
    });
  });

  it("keeps in-range page unchanged", () => {
    expect(resolveAdminListPage(1, 25, 20)).toEqual({
      page: 1,
      totalPages: 2,
      pageClamped: false,
    });
  });
});

describe("evaluateUserStatusChange", () => {
  it("blocks self suspend", () => {
    expect(
      evaluateUserStatusChange({
        actorId: "u1",
        targetUserId: "u1",
        targetCurrentRole: "MEMBER",
        targetAccountStatus: "ACTIVE",
        targetDeleted: false,
        adminCount: 1,
        action: "SUSPEND",
      }),
    ).toEqual({ ok: false, code: "CANNOT_SELF_SUSPEND" });
  });

  it("blocks deleting last admin", () => {
    expect(
      evaluateUserStatusChange({
        actorId: "u2",
        targetUserId: "u1",
        targetCurrentRole: "ADMIN",
        targetAccountStatus: "ACTIVE",
        targetDeleted: false,
        adminCount: 1,
        action: "DELETE",
      }),
    ).toEqual({ ok: false, code: "LAST_ADMIN" });
  });

  it("allows restore when suspended", () => {
    expect(
      evaluateUserStatusChange({
        actorId: "u2",
        targetUserId: "u1",
        targetCurrentRole: "MEMBER",
        targetAccountStatus: "SUSPENDED",
        targetDeleted: false,
        adminCount: 1,
        action: "RESTORE",
      }),
    ).toEqual({ ok: true, userId: "u1", action: "RESTORE" });
  });
});

describe("roleChangeHttpStatus", () => {
  it("maps error codes to HTTP statuses", () => {
    expect(roleChangeHttpStatus("USER_NOT_FOUND")).toBe(404);
    expect(roleChangeHttpStatus("LAST_ADMIN")).toBe(409);
    expect(roleChangeHttpStatus("INVALID_ROLE")).toBe(400);
    expect(roleChangeHttpStatus("INVALID_JSON")).toBe(400);
  });
});
