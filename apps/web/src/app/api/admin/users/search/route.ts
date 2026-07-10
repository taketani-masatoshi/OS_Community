import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { listUsersForAdmin } from "@/lib/admin-users";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authResult = await requireRoleApi(["ADMIN"]);
  if ("error" in authResult) return authResult.error;

  const limited = await enforceAdminRateLimit(req, authResult.session.user.id);
  if (limited) return limited;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return Response.json({ users: [] });
  }

  const { users } = await listUsersForAdmin({ q, page: 1 });
  return Response.json({
    users: users.slice(0, 10).map((user) => ({
      id: user.id,
      label: user.githubLogin ?? user.name ?? user.email ?? user.id,
    })),
  });
}
