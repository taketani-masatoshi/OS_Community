-- AlterTable
ALTER TABLE "Certification" ADD COLUMN "organizationId" TEXT;

-- AlterTable
ALTER TABLE "CertificationApplication" ADD COLUMN "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "Certification_organizationId_idx" ON "Certification"("organizationId");

-- CreateIndex
CREATE INDEX "Certification_userId_type_idx" ON "Certification"("userId", "type");

-- CreateIndex
CREATE INDEX "CertificationApplication_organizationId_idx" ON "CertificationApplication"("organizationId");

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationApplication" ADD CONSTRAINT "CertificationApplication_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
