import { cache } from "react";
import { NextResponse } from "next/server";
import type { SiteRole } from "@os-community/db";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isDatabaseAvailable, isPrismaConnectionError } from "@/lib/db-health";
import { isProfileComplete } from "@/lib/user-profile";

type AppSession = Session & {
  user: Session["user"] & {
    id: string;
    siteRole?: SiteRole | string | null;
    profileComplete?: boolean;
    primaryEmail?: string | null;
  };
};

const getAuthAccountStatus = cache(async (userId: string) => {
  return prisma.user
    .findUnique({
      where: { id: userId },
      select: {
        accountStatus: true,
        deletedAt: true,
        siteRole: true,
        profileCompletedAt: true,
        specialty: true,
        region: true,
      },
    })
    .catch((error) => {
      if (isPrismaConnectionError(error)) {
        return null;
      }
      throw error;
    });
});

async function syncSessionRoleFromDb(session: AppSession): Promise<AppSession> {
  const dbUser = await getAuthAccountStatus(session.user.id);
  if (dbUser?.siteRole) {
    session.user.siteRole = dbUser.siteRole;
  }
  if (dbUser) {
    session.user.profileComplete = isProfileComplete(dbUser);
  }
  return session;
}

/** Session with siteRole loaded from DB (JWT may lag up to AUTH_CLAIMS_REFRESH_MS). */
export async function getAuthSession(): Promise<AppSession | null> {
  const session = (await auth()) as AppSession | null;
  if (!session?.user?.id) return null;
  return syncSessionRoleFromDb(session);
}

export async function requireAuth(returnTo?: string) {
  const session = (await auth()) as AppSession | null;
  if (!session?.user?.id) {
    redirect(returnTo ? `/login?callbackUrl=${encodeURIComponent(returnTo)}` : "/login");
  }
  await syncSessionRoleFromDb(session);
  const dbUser = await getAuthAccountStatus(session.user.id);
  if (dbUser && (dbUser.deletedAt || dbUser.accountStatus === "SUSPENDED")) {
    redirect("/login?error=AccountSuspended");
  }
  return session;
}

export async function requireAuthApi() {
  const session = (await auth()) as AppSession | null;
  if (!session?.user?.id) {
    return { error: await apiErrorResponse("UNAUTHORIZED", 401) };
  }

  const dbUser = await getAuthAccountStatus(session.user.id);

  if (dbUser === null) {
    return { error: await apiErrorResponse("DATABASE_UNAVAILABLE", 503) };
  }

  if (!dbUser || dbUser.deletedAt) {
    return { error: await apiErrorResponse("ACCOUNT_DELETED", 403) };
  }
  if (dbUser.accountStatus === "SUSPENDED") {
    return { error: await apiErrorResponse("ACCOUNT_SUSPENDED", 403) };
  }
  session.user.siteRole = dbUser.siteRole;
  session.user.profileComplete = isProfileComplete(dbUser);
  return { session };
}

export async function requireProfileCompleteApi() {
  const result = await requireAuthApi();
  if ("error" in result) return result;

  const profile = await prisma.user
    .findUnique({
      where: { id: result.session.user.id },
      select: { profileCompletedAt: true, specialty: true, region: true },
    })
    .catch((error) => {
      if (isPrismaConnectionError(error)) {
        return "unavailable" as const;
      }
      throw error;
    });

  if (profile === "unavailable") {
    return { error: await apiErrorResponse("DATABASE_UNAVAILABLE", 503) };
  }

  const complete = profile ? isProfileComplete(profile) : false;
  result.session.user.profileComplete = complete;

  if (!complete) {
    return { error: await apiErrorResponse("PROFILE_INCOMPLETE", 403) };
  }
  return result;
}

/** Linked GitHub account required (Technical layer baseline). */
export async function requireGitHubLoginApi() {
  const result = await requireAuthApi();
  if ("error" in result) return result;
  if (!result.session.user.githubLogin) {
    return { error: await apiErrorResponse("GITHUB_LOGIN_REQUIRED", 403) };
  }
  return result;
}

export async function requireRole(roles: SiteRole[], returnTo?: string) {
  const session = await requireAuth(returnTo);
  if (!roles.includes(session.user.siteRole)) {
    redirect("/");
  }
  return session;
}

export async function requireRoleApi(roles: SiteRole[]) {
  const result = await requireAuthApi();
  if ("error" in result) return result;
  if (!roles.includes(result.session.user.siteRole)) {
    return { error: await apiErrorResponse("FORBIDDEN", 403) };
  }
  return result;
}

export function isAdmin(role: SiteRole) {
  return role === "ADMIN";
}

export function canReviewCerts(role: SiteRole) {
  return role === "ADMIN" || role === "CERT_REVIEWER";
}

/** Server pages that need DB should call this before Prisma-heavy rendering. */
export async function ensureDatabaseForPage(): Promise<boolean> {
  return isDatabaseAvailable();
}
