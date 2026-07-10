import { prisma } from "@/lib/prisma";
import { ensurePublicSlug } from "@/lib/identity/slug";
import { upsertProfessionalProfile } from "@/lib/identity/professional-profile";
import { isPrimaryProviderId } from "@/lib/auth-env";
import { runAuthEvent } from "@/lib/identity/auth-jwt";

export function createAuthEvents() {
  return {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: { id?: string; name?: string | null; email?: string | null };
      account?: { provider?: string } | null;
      profile?: unknown;
    }) {
      if (!user.id || !account?.provider) return;
      if (!isPrimaryProviderId(account.provider)) return;

      const profileName =
        profile && typeof profile === "object" && "name" in profile
          ? (profile.name as string | null)
          : null;

      await runAuthEvent("signIn", async () => {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
            name: user.name ?? profileName ?? undefined,
          },
        });
        await ensurePublicSlug(user.id!, { name: user.name ?? profileName });
      });
    },

    async linkAccount({
      user,
      account,
      profile,
    }: {
      user: { id?: string };
      account: { provider: string; providerAccountId: string };
      profile?: unknown;
    }) {
      if (!user.id) return;

      await runAuthEvent("linkAccount", async () => {
        if (
          account.provider === "github" &&
          profile &&
          typeof profile === "object" &&
          "login" in profile
        ) {
          await prisma.user.update({
            where: { id: user.id },
            data: { githubLogin: profile.login as string },
          });
          await ensurePublicSlug(user.id!, { githubLogin: profile.login as string });
        }

        if (account.provider === "linkedin" && profile) {
          const p = profile as Record<string, unknown>;
          const linkedinId = String(p.sub ?? account.providerAccountId);
          const vanityName = typeof p.vanityName === "string" ? p.vanityName : null;
          const profileUrl =
            vanityName != null ? `https://www.linkedin.com/in/${vanityName}` : null;

          await upsertProfessionalProfile(user.id!, {
            linkedinId,
            vanityName,
            headline: typeof p.headline === "string" ? p.headline : null,
            organization: typeof p.organization === "string" ? p.organization : null,
            profileUrl,
            rawProfile: p,
          });
        }
      });
    },
  };
}
