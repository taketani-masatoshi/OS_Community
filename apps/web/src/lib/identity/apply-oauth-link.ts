import { prisma } from "@/lib/prisma";
import { ensurePublicSlug } from "@/lib/identity/slug";
import { upsertProfessionalProfile } from "@/lib/identity/professional-profile";

export async function applySecondaryOAuthLinkToPrimary(
  primaryUserId: string,
  provider: "github" | "linkedin",
  account: { providerAccountId: string },
  profile: unknown,
): Promise<void> {
  if (provider === "github" && profile && typeof profile === "object" && "login" in profile) {
    const githubLogin = profile.login as string;
    await prisma.user.update({
      where: { id: primaryUserId },
      data: { githubLogin },
    });
    await ensurePublicSlug(primaryUserId, { githubLogin });
    return;
  }

  if (provider === "linkedin" && profile) {
    const p = profile as Record<string, unknown>;
    const vanityName = typeof p.vanityName === "string" ? p.vanityName : null;
    await upsertProfessionalProfile(primaryUserId, {
      linkedinId: String(p.sub ?? account.providerAccountId),
      vanityName,
      headline: typeof p.headline === "string" ? p.headline : null,
      organization: typeof p.organization === "string" ? p.organization : null,
      profileUrl: vanityName != null ? `https://www.linkedin.com/in/${vanityName}` : null,
      rawProfile: p,
    });
  }
}

export function oauthLinkRedirectPath(provider: "github" | "linkedin"): string {
  return provider === "github" ? "/settings/connections?linked=github" : "/settings/connections?linked=1";
}
