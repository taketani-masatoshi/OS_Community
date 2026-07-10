import { apiErrorResponse } from "@/lib/api-error";
import { adminRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

const ADMIN_LIMIT = 30;
const ADMIN_WINDOW_MS = 60_000;

export async function enforceAdminRateLimit(
  request: Request,
  userId: string,
): Promise<Response | null> {
  const result = await checkRateLimit(adminRateLimitKey(request, userId), ADMIN_LIMIT, ADMIN_WINDOW_MS);
  if (result.ok) return null;
  return apiErrorResponse("RATE_LIMITED", 429, {
    headers: { "Retry-After": String(result.retryAfterSec) },
  });
}
