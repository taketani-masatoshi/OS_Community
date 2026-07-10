import { requireAuthApi } from "@/lib/session";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import {
  evaluateCertificationEligibility,
  issueAcademyCertificate,
} from "@/lib/academy/issuance-service";

export async function GET(req: Request) {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;

  const certificationId = new URL(req.url).searchParams.get("certificationId");
  if (!certificationId) {
    return apiErrorResponse("CERTIFICATION_ID_REQUIRED", 400);
  }

  try {
    const result = await evaluateCertificationEligibility(
      authResult.session.user.id,
      certificationId,
    );
    return Response.json(result);
  } catch {
    return apiErrorResponse("ELIGIBILITY_FAILED", 503);
  }
}

export async function POST(req: Request) {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;

  const bodyResult = await readJsonBody<{ certificationId?: string }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  const body = bodyResult;

  if (!body.certificationId) {
    return apiErrorResponse("CERTIFICATION_ID_REQUIRED", 400);
  }

  try {
    const certificate = await issueAcademyCertificate(
      authResult.session.user.id,
      body.certificationId,
    );
    return Response.json({ certificate });
  } catch {
    return apiErrorResponse("ISSUANCE_FAILED", 400);
  }
}
