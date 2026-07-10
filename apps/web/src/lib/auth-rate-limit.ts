import { apiErrorResponse } from "@/lib/api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const AUTH_LIMIT = 30;
const AUTH_WINDOW_MS = 60_000;

const WRITE_LIMIT = 20;
const WRITE_WINDOW_MS = 60_000;

export async function enforceAuthRateLimit(request: Request): Promise<Response | null> {
  const ip = getClientIp(request);
  const result = await checkRateLimit(`auth:${ip}`, AUTH_LIMIT, AUTH_WINDOW_MS);
  if (result.ok) return null;
  return apiErrorResponse("RATE_LIMITED", 429, {
    headers: { "Retry-After": String(result.retryAfterSec) },
  });
}

export async function enforceWriteRateLimit(
  request: Request,
  userId: string,
): Promise<Response | null> {
  const ip = getClientIp(request);
  const result = await checkRateLimit(`write:${userId}:${ip}`, WRITE_LIMIT, WRITE_WINDOW_MS);
  if (result.ok) return null;
  return apiErrorResponse("RATE_LIMITED", 429, {
    headers: { "Retry-After": String(result.retryAfterSec) },
  });
}
