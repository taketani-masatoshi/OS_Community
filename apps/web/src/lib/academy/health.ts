export type AcademyHealth = {
  configured: boolean;
  reachable: boolean;
  latencyMs?: number;
  error?: string;
};

/** Ping Content API /ready when ACADEMY_API_URL is set. */
export async function checkAcademyHealth(): Promise<AcademyHealth> {
  const baseUrl = process.env.ACADEMY_API_URL?.trim();
  if (!baseUrl) {
    return { configured: false, reachable: true };
  }

  const url = `${baseUrl.replace(/\/$/, "")}/ready`;
  const timeoutMs = Number(process.env.ACADEMY_API_TIMEOUT_MS ?? 800);
  const started = Date.now();

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(Math.min(Math.max(timeoutMs, 200), 2000)),
    });
    if (!res.ok) {
      return {
        configured: true,
        reachable: false,
        latencyMs: Date.now() - started,
        error: `HTTP ${res.status}`,
      };
    }
    return { configured: true, reachable: true, latencyMs: Date.now() - started };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : "unreachable",
    };
  }
}
