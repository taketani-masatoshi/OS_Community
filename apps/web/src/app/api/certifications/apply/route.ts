import { requireProfileCompleteApi } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { enforceWriteRateLimit } from "@/lib/auth-rate-limit";
import { userHasClaimedAffiliation } from "@/lib/org-affiliation";
import type { CertificationType } from "@os-community/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authResult = await requireProfileCompleteApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const limited = await enforceWriteRateLimit(req, session.user.id);
  if (limited) return limited;

  const bodyResult = await readJsonBody<{ type?: string; statement?: string }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  const body = bodyResult;

  const type = body.type as CertificationType;
  if (!type || !["STEWARD_OPERATOR", "STEWARD_DESIGNER"].includes(type)) {
    return apiErrorResponse("INVALID_TYPE", 400);
  }

  if (type === "STEWARD_OPERATOR") {
    const hasOrg = await userHasClaimedAffiliation(session.user.id);
    if (!hasOrg) {
      return apiErrorResponse("ORG_AFFILIATION_REQUIRED", 400);
    }
  }

  const pending = await prisma.certificationApplication.findFirst({
    where: {
      userId: session.user.id,
      type,
      status: { in: ["PENDING", "UNDER_REVIEW"] },
    },
  });
  if (pending) {
    return apiErrorResponse("PENDING_APPLICATION", 409);
  }

  await prisma.certificationApplication.create({
    data: {
      userId: session.user.id,
      type,
      statement: body.statement?.trim() || null,
    },
  });

  return Response.json({ ok: true });
}
