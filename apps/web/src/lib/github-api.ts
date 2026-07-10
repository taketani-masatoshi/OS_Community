const GITHUB_API_VERSION = "2022-11-28";

export function githubApiHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };
  const resolved = token ?? process.env.GITHUB_TOKEN;
  if (resolved) {
    headers.Authorization = `Bearer ${resolved}`;
  }
  return headers;
}

export async function githubApiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const { token, ...init } = options;
  const url = path.startsWith("https://") ? path : `https://api.github.com${path}`;
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...githubApiHeaders(token),
        ...(init.headers as Record<string, string> | undefined),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, status: res.status, data: null, error: body || res.statusText };
    }
    if (res.status === 204) {
      return { ok: true, status: res.status, data: null };
    }
    const data = (await res.json()) as T;
    return { ok: true, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err instanceof Error ? err.message : "fetch failed",
    };
  }
}
