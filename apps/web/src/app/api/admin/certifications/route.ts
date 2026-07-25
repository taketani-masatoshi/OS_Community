import { z } from "zod";
import { requireRoleApi } from "@/lib/session";
import { enforceAdminRateLimit } from "@/lib/admin-rate-limit";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { prisma } from "@/lib/prisma";
import {
  getFirstVerifiedAffiliation,
  getVerifiedAffiliationForOrg,
} from "@/lib/org-affiliation";
import { randomBytes } from "node:crypto";

const postBodySchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  note: z.string().optional(),
});

function generateCertNo(type: string): string {
  const prefix = type === "STEWARD_OPERATOR" ? "SO" : "SD";
  return `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(req: Request) {
  const authResult = await requireRoleApi(["ADMIN", "CERT_REVIEWER"]);
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const limited = await enforceAdminRateLimit(req, session.user.id);
  if (limited) return limited;

  const bodyResult = await readJsonBody<unknown>(req);
  if (bodyResult instanceof Response) return bodyResult;

  const parsed = postBodySchema.safeParse(bodyResult);
  if (!parsed.success) {
    return apiErrorResponse("VALIDATION", 400, { extra: { details: parsed.error.flatten() } });
  }

  const body = parsed.data;

  const app = await prisma.certificationApplication.findUnique({
    where: { id: body.applicationId },
  });
  if (!app || !["PENDING", "UNDER_REVIEW"].includes(app.status)) {
    return apiErrorResponse("NOT_FOUND", 404);
  }

  if (body.action === "reject") {
    await prisma.certificationApplication.update({
      where: { id: body.applicationId },
      data: { status: "REJECTED", reviewerId: session.user.id, reviewNote: body.note },
    });
    return Response.json({ ok: true });
  }

  let organizationId: string | null = app.organizationId;

  if (app.type === "STEWARD_OPERATOR") {
    if (organizationId) {
      const verified = await getVerifiedAffiliationForOrg(app.userId, organizationId);
      if (!verified) {
        return apiErrorResponse("ORG_AFFILIATION_NOT_VERIFIED", 409);
      }
    } else {
      const fallback = await getFirstVerifiedAffiliation(app.userId);
      if (!fallback) {
        return apiErrorResponse("ORG_AFFILIATION_NOT_VERIFIED", 409);
      }
      organizationId = fallback.organizationId;
    }
  }

  const years = app.type === "STEWARD_OPERATOR" ? 2 : 3;
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + years);

  const defaultOperatorId =
    process.env.COMMUNITY_DEFAULT_ORGOS_OPERATOR_ID?.trim() || "OP-001";

  const cert = await prisma.$transaction(async (tx) => {
    await tx.certificationApplication.update({
      where: { id: body.applicationId },
      data: {
        status: "APPROVED",
        reviewerId: session.user.id,
        reviewNote: body.note,
        organizationId,
      },
    });
    const created = await tx.certification.create({
      data: {
        userId: app.userId,
        type: app.type,
        organizationId,
        certificateNo: generateCertNo(app.type),
        expiresAt,
      },
    });
    if (app.type === "STEWARD_OPERATOR") {
      const user = await tx.user.findUnique({
        where: { id: app.userId },
        select: { orgosOperatorId: true },
      });
      if (!user?.orgosOperatorId) {
        await tx.user.update({
          where: { id: app.userId },
          data: { orgosOperatorId: defaultOperatorId },
        });
      }
    }
    return created;
  });

  return Response.json({
    certificateNo: cert.certificateNo,
    organizationId: cert.organizationId,
  });
}
