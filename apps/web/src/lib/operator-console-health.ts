/**
 * Probe OrgOS Operator Console /health (short timeout).
 * Used by mypage Ops hub to avoid dead primary CTAs when :9470 is down.
 *
 * Browser links use NEXT_PUBLIC_OPERATOR_CONSOLE_URL (often http://127.0.0.1:9470).
 * Server-side probe from Docker web should use OPERATOR_CONSOLE_HEALTH_URL
 * (e.g. http://host.docker.internal:9470) so it reaches the host-published port.
 */
export async function isOperatorConsoleReachable(
  baseUrl: string | null | undefined,
  timeoutMs = 800,
): Promise<boolean> {
  const base = (process.env.OPERATOR_CONSOLE_HEALTH_URL?.trim() || baseUrl?.trim() || "").replace(
    /\/+$/,
    "",
  );
  if (!base) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `${base}/health`;
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!res.ok) return false;
    const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return body?.ok === true || res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
