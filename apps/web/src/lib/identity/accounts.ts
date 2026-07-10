import { prisma } from "@/lib/prisma";

export type EmailLoginProvider = "google" | "microsoft";

const EMAIL_PROVIDERS: Record<string, EmailLoginProvider> = {
  google: "google",
  "microsoft-entra-id": "microsoft",
  azuread: "microsoft",
};

export type LinkedIdentity = {
  email: string | null;
  emailProvider: EmailLoginProvider | null;
  githubLinked: boolean;
  linkedinLinked: boolean;
  githubLogin: string | null;
  providers: string[];
  linkedin: {
    linkedinId: string | null;
    vanityName: string | null;
    headline: string | null;
    organization: string | null;
    profileUrl: string | null;
  } | null;
};

export async function getLinkedIdentity(userId: string): Promise<LinkedIdentity> {
  const [user, accounts, professional] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, githubLogin: true },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { provider: true },
    }),
    prisma.professionalProfile.findUnique({
      where: { userId },
      select: {
        linkedinId: true,
        vanityName: true,
        headline: true,
        organization: true,
        profileUrl: true,
      },
    }),
  ]);

  const providers = accounts.map((a) => a.provider);
  const emailProvider =
    providers.map((p) => EMAIL_PROVIDERS[p]).find((p): p is EmailLoginProvider => Boolean(p)) ?? null;

  return {
    email: user?.email ?? null,
    emailProvider,
    githubLinked: providers.includes("github"),
    linkedinLinked: Boolean(professional),
    githubLogin: user?.githubLogin ?? null,
    providers,
    linkedin: professional
      ? {
          linkedinId: professional.linkedinId,
          vanityName: professional.vanityName,
          headline: professional.headline,
          organization: professional.organization,
          profileUrl: professional.profileUrl,
        }
      : null,
  };
}

export function formatEmailProvider(provider: EmailLoginProvider | null): string {
  if (provider === "google") return "Google";
  if (provider === "microsoft") return "Microsoft";
  return "—";
}
