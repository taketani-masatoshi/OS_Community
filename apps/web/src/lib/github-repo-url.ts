import { githubApiHeaders } from "@/lib/github-api";

export function parseGithubRepoUrl(raw: string): { owner: string; name: string; repoUrl: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/github\.com[/:]([^/]+)\/([^/?#]+)/i);
  if (!match) return null;

  const owner = match[1];
  const name = match[2].replace(/\.git$/i, "");
  if (!owner || !name) return null;

  return {
    owner,
    name,
    repoUrl: `https://github.com/${owner}/${name}`,
  };
}

export async function githubRepoExists(owner: string, name: string): Promise<boolean> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers: githubApiHeaders(),
    next: { revalidate: 0 },
  });
  return res.ok;
}
