import type { GitHubPermissionLevel, Locale } from "@os-community/shared";
import { mergePermissionLevel, resolveLocale } from "@os-community/shared";
import { createHmac, timingSafeEqual } from "node:crypto";
import { githubApiFetch } from "@/lib/github-api";
import { parseGithubRepoUrl } from "@/lib/github-repo-url";
import {
  getDefaultInstallationToken,
  getGitHubAppConfig,
  isGitHubAppConfigured,
} from "@/lib/github-app";
import { consolidatePermissions, getUserPermissionRows } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const GITHUB_COLLABORATOR_PERMISSION: Record<GitHubPermissionLevel, string> = {
  read: "pull",
  triage: "triage",
  write: "push",
  maintain: "maintain",
  admin: "admin",
};

export function mapPermissionLevelToGitHub(level: GitHubPermissionLevel): string {
  return GITHUB_COLLABORATOR_PERMISSION[level];
}

export function verifyGitHubWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature?.startsWith("sha256=")) return false;
  const digest = createHmac("sha256", secret).update(payload).digest("hex");
  const expected = `sha256=${digest}`;
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

async function upsertGrantRecord(input: {
  userId: string;
  githubLogin: string;
  scope: string;
  target: string;
  level: string;
  sourceKey: string;
  status: string;
  lastError?: string | null;
}) {
  await prisma.gitHubPermissionGrant.upsert({
    where: {
      userId_scope_target_sourceKey: {
        userId: input.userId,
        scope: input.scope,
        target: input.target,
        sourceKey: input.sourceKey,
      },
    },
    create: {
      userId: input.userId,
      githubLogin: input.githubLogin,
      scope: input.scope,
      target: input.target,
      level: input.level,
      sourceKey: input.sourceKey,
      status: input.status,
      lastError: input.lastError ?? null,
      lastSyncedAt: new Date(),
    },
    update: {
      githubLogin: input.githubLogin,
      level: input.level,
      status: input.status,
      lastError: input.lastError ?? null,
      lastSyncedAt: new Date(),
    },
  });
}

async function provisionRepoCollaborator(
  token: string,
  repoUrl: string,
  githubLogin: string,
  level: GitHubPermissionLevel,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) {
    return { ok: false, error: "invalid repo url" };
  }

  const permission = mapPermissionLevelToGitHub(level);
  const result = await githubApiFetch<unknown>(
    `/repos/${parsed.owner}/${parsed.name}/collaborators/${githubLogin}`,
    {
      method: "PUT",
      token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permission }),
    },
  );

  if (result.ok || result.status === 201 || result.status === 204) {
    return { ok: true };
  }
  return { ok: false, error: result.error ?? `HTTP ${result.status}` };
}

export async function provisionUserGitHubPermissions(userId: string): Promise<{
  ok: boolean;
  granted: number;
  skipped: number;
  failed: number;
}> {
  if (!isGitHubAppConfigured()) {
    return { ok: false, granted: 0, skipped: 0, failed: 0 };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubLogin: true },
  });
  if (!user?.githubLogin) {
    return { ok: false, granted: 0, skipped: 0, failed: 0 };
  }

  const token = await getDefaultInstallationToken();
  if (!token) {
    return { ok: false, granted: 0, skipped: 0, failed: 0 };
  }

  const locale: Locale = resolveLocale(undefined);
  const rows = await getUserPermissionRows(userId, locale);
  const consolidated = consolidatePermissions(rows, locale);

  let granted = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of consolidated) {
    if (row.scope === "org") {
      await upsertGrantRecord({
        userId,
        githubLogin: user.githubLogin,
        scope: row.scope,
        target: row.target,
        level: row.level,
        sourceKey: `org:${row.target}`,
        status: "skipped",
        lastError: "Org-level provisioning is not automated yet",
      });
      skipped += 1;
      continue;
    }

    const result = await provisionRepoCollaborator(token, row.target, user.githubLogin, row.level);
    if (result.ok) {
      await upsertGrantRecord({
        userId,
        githubLogin: user.githubLogin,
        scope: row.scope,
        target: row.target,
        level: row.level,
        sourceKey: `repo:${row.target}`,
        status: "granted",
      });
      granted += 1;
    } else {
      await upsertGrantRecord({
        userId,
        githubLogin: user.githubLogin,
        scope: row.scope,
        target: row.target,
        level: row.level,
        sourceKey: `repo:${row.target}`,
        status: "failed",
        lastError: result.error,
      });
      failed += 1;
    }
  }

  return { ok: failed === 0, granted, skipped, failed };
}

export function triggerGitHubProvisioning(userId: string): void {
  if (!isGitHubAppConfigured()) return;
  void provisionUserGitHubPermissions(userId).catch((err) => {
    console.error("[github-provision]", userId, err);
  });
}

export async function upsertGitHubAppInstallation(input: {
  installationId: number;
  accountLogin: string;
  accountType: string;
}) {
  await prisma.gitHubAppInstallation.upsert({
    where: { installationId: input.installationId },
    create: input,
    update: {
      accountLogin: input.accountLogin,
      accountType: input.accountType,
    },
  });
}

export async function removeGitHubAppInstallation(installationId: number) {
  await prisma.gitHubAppInstallation.deleteMany({ where: { installationId } });
}

export function mergeRepoPermissionLevels(
  levels: GitHubPermissionLevel[],
): GitHubPermissionLevel {
  return levels.reduce((acc, level) => mergePermissionLevel(acc, level), "read" as GitHubPermissionLevel);
}

export { GITHUB_COLLABORATOR_PERMISSION };
