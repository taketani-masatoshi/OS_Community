type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();

export type RateLimitHit = { count: number; resetAt: number };

/** In-memory store (single process). Used when Upstash is not configured. */
export function memoryRateLimitHit(key: string, windowMs: number): RateLimitHit {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return { count: 1, resetAt };
  }

  bucket.count += 1;
  return { count: bucket.count, resetAt: bucket.resetAt };
}

/**
 * Optional Upstash Redis REST rate limit (distributed).
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to enable.
 */
export async function distributedRateLimitHit(
  key: string,
  windowMs: number,
): Promise<RateLimitHit | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const redisKey = `rl:${key}:${windowSec}`;

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, windowSec, "NX"],
      ["TTL", redisKey],
    ]),
  });

  if (!res.ok) {
    return memoryRateLimitHit(key, windowMs);
  }

  const body = (await res.json()) as { result?: unknown[] };
  const count = Number(body.result?.[0] ?? 1);
  const ttl = Number(body.result?.[2] ?? windowSec);
  const resetAt = Date.now() + ttl * 1000;
  return { count, resetAt };
}

export async function rateLimitHit(key: string, windowMs: number): Promise<RateLimitHit> {
  const distributed = await distributedRateLimitHit(key, windowMs);
  if (distributed) return distributed;
  return memoryRateLimitHit(key, windowMs);
}
