export type ModuleAssessmentSummary = {
  key: string;
  id: string;
  type: string;
  exam_bank: string;
  form_id: string;
  pass_score: number;
  title: string;
};

export type TrackExamConfig = {
  certificationId: string;
  bankId: string;
  formId: string;
  trackId: string;
  passScore: number;
  timeLimitMinutes: number;
  title: string;
};

export const TRACK_CERTIFICATION_EXAMS: TrackExamConfig[] = [
  {
    certificationId: "CCU",
    bankId: "ccu-v1",
    formId: "form-a",
    trackId: "level-0-user",
    passScore: 70,
    timeLimitMinutes: 60,
    title: "CCU Certification Exam",
  },
];

export function resolveModuleQuizFromModule(
  module: { slug: string; assessments: ModuleAssessmentSummary[] },
): ModuleAssessmentSummary | null {
  return module.assessments[0] ?? null;
}

export function resolveTrackCertificationExam(trackId: string): TrackExamConfig | null {
  return TRACK_CERTIFICATION_EXAMS.find((e) => e.trackId === trackId) ?? null;
}

export function resolveCertificationExam(certificationId: string): TrackExamConfig | null {
  return TRACK_CERTIFICATION_EXAMS.find((e) => e.certificationId === certificationId) ?? null;
}
