import { prisma } from "@/lib/prisma";
import type { ModuleType } from "@os-community/db";

export async function getModules(filter?: { type?: ModuleType; wildOnly?: boolean }) {
  return prisma.module.findMany({
    where: {
      ...(filter?.type ? { moduleType: filter.type } : {}),
      ...(filter?.wildOnly ? { trustLevel: "WILD" } : {}),
    },
    include: {
      roles: {
        include: { user: { select: { id: true, name: true, image: true, githubLogin: true } } },
      },
    },
    orderBy: [{ moduleType: "asc" }, { slug: "asc" }],
  });
}

export async function getModuleBySlug(slug: string) {
  return prisma.module.findUnique({
    where: { slug },
    include: {
      roles: {
        include: { user: { select: { id: true, name: true, image: true, githubLogin: true } } },
      },
      roleRequests: {
        where: { status: "PENDING" },
        include: { user: { select: { id: true, name: true, githubLogin: true } } },
      },
    },
  });
}

import { githubApiHeaders } from "@/lib/github-api";

export async function getLatestGitHubTag(repoUrl: string): Promise<string | null> {
  try {
    const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
    if (!match) return null;
    const [, owner, repo] = match;
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`, {
      headers: githubApiHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const tags = (await res.json()) as { name: string }[];
    return tags[0]?.name ?? null;
  } catch {
    return null;
  }
}
