import type { CommitteeMembershipDesiredRole, ModuleRoleType } from "@os-community/db";

export function isAutoApprovedModuleRole(role: ModuleRoleType): boolean {
  return role === "CONTRIBUTOR";
}

export function isAutoApprovedCommitteeMembershipRole(role: CommitteeMembershipDesiredRole): boolean {
  return role === "MEMBER";
}
