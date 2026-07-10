import { prisma } from "@/lib/prisma";
import { getAcademyClient } from "@/lib/academy/server-client";
import { DEFAULT_CURRICULUM_VERSION } from "@/lib/academy/progress-types";
import { getTrackProgress } from "@/lib/academy/progress-service";

export type IssuanceRequirement = {
  track_id?: string;
  documents_completed?: string;
  videos_completed?: string;
  exam?: {
    bank_id: string;
    form_id: string;
    min_score: number;
  };
};

export type IssuanceRule = {
  certification_id: string;
  template_id: string;
  requirements: IssuanceRequirement;
};

export type EligibilityResult = {
  certificationId: string;
  eligible: boolean;
  reasons: string[];
  requirements: IssuanceRequirement;
};

async function loadIssuanceRules(): Promise<IssuanceRule[]> {
  const baseUrl = process.env.ACADEMY_API_URL?.replace(/\/$/, "");
  if (!baseUrl) return [];
  const res = await fetch(`${baseUrl}/v1/certifications/issuance`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const body = (await res.json()) as { rules: IssuanceRule[] };
  return body.rules ?? [];
}

export async function evaluateCertificationEligibility(
  userId: string,
  certificationId: string,
  curriculumVersion = DEFAULT_CURRICULUM_VERSION,
): Promise<EligibilityResult> {
  const rules = await loadIssuanceRules();
  const rule = rules.find((r) => r.certification_id === certificationId);
  if (!rule) {
    return {
      certificationId,
      eligible: false,
      reasons: ["Unknown certification"],
      requirements: {},
    };
  }

  const reasons: string[] = [];
  const req = rule.requirements;
  const trackId = req.track_id;
  let progress: Awaited<ReturnType<typeof getTrackProgress>> | null = null;

  if (trackId) {
    progress = await getTrackProgress(userId, trackId, curriculumVersion);
    if (req.documents_completed === "all_track_lessons" && !progress.completion.isComplete) {
      reasons.push(
        `Track lessons incomplete (${progress.completion.completed}/${progress.completion.total})`,
      );
    }
  }

  if (req.exam) {
    const attempts = progress?.examAttempts ?? [];
    const passed = attempts.some(
      (a) =>
        a.bankId === req.exam!.bank_id &&
        a.formId === req.exam!.form_id &&
        a.passed &&
        a.score >= req.exam!.min_score,
    );
    if (!passed) {
      reasons.push(
        `Exam ${req.exam.bank_id}/${req.exam.form_id} not passed at ${req.exam.min_score}%+`,
      );
    }
  }

  const existing = await prisma.academyCertificate.findUnique({
    where: {
      userId_certificationId_curriculumVersion: {
        userId,
        certificationId,
        curriculumVersion,
      },
    },
  });
  if (existing) {
    reasons.push("Certificate already issued for this curriculum version");
  }

  return {
    certificationId,
    eligible: reasons.length === 0,
    reasons,
    requirements: req,
  };
}

function generateCertificateNo(certificationId: string): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${certificationId}-${year}-${suffix}`;
}

export async function issueAcademyCertificate(
  userId: string,
  certificationId: string,
  curriculumVersion = DEFAULT_CURRICULUM_VERSION,
) {
  const eligibility = await evaluateCertificationEligibility(userId, certificationId, curriculumVersion);
  if (!eligibility.eligible) {
    throw new Error(eligibility.reasons.join("; "));
  }

  return prisma.academyCertificate.create({
    data: {
      userId,
      certificationId,
      curriculumVersion,
      certificateNo: generateCertificateNo(certificationId),
    },
  });
}

export async function listIssuanceRules(): Promise<IssuanceRule[]> {
  return loadIssuanceRules();
}
