import { prisma } from "@/lib/prisma";
import type { OperatorOrgRow } from "@/components/mypage/MyPageOpsHub";

/** OOO certification + profile organization for My Page ops hub (single-host console). */
export async function getOperatorOrgRows(userId: string): Promise<OperatorOrgRow[]> {
  const [cert, user] = await Promise.all([
    prisma.certification.findFirst({
      where: {
        userId,
        type: "STEWARD_OPERATOR",
        status: "APPROVED",
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { certificateNo: true, expiresAt: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, organization: true, name: true },
    }),
  ]);

  if (!cert) return [];

  const legalName =
    user?.organization?.trim() || user?.name?.trim() || "Your organization";

  return [
    {
      organizationId: user?.id ?? userId,
      legalName,
      corporateNumber: "—",
      certificateNo: cert.certificateNo,
      expiresAt: cert.expiresAt.toISOString().slice(0, 10),
    },
  ];
}
