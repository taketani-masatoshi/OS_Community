import type { SiteRole } from "@os-community/db";

export const ALLOWED_SITE_ROLES: SiteRole[] = [
  "GUEST",
  "MEMBER",
  "CONTRIBUTOR",
  "MAINTAINER",
  "DEPUTY",
  "ADMIN",
  "CERT_REVIEWER",
];

export const ADMIN_USERS_PAGE_SIZE = 20;

export type RoleChangeErrorCode =
  | "INVALID_ROLE"
  | "USER_NOT_FOUND"
  | "LAST_ADMIN"
  | "INVALID_JSON";

export type StatusChangeErrorCode =
  | "USER_NOT_FOUND"
  | "LAST_ADMIN"
  | "ALREADY_SUSPENDED"
  | "NOT_SUSPENDED"
  | "ALREADY_DELETED"
  | "CANNOT_SELF_SUSPEND"
  | "CANNOT_SELF_DELETE"
  | "INVALID_ACTION"
  | "INVALID_JSON";

export type StatusAuditAction = "SUSPEND" | "RESTORE" | "DELETE";

export type RoleChangeResult =
  | { ok: true; user: { id: string; siteRole: SiteRole }; changed: boolean }
  | { ok: false; code: RoleChangeErrorCode };

export function isAllowedSiteRole(value: unknown): value is SiteRole {
  return typeof value === "string" && ALLOWED_SITE_ROLES.includes(value as SiteRole);
}

export type SiteRoleChangeEvaluation =
  | { ok: false; code: RoleChangeErrorCode }
  | { ok: true; changed: false }
  | { ok: true; changed: true };

export function evaluateSiteRoleChange(input: {
  targetCurrentRole: SiteRole;
  newRole: SiteRole;
  adminCount: number;
}): SiteRoleChangeEvaluation {
  if (!isAllowedSiteRole(input.newRole)) {
    return { ok: false, code: "INVALID_ROLE" };
  }
  if (input.newRole === input.targetCurrentRole) {
    return { ok: true, changed: false };
  }
  if (input.targetCurrentRole === "ADMIN" && input.newRole !== "ADMIN" && input.adminCount <= 1) {
    return { ok: false, code: "LAST_ADMIN" };
  }
  return { ok: true, changed: true };
}

export function roleChangeHttpStatus(code: RoleChangeErrorCode): number {
  switch (code) {
    case "USER_NOT_FOUND":
      return 404;
    case "INVALID_ROLE":
    case "INVALID_JSON":
      return 400;
    case "LAST_ADMIN":
      return 409;
    default:
      return 400;
  }
}

export function statusChangeHttpStatus(code: StatusChangeErrorCode): number {
  switch (code) {
    case "USER_NOT_FOUND":
    case "ALREADY_DELETED":
      return 404;
    case "LAST_ADMIN":
    case "ALREADY_SUSPENDED":
    case "NOT_SUSPENDED":
    case "CANNOT_SELF_SUSPEND":
    case "CANNOT_SELF_DELETE":
      return 409;
    case "INVALID_ACTION":
    case "INVALID_JSON":
      return 400;
    default:
      return 400;
  }
}

export type StatusChangeResult =
  | { ok: true; userId: string; action: StatusAuditAction }
  | { ok: false; code: StatusChangeErrorCode };

export function evaluateUserStatusChange(input: {
  actorId: string;
  targetUserId: string;
  targetCurrentRole: SiteRole;
  targetAccountStatus: "ACTIVE" | "SUSPENDED";
  targetDeleted: boolean;
  adminCount: number;
  action: StatusAuditAction;
}): StatusChangeResult | { ok: true; noop: true } {
  if (input.targetDeleted) {
    return { ok: false, code: "ALREADY_DELETED" };
  }
  if (input.action === "DELETE") {
    if (input.actorId === input.targetUserId) {
      return { ok: false, code: "CANNOT_SELF_DELETE" };
    }
    if (input.targetCurrentRole === "ADMIN" && input.adminCount <= 1) {
      return { ok: false, code: "LAST_ADMIN" };
    }
    return { ok: true, userId: input.targetUserId, action: "DELETE" };
  }
  if (input.action === "SUSPEND") {
    if (input.actorId === input.targetUserId) {
      return { ok: false, code: "CANNOT_SELF_SUSPEND" };
    }
    if (input.targetCurrentRole === "ADMIN" && input.adminCount <= 1) {
      return { ok: false, code: "LAST_ADMIN" };
    }
    if (input.targetAccountStatus === "SUSPENDED") {
      return { ok: true, noop: true };
    }
    return { ok: true, userId: input.targetUserId, action: "SUSPEND" };
  }
  if (input.action === "RESTORE") {
    if (input.targetAccountStatus === "ACTIVE") {
      return { ok: true, noop: true };
    }
    return { ok: true, userId: input.targetUserId, action: "RESTORE" };
  }
  return { ok: false, code: "INVALID_ACTION" };
}

export function resolveAdminListPage(requestedPage: number, total: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  return { page, totalPages, pageClamped: page !== requestedPage };
}
