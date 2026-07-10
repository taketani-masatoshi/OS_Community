import { cache } from "react";
import type { SiteRole } from "@os-community/db";
import { prisma } from "@/lib/prisma";
import { getUserLayerStatus } from "@/lib/identity/layers";
import { isPrismaConnectionError } from "@/lib/db-health";
import {
  applyTokenClaims,
  shouldReloadTokenClaims,
  type TokenClaims,
} from "@/lib/auth-token-claims";

export const GUEST_TOKEN_CLAIMS = {
  siteRole: "GUEST" as SiteRole,
  githubLogin: null,
  publicSlug: null,
  primaryEmail: null,
  profileComplete: false,
  emailLoginConnected: false,
  linkedinConnected: false,
  githubAccountLinked: false,
  githubReposConnected: false,
};

export const loadUserTokenClaims = cache(async function loadUserTokenClaims(
  userId: string,
): Promise<TokenClaims | null> {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        siteRole: true,
        githubLogin: true,
        accountStatus: true,
        deletedAt: true,
        publicSlug: true,
        email: true,
      },
    });

    if (!dbUser || dbUser.deletedAt || dbUser.accountStatus === "SUSPENDED") {
      return GUEST_TOKEN_CLAIMS;
    }

    const layers = await getUserLayerStatus(userId);

    return {
      siteRole: dbUser.siteRole,
      githubLogin: dbUser.githubLogin,
      publicSlug: dbUser.publicSlug,
      primaryEmail: dbUser.email,
      profileComplete: layers.profileComplete,
      emailLoginConnected: layers.emailLoginConnected,
      linkedinConnected: layers.linkedinConnected,
      githubAccountLinked: layers.githubAccountLinked,
      githubReposConnected: layers.githubReposConnected,
    };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return null;
    }
    throw error;
  }
});

export async function runAuthEvent<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      console.error(`[auth] ${label}: database unavailable`);
      return undefined;
    }
    throw error;
  }
}

export function createJwtCallback() {
  return async function jwt({
    token,
    user,
    trigger,
  }: {
    token: Record<string, unknown>;
    user?: { id?: string };
    trigger?: "signIn" | "signUp" | "update";
  }) {
    if (user?.id) {
      token.sub = user.id;
    }
    if (!token.sub || typeof token.sub !== "string") return token;

    if (!shouldReloadTokenClaims(token, user, trigger)) return token;

    const claims = await loadUserTokenClaims(token.sub);
    if (!claims) return token;

    applyTokenClaims(token, claims);
    return token;
  };
}
