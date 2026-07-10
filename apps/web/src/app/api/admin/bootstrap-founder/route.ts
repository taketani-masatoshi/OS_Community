import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { apiErrorResponse } from "@/lib/api-error";
import { bootstrapFounder } from "@/lib/founder-bootstrap";

export async function POST(request: Request) {
  const auth = await requireRoleApi(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const limited = await enforceAdminRateLimit(request, auth.session.user.id);
  if (limited) return limited;

  try {
    const result = await bootstrapFounder();
    return Response.json({ ok: true, ...result });
  } catch {
    return apiErrorResponse("BOOTSTRAP_FAILED", 500);
  }
}
