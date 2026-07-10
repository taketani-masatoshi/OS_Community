import { NextResponse } from "next/server";
import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { apiErrorResponse } from "@/lib/api-error";
import { formatRoleAuditCsv, listRoleAuditLogs } from "@/lib/admin-users";

export async function GET(request: Request) {
  const auth = await requireRoleApi(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const limited = await enforceAdminRateLimit(request, auth.session.user.id);
  if (limited) return limited;

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";
  const userId = url.searchParams.get("userId") ?? undefined;
  const fromRaw = url.searchParams.get("from");
  const toRaw = url.searchParams.get("to");
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "1000", 10);
  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);

  const from = fromRaw ? new Date(fromRaw) : undefined;
  const to = toRaw ? new Date(toRaw) : undefined;
  if (from && Number.isNaN(from.getTime())) {
    return apiErrorResponse("INVALID_FROM", 400);
  }
  if (to && Number.isNaN(to.getTime())) {
    return apiErrorResponse("INVALID_TO", 400);
  }

  const { logs, total, limit: effectiveLimit, offset: effectiveOffset } = await listRoleAuditLogs({
    from,
    to,
    userId,
    limit,
    offset,
  });

  if (format === "csv") {
    const csv = formatRoleAuditCsv(logs);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="role-audit-log.csv"',
      },
    });
  }

  return Response.json({
    logs: logs.map((log) => ({
      id: log.id,
      createdAt: log.createdAt.toISOString(),
      oldRole: log.oldRole,
      newRole: log.newRole,
      user: log.user,
      actor: log.actor,
    })),
    total,
    limit: effectiveLimit,
    offset: effectiveOffset,
  });
}
