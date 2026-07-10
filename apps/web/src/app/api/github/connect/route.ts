import { requireProfileCompleteApi, requireGitHubLoginApi } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";
import { githubRepoExists, parseGithubRepoUrl } from "@/lib/github-repo-url";
import { readJsonBody } from "@/lib/api-body";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authResult = await requireProfileCompleteApi();
  if ("error" in authResult) return authResult.error;

  const githubResult = await requireGitHubLoginApi();
  if ("error" in githubResult) return githubResult.error;
  const session = githubResult.session;

  const bodyResult = await readJsonBody<{ repoUrl?: string }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  const body = bodyResult;

  const parsed = parseGithubRepoUrl(body.repoUrl ?? "");
  if (!parsed) {
    return apiErrorResponse("INVALID_REPO_URL", 400);
  }

  let exists = false;
  try {
    exists = await githubRepoExists(parsed.owner, parsed.name);
  } catch {
    return apiErrorResponse("GITHUB_UNAVAILABLE", 503);
  }
  if (!exists) {
    return apiErrorResponse("REPO_NOT_FOUND", 404);
  }

  const count = await prisma.gitHubConnection.count({ where: { userId: session.user.id } });

  await prisma.gitHubConnection.upsert({
    where: { userId_repoUrl: { userId: session.user.id, repoUrl: parsed.repoUrl } },
    create: {
      userId: session.user.id,
      repoUrl: parsed.repoUrl,
      repoOwner: parsed.owner,
      repoName: parsed.name,
      isDefault: count === 0,
    },
    update: {
      repoOwner: parsed.owner,
      repoName: parsed.name,
    },
  });

  return Response.json({ ok: true, repoUrl: parsed.repoUrl });
}
