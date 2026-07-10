-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('STARTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ExamAttemptStatus" AS ENUM ('IN_PROGRESS', 'PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "AcademyEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "curriculumVersion" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AcademyEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "curriculumVersion" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passScore" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "status" "ExamAttemptStatus" NOT NULL,
    "answers" JSONB NOT NULL,
    "itemResults" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyCertificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "certificateNo" TEXT NOT NULL,
    "curriculumVersion" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "AcademyCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademyEnrollment_userId_trackId_idx" ON "AcademyEnrollment"("userId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyEnrollment_userId_trackId_curriculumVersion_key" ON "AcademyEnrollment"("userId", "trackId", "curriculumVersion");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_enrollmentId_lessonId_key" ON "LessonProgress"("enrollmentId", "lessonId");

-- CreateIndex
CREATE INDEX "ExamAttempt_enrollmentId_bankId_formId_idx" ON "ExamAttempt"("enrollmentId", "bankId", "formId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyCertificate_certificateNo_key" ON "AcademyCertificate"("certificateNo");

-- CreateIndex
CREATE INDEX "AcademyCertificate_userId_idx" ON "AcademyCertificate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyCertificate_userId_certificationId_curriculumVersion_key" ON "AcademyCertificate"("userId", "certificationId", "curriculumVersion");

-- AddForeignKey
ALTER TABLE "AcademyEnrollment" ADD CONSTRAINT "AcademyEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "AcademyEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "AcademyEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyCertificate" ADD CONSTRAINT "AcademyCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
