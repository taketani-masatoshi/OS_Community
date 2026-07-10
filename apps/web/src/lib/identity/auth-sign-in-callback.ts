import { mergeLegacyOAuthUserIntoPrimary } from "@/lib/identity/merge-oauth-account";
import {
  applySecondaryOAuthLinkToPrimary,
  oauthLinkRedirectPath,
} from "@/lib/identity/apply-oauth-link";
import { isPrimaryProviderId } from "@/lib/auth-env";
import { getAuthSessionUserId } from "@/lib/auth-session-cookie";
import { runAuthEvent } from "@/lib/identity/auth-jwt";

export function createSignInCallback() {
  return async function signIn({
    user,
    account,
    profile,
  }: {
    user?: { id?: string; email?: string | null };
    account?: { provider?: string; providerAccountId?: string } | null;
    profile?: unknown;
  }) {
    if (account?.provider && isPrimaryProviderId(account.provider)) {
      return true;
    }

    const provider = account?.provider;
    const isSecondary = provider === "github" || provider === "linkedin";
    if (!isSecondary) return true;

    const sessionUserId = await getAuthSessionUserId();

    if (!sessionUserId) {
      return `/login?error=SignInWithGoogleFirst&callbackUrl=${encodeURIComponent("/settings/connections")}`;
    }

    if (user?.id && user.id !== sessionUserId) {
      const profileEmail =
        profile && typeof profile === "object" && "email" in profile
          ? (profile.email as string | null)
          : null;
      const githubLogin =
        profile && typeof profile === "object" && "login" in profile
          ? (profile.login as string | null)
          : null;

      const mergeResult = await mergeLegacyOAuthUserIntoPrimary({
        primaryUserId: sessionUserId,
        legacyUserId: user.id,
        provider: provider as "github" | "linkedin",
        profileEmail,
        githubLogin,
      });

      if (!mergeResult.ok) {
        return "/login?error=OAuthAccountNotLinked";
      }

      await runAuthEvent("mergeOAuthLink", async () => {
        await applySecondaryOAuthLinkToPrimary(
          sessionUserId,
          provider as "github" | "linkedin",
          { providerAccountId: account!.providerAccountId ?? "" },
          profile,
        );
      });
      return oauthLinkRedirectPath(provider as "github" | "linkedin");
    }

    return true;
  };
}
