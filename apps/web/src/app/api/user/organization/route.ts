import { requireAuthApi } from "@/lib/session";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { enforceWriteRateLimit } from "@/lib/auth-rate-limit";
import {
  claimOrganization,
  listUserAffiliations,
  removeAffiliation,
  serializeAffiliation,
} from "@/lib/org-affiliation";

export const runtime = "nodejs";

export async function GET() {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;

  const affiliations = await listUserAffiliations(authResult.session.user.id);
  return Response.json({
    affiliations: affiliations.map(serializeAffiliation),
  });
}

export async function POST(req: Request) {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const limited = await enforceWriteRateLimit(req, session.user.id);
  if (limited) return limited;

  const bodyResult = await readJsonBody<{
    corporateNumber?: string;
    legalName?: string;
    title?: string;
  }>(req);
  if (bodyResult instanceof Response) return bodyResult;

  const result = await claimOrganization(session.user.id, {
    corporateNumber: bodyResult.corporateNumber ?? "",
    legalName: bodyResult.legalName ?? "",
    title: bodyResult.title,
  });

  if (!result.ok) {
    const status =
      result.code === "INVALID_CORPORATE_NUMBER" || result.code === "LEGAL_NAME_REQUIRED"
        ? 400
        : 409;
    return apiErrorResponse(result.code, status);
  }

  return Response.json({ affiliation: serializeAffiliation(result.affiliation) }, { status: 201 });
}

export async function DELETE(req: Request) {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const limited = await enforceWriteRateLimit(req, session.user.id);
  if (limited) return limited;

  const url = new URL(req.url);
  const affiliationId = url.searchParams.get("id")?.trim();
  if (!affiliationId) {
    return apiErrorResponse("VALIDATION", 400);
  }

  const result = await removeAffiliation(session.user.id, affiliationId);
  if (!result.ok) {
    return apiErrorResponse(result.code === "NOT_FOUND" ? "NOT_FOUND" : "FORBIDDEN", result.code === "NOT_FOUND" ? 404 : 403);
  }

  return Response.json({ ok: true });
}
