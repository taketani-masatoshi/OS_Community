-- CreateEnum
CREATE TYPE "OrgAffiliationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrgAffiliationAuditAction" AS ENUM ('CLAIM', 'VERIFY', 'REJECT', 'REMOVE');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL DEFAULT 'JP',
    "corporateNumber" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgAffiliation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "OrgAffiliationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgAffiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgAffiliationAuditLog" (
    "id" TEXT NOT NULL,
    "affiliationId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "OrgAffiliationAuditAction" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgAffiliationAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Organization_corporateNumber_idx" ON "Organization"("corporateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_jurisdiction_corporateNumber_key" ON "Organization"("jurisdiction", "corporateNumber");

-- CreateIndex
CREATE INDEX "OrgAffiliation_status_idx" ON "OrgAffiliation"("status");

-- CreateIndex
CREATE INDEX "OrgAffiliation_userId_idx" ON "OrgAffiliation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgAffiliation_userId_organizationId_key" ON "OrgAffiliation"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "OrgAffiliationAuditLog_affiliationId_idx" ON "OrgAffiliationAuditLog"("affiliationId");

-- CreateIndex
CREATE INDEX "OrgAffiliationAuditLog_createdAt_idx" ON "OrgAffiliationAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "OrgAffiliation" ADD CONSTRAINT "OrgAffiliation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAffiliation" ADD CONSTRAINT "OrgAffiliation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAffiliation" ADD CONSTRAINT "OrgAffiliation_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAffiliationAuditLog" ADD CONSTRAINT "OrgAffiliationAuditLog_affiliationId_fkey" FOREIGN KEY ("affiliationId") REFERENCES "OrgAffiliation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAffiliationAuditLog" ADD CONSTRAINT "OrgAffiliationAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
