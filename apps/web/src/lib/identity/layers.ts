import { prisma } from "@/lib/prisma";

export type UserLayerStatus = {
  profileComplete: boolean;
  emailLoginConnected: boolean;
  linkedinConnected: boolean;
  githubAccountLinked: boolean;
  githubReposConnected: boolean;
  githubLogin: string | null;
  publicSlug: string | null;
  primaryEmail: string | null;
};

export async function getUserLayerStatus(userId: string): Promise<UserLayerStatus> {
  const [user, accounts, professional, githubRepoCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        githubLogin: true,
        publicSlug: true,
        profileCompletedAt: true,
        specialty: true,
        region: true,
      },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { provider: true },
    }),
    prisma.professionalProfile.findUnique({
      where: { userId },
      select: { id: true },
    }),
    prisma.gitHubConnection.count({ where: { userId } }),
  ]);

  const providers = accounts.map((a) => a.provider);
  const emailLoginConnected = providers.some(
    (p) => p === "google" || p === "microsoft-entra-id" || p === "azuread"
  );

  return {
    profileComplete: Boolean(
      user?.profileCompletedAt && user.specialty && user.region
    ),
    emailLoginConnected,
    linkedinConnected: Boolean(professional),
    githubAccountLinked: providers.includes("github"),
    githubReposConnected: githubRepoCount > 0,
    githubLogin: user?.githubLogin ?? null,
    publicSlug: user?.publicSlug ?? null,
    primaryEmail: user?.email ?? null,
  };
}
