import { prisma } from "@/lib/prisma";
import { ensurePublicSlug } from "@/lib/identity/slug";

const EMAIL_LOGIN_PROVIDERS = new Set(["google", "microsoft-entra-id", "azuread"]);
const SECONDARY_PROVIDERS = new Set(["github", "linkedin"]);

export type MergeOAuthAccountInput = {
  primaryUserId: string;
  legacyUserId: string;
  provider: "github" | "linkedin";
  profileEmail?: string | null;
  githubLogin?: string | null;
};

export type MergeOAuthAccountResult =
  | { ok: true; merged: true }
  | {
      ok: false;
      reason:
        | "same_user"
        | "email_mismatch"
        | "legacy_not_found"
        | "primary_not_found"
        | "no_conflicting_account"
        | "primary_not_email_login";
    };

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export function canMergeOAuthAccounts(input: {
  primaryEmail: string | null;
  legacyEmail: string | null;
  profileEmail?: string | null;
}): boolean {
  const primary = normalizeEmail(input.primaryEmail);
  if (!primary) return false;

  const candidates = [normalizeEmail(input.legacyEmail), normalizeEmail(input.profileEmail)].filter(
    (email): email is string => Boolean(email)
  );

  return candidates.some((email) => email === primary);
}

async function legacyUserIsSecondaryOnly(legacyUserId: string): Promise<boolean> {
  const accounts = await prisma.account.findMany({
    where: { userId: legacyUserId },
    select: { provider: true },
  });
  return (
    accounts.length > 0 &&
    accounts.every((account) => SECONDARY_PROVIDERS.has(account.provider))
  );
}

export async function mergeLegacyOAuthUserIntoPrimary(
  input: MergeOAuthAccountInput
): Promise<MergeOAuthAccountResult> {
  if (input.primaryUserId === input.legacyUserId) {
    return { ok: false, reason: "same_user" };
  }

  const [primary, legacy, legacyAccounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.primaryUserId },
      select: {
        id: true,
        email: true,
        githubLogin: true,
        accounts: { select: { provider: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: input.legacyUserId },
      select: {
        id: true,
        email: true,
        githubLogin: true,
        deletedAt: true,
      },
    }),
    prisma.account.findMany({
      where: { userId: input.legacyUserId, provider: input.provider },
      select: { id: true },
    }),
  ]);

  if (!primary) return { ok: false, reason: "primary_not_found" };
  if (!legacy || legacy.deletedAt) return { ok: false, reason: "legacy_not_found" };
  if (legacyAccounts.length === 0) return { ok: false, reason: "no_conflicting_account" };

  const primaryHasEmailLogin = primary.accounts.some((account) =>
    EMAIL_LOGIN_PROVIDERS.has(account.provider)
  );
  if (!primaryHasEmailLogin) {
    return { ok: false, reason: "primary_not_email_login" };
  }

  if (
    !canMergeOAuthAccounts({
      primaryEmail: primary.email,
      legacyEmail: legacy.email,
      profileEmail: input.profileEmail,
    }) &&
    !(await legacyUserIsSecondaryOnly(input.legacyUserId))
  ) {
    return { ok: false, reason: "email_mismatch" };
  }

  const githubLogin =
    input.githubLogin ?? legacy.githubLogin ?? primary.githubLogin ?? undefined;

  await prisma.$transaction(async (tx) => {
    await tx.account.updateMany({
      where: { userId: input.legacyUserId, provider: input.provider },
      data: { userId: input.primaryUserId },
    });

    if (input.provider === "github") {
      await tx.gitHubConnection.updateMany({
        where: { userId: input.legacyUserId },
        data: { userId: input.primaryUserId },
      });
    }

    if (input.provider === "linkedin") {
      const primaryHasLinkedIn = await tx.professionalProfile.findUnique({
        where: { userId: input.primaryUserId },
        select: { id: true },
      });
      if (!primaryHasLinkedIn) {
        await tx.professionalProfile.updateMany({
          where: { userId: input.legacyUserId },
          data: { userId: input.primaryUserId },
        });
      }
    }

    await tx.user.update({
      where: { id: input.primaryUserId },
      data: {
        githubLogin: githubLogin ?? undefined,
      },
    });

    const remainingLegacyAccounts = await tx.account.count({
      where: { userId: input.legacyUserId },
    });
    if (remainingLegacyAccounts === 0) {
      await tx.user.update({
        where: { id: input.legacyUserId },
        data: {
          deletedAt: new Date(),
          accountStatus: "SUSPENDED",
          email: null,
          githubLogin: null,
          publicSlug: null,
        },
      });
    }
  });

  if (githubLogin) {
    await ensurePublicSlug(input.primaryUserId, { githubLogin });
  }

  return { ok: true, merged: true };
}
