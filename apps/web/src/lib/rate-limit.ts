import { rateLimitHit } from "@/lib/rate-limit-store";

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const hit = await rateLimitHit(key, windowMs);
  if (hit.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((hit.resetAt - Date.now()) / 1000)),
    };
  }
  return { ok: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function adminRateLimitKey(request: Request, userId: string): string {
  return `admin:${userId}:${getClientIp(request)}`;
}
