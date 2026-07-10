/** Shared Prisma filter for publicly visible, non-expired certifications */
export function activeCertificationWhere(now = new Date()) {
  return {
    status: "APPROVED" as const,
    expiresAt: { gt: now },
    revokedAt: null,
  };
}
