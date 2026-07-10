import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { syncCommitteesFromDefinitions } from "@/lib/admin-committees";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authResult = await requireRoleApi(["ADMIN"]);
  if ("error" in authResult) return authResult.error;

  const limited = await enforceAdminRateLimit(req, authResult.session.user.id);
  if (limited) return limited;

  const result = await syncCommitteesFromDefinitions();
  return Response.json({ ok: true, total: result.total });
}
