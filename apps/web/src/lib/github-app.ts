import { createSign } from "node:crypto";
import { githubApiFetch } from "@/lib/github-api";
import { prisma } from "@/lib/prisma";

export type GitHubAppConfig = {
  appId: string;
  privateKey: string;
  webhookSecret: string;
  appSlug: string;
  defaultOrg: string;
  installationId?: number;
};

export function isGitHubAppConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_APP_ID &&
      process.env.GITHUB_APP_PRIVATE_KEY &&
      process.env.GITHUB_APP_WEBHOOK_SECRET,
  );
}

export function getGitHubAppConfig(): GitHubAppConfig | null {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const webhookSecret = process.env.GITHUB_APP_WEBHOOK_SECRET;
  if (!appId || !privateKey || !webhookSecret) return null;

  const installationIdRaw = process.env.GITHUB_APP_INSTALLATION_ID;
  const installationId = installationIdRaw ? Number(installationIdRaw) : undefined;

  return {
    appId,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    webhookSecret,
    appSlug: process.env.GITHUB_APP_SLUG ?? "steward-os-community",
    defaultOrg: process.env.GITHUB_APP_ORG ?? "steward-os",
    installationId: Number.isFinite(installationId) ? installationId : undefined,
  };
}

export function createGitHubAppJwt(appId: string, privateKeyPem: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ iat: now - 60, exp: now + 600, iss: appId }),
  ).toString("base64url");
  const data = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(data);
  sign.end();
  const signature = sign.sign(privateKeyPem, "base64url");
  return `${data}.${signature}`;
}

export async function getInstallationAccessToken(installationId: number): Promise<string | null> {
  const config = getGitHubAppConfig();
  if (!config) return null;

  const jwt = createGitHubAppJwt(config.appId, config.privateKey);
  const result = await githubApiFetch<{ token: string }>(
    `/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      token: jwt,
    },
  );
  return result.data?.token ?? null;
}

export async function resolveInstallationId(): Promise<number | null> {
  const config = getGitHubAppConfig();
  if (!config) return null;
  if (config.installationId) return config.installationId;

  const stored = await prisma.gitHubAppInstallation.findFirst({
    where: { accountLogin: config.defaultOrg },
    orderBy: { updatedAt: "desc" },
  });
  if (stored) return stored.installationId;

  const jwt = createGitHubAppJwt(config.appId, config.privateKey);
  const result = await githubApiFetch<
    { id: number; account?: { login?: string; type?: string } }[]
  >("/app/installations", { token: jwt });

  const match = result.data?.find((item) => item.account?.login === config.defaultOrg);
  if (!match) return result.data?.[0]?.id ?? null;
  return match.id;
}

export async function getDefaultInstallationToken(): Promise<string | null> {
  const installationId = await resolveInstallationId();
  if (!installationId) return null;
  return getInstallationAccessToken(installationId);
}

export function getGitHubAppInstallUrl(): string | null {
  const config = getGitHubAppConfig();
  if (!config) return null;
  return `https://github.com/apps/${config.appSlug}/installations/new`;
}
