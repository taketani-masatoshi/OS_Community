import type { SiteRole } from "@os-community/db";

export const DEFAULT_CLAIMS_REFRESH_MS = 5 * 60 * 1000;

export type TokenClaims = {
  siteRole: SiteRole;
  githubLogin: string | null;
  publicSlug: string | null;
  primaryEmail: string | null;
  profileComplete: boolean;
  emailLoginConnected: boolean;
  linkedinConnected: boolean;
  githubAccountLinked: boolean;
  githubReposConnected: boolean;
};

export function getClaimsRefreshMs(): number {
  const raw = process.env.AUTH_CLAIMS_REFRESH_MS;
  if (!raw) return DEFAULT_CLAIMS_REFRESH_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CLAIMS_REFRESH_MS;
}

export function shouldReloadTokenClaims(
  token: Record<string, unknown>,
  user?: { id?: string },
  trigger?: "signIn" | "signUp" | "update",
  now = Date.now(),
): boolean {
  if (Boolean(user?.id) || trigger === "signIn" || trigger === "signUp" || trigger === "update") {
    return true;
  }
  if (token.siteRole === undefined) return true;

  const refreshedAt = token.claimsRefreshedAt;
  if (typeof refreshedAt !== "number") return true;

  return now - refreshedAt >= getClaimsRefreshMs();
}

export function applyTokenClaims(
  token: Record<string, unknown>,
  claims: TokenClaims,
  refreshedAt = Date.now(),
): void {
  token.siteRole = claims.siteRole;
  token.githubLogin = claims.githubLogin;
  token.publicSlug = claims.publicSlug;
  token.primaryEmail = claims.primaryEmail;
  token.profileComplete = claims.profileComplete;
  token.emailLoginConnected = claims.emailLoginConnected;
  token.linkedinConnected = claims.linkedinConnected;
  token.githubAccountLinked = claims.githubAccountLinked;
  token.githubReposConnected = claims.githubReposConnected;
  token.claimsRefreshedAt = refreshedAt;
}
