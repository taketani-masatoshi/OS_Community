import { z } from "zod";
import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { decideAffiliation, serializeAffiliation } from "@/lib/org-affiliation";

export const runtime = "nodejs";

const bodySchema = z.object({
  action: z.enum(["verify", "reject"]),
  note: z.string().optional(),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRoleApi(["ADMIN"]);
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const limited = await enforceAdminRateLimit(req, session.user.id);
  if (limited) return limited;

  const { id } = await context.params;
  if (!id) return apiErrorResponse("NOT_FOUND", 404);

  const bodyResult = await readJsonBody<unknown>(req);
  if (bodyResult instanceof Response) return bodyResult;

  const parsed = bodySchema.safeParse(bodyResult);
  if (!parsed.success) {
    return apiErrorResponse("VALIDATION", 400, { extra: { details: parsed.error.flatten() } });
  }

  const result = await decideAffiliation(session.user.id, id, parsed.data);
  if (!result.ok) {
    return apiErrorResponse(
      result.code === "NOT_FOUND" ? "NOT_FOUND" : "INVALID_STATUS",
      result.code === "NOT_FOUND" ? 404 : 409,
    );
  }

  return Response.json({ affiliation: serializeAffiliation(result.affiliation) });
}
