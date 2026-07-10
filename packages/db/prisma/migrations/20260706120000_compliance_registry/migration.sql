-- CreateEnum
CREATE TYPE "ComplianceRegistryCategory" AS ENUM ('REGULATED_PROFESSION', 'ISO_AUDIT_QUALIFICATION', 'COMPLIANCE_SPECIALIST');

-- CreateEnum
CREATE TYPE "ComplianceChecklistType" AS ENUM ('CONFLICT_OF_INTEREST', 'SANCTIONS_SCREENING', 'ANTI_SOCIAL_FORCES', 'IMPORT_EXPORT_CONTROLS');

-- CreateTable
CREATE TABLE "ComplianceProfession" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "ComplianceRegistryCategory" NOT NULL,
    "jurisdictionCode" TEXT,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "description" TEXT,
    "regulatoryBody" TEXT,
    "licenseRequired" BOOLEAN NOT NULL DEFAULT true,
    "relatedExpertDomainKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceProfession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCredentialType" (
    "id" TEXT NOT NULL,
    "professionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "issuingBody" TEXT,
    "standardCode" TEXT,
    "description" TEXT,
    "validityYears" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceCredentialType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCredentialHolder" (
    "id" TEXT NOT NULL,
    "credentialTypeId" TEXT NOT NULL,
    "userId" TEXT,
    "holderName" TEXT NOT NULL,
    "holderOrganization" TEXT,
    "jurisdictionCode" TEXT,
    "licenseNumber" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "publicProfile" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceCredentialHolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceChecklist" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ComplianceChecklistType" NOT NULL,
    "jurisdictionCode" TEXT,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "description" TEXT,
    "expertRoleHint" TEXT,
    "expertRoleHintLocal" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "titleLocal" TEXT,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "referenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceProfession_slug_key" ON "ComplianceProfession"("slug");

-- CreateIndex
CREATE INDEX "ComplianceProfession_category_jurisdictionCode_idx" ON "ComplianceProfession"("category", "jurisdictionCode");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceCredentialType_slug_key" ON "ComplianceCredentialType"("slug");

-- CreateIndex
CREATE INDEX "ComplianceCredentialType_professionId_idx" ON "ComplianceCredentialType"("professionId");

-- CreateIndex
CREATE INDEX "ComplianceCredentialHolder_credentialTypeId_idx" ON "ComplianceCredentialHolder"("credentialTypeId");

-- CreateIndex
CREATE INDEX "ComplianceCredentialHolder_userId_idx" ON "ComplianceCredentialHolder"("userId");

-- CreateIndex
CREATE INDEX "ComplianceCredentialHolder_jurisdictionCode_idx" ON "ComplianceCredentialHolder"("jurisdictionCode");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceChecklist_slug_key" ON "ComplianceChecklist"("slug");

-- CreateIndex
CREATE INDEX "ComplianceChecklist_type_jurisdictionCode_idx" ON "ComplianceChecklist"("type", "jurisdictionCode");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceChecklistItem_checklistId_code_key" ON "ComplianceChecklistItem"("checklistId", "code");

-- CreateIndex
CREATE INDEX "ComplianceChecklistItem_checklistId_sortOrder_idx" ON "ComplianceChecklistItem"("checklistId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ComplianceCredentialType" ADD CONSTRAINT "ComplianceCredentialType_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "ComplianceProfession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCredentialHolder" ADD CONSTRAINT "ComplianceCredentialHolder_credentialTypeId_fkey" FOREIGN KEY ("credentialTypeId") REFERENCES "ComplianceCredentialType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCredentialHolder" ADD CONSTRAINT "ComplianceCredentialHolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceChecklistItem" ADD CONSTRAINT "ComplianceChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "ComplianceChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
