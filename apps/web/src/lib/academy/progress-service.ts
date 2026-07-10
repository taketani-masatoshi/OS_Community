import {
  ExamAttemptStatus,
  LessonProgressStatus,
  type Prisma,
} from "@os-community/db";
import type { LessonSummary, ModuleSummary } from "@os-community/academy-client";
import { prisma } from "@/lib/prisma";
import {
  academyFetchLesson,
  academyFetchTrack,
  academyFetchTracks,
} from "@/lib/academy/progress-academy";
import {
  computeTrackCompletion,
  DEFAULT_CURRICULUM_VERSION,
  EXAM_RETAKE_COOLDOWN_HOURS,
  EXAM_RETAKE_MAX_ATTEMPTS,
  isLessonFullyComplete,
  lessonRequiresVideo,
  mergeLessonMetadata,
  type LessonProgressMetadata,
  type RecordProgressInput,
} from "@/lib/academy/progress-types";

export class ExamRetakeBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExamRetakeBlockedError";
  }
}

export class QuizPrerequisiteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizPrerequisiteError";
  }
}

async function ensureEnrollment(userId: string, trackId: string, curriculumVersion: string) {
  return prisma.academyEnrollment.upsert({
    where: {
      userId_trackId_curriculumVersion: { userId, trackId, curriculumVersion },
    },
    create: { userId, trackId, curriculumVersion },
    update: {},
    include: { lessonProgress: true, examAttempts: true },
  });
}

function parseMetadata(raw: unknown): LessonProgressMetadata {
  if (!raw || typeof raw !== "object") return {};
  return raw as LessonProgressMetadata;
}

async function getFullyCompletedLessonIds(
  userId: string,
  trackId: string,
  curriculumVersion: string,
): Promise<string[]> {
  const track = await academyFetchTrack(trackId);
  const enrollment = await prisma.academyEnrollment.findUnique({
    where: {
      userId_trackId_curriculumVersion: { userId, trackId, curriculumVersion },
    },
    include: { lessonProgress: true },
  });
  if (!enrollment) return [];

  const lessonMap = new Map<string, LessonSummary>();
  for (const mod of track.modules) {
    for (const lesson of mod.lessons) {
      lessonMap.set(lesson.id, lesson as LessonSummary);
    }
  }

  return enrollment.lessonProgress
    .filter((row) => {
      const lesson = lessonMap.get(row.lessonId);
      if (!lesson) return row.status === LessonProgressStatus.COMPLETED;
      return isLessonFullyComplete(lesson, parseMetadata(row.metadata));
    })
    .map((row) => row.lessonId);
}

async function maybeCompleteEnrollment(
  enrollmentId: string,
  trackId: string,
  curriculumVersion: string,
) {
  const enrollment = await prisma.academyEnrollment.findUnique({
    where: { id: enrollmentId },
  });
  if (!enrollment) return;

  const track = await academyFetchTrack(trackId);
  const allLessonIds = track.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const completedIds = await getFullyCompletedLessonIds(
    enrollment.userId,
    trackId,
    curriculumVersion,
  );
  const { isComplete } = computeTrackCompletion(completedIds, allLessonIds);

  await prisma.academyEnrollment.update({
    where: { id: enrollmentId },
    data: { completedAt: isComplete ? new Date() : null },
  });
}

export async function assertExamRetakeAllowed(
  userId: string,
  trackId: string,
  bankId: string,
  formId: string,
  curriculumVersion = DEFAULT_CURRICULUM_VERSION,
) {
  const enrollment = await prisma.academyEnrollment.findUnique({
    where: {
      userId_trackId_curriculumVersion: { userId, trackId, curriculumVersion },
    },
    include: {
      examAttempts: {
        where: { bankId, formId },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  const attempts = enrollment?.examAttempts ?? [];
  if (attempts.some((a) => a.passed)) {
    throw new ExamRetakeBlockedError("Exam already passed");
  }
  if (attempts.length >= EXAM_RETAKE_MAX_ATTEMPTS) {
    throw new ExamRetakeBlockedError(
      `Maximum ${EXAM_RETAKE_MAX_ATTEMPTS} attempts reached for this exam`,
    );
  }

  const last = attempts[0];
  if (last && !last.passed && last.submittedAt) {
    const cooldownMs = EXAM_RETAKE_COOLDOWN_HOURS * 60 * 60 * 1000;
    const elapsed = Date.now() - last.submittedAt.getTime();
    if (elapsed < cooldownMs) {
      throw new ExamRetakeBlockedError(
        `Please wait ${EXAM_RETAKE_COOLDOWN_HOURS} hours before retrying`,
      );
    }
  }
}

export async function assertModuleQuizPrerequisites(
  userId: string,
  trackId: string,
  module: ModuleSummary,
  curriculumVersion = DEFAULT_CURRICULUM_VERSION,
) {
  const completedIds = await getFullyCompletedLessonIds(userId, trackId, curriculumVersion);
  const completedSet = new Set(completedIds);
  const missing = module.lessons.filter((l) => !completedSet.has(l.id));
  if (missing.length > 0) {
    throw new QuizPrerequisiteError(
      `Complete all module lessons before taking the quiz (${missing.length} remaining)`,
    );
  }
}

export async function assertTrackExamPrerequisites(
  userId: string,
  trackId: string,
  curriculumVersion = DEFAULT_CURRICULUM_VERSION,
) {
  const track = await academyFetchTrack(trackId);
  const allLessonIds = track.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const completedIds = await getFullyCompletedLessonIds(userId, trackId, curriculumVersion);
  const { isComplete } = computeTrackCompletion(completedIds, allLessonIds);
  if (!isComplete) {
    throw new QuizPrerequisiteError("Complete all track lessons before taking the certification exam");
  }
}

export async function recordProgressEvent(userId: string, input: RecordProgressInput) {
  const curriculumVersion = input.curriculumVersion ?? DEFAULT_CURRICULUM_VERSION;

  if (input.type === "exam_passed" || input.type === "exam_failed") {
    if (!input.trackId || !input.bankId || !input.formId) {
      throw new Error("trackId, bankId, and formId are required for exam events");
    }

    await assertExamRetakeAllowed(userId, input.trackId, input.bankId, input.formId, curriculumVersion);

    const enrollment = await ensureEnrollment(userId, input.trackId, curriculumVersion);
    const attempt = await prisma.examAttempt.create({
      data: {
        enrollmentId: enrollment.id,
        bankId: input.bankId,
        formId: input.formId,
        curriculumVersion,
        score: input.score ?? 0,
        passScore: input.passScore ?? 70,
        passed: input.passed ?? false,
        status: input.passed ? ExamAttemptStatus.PASSED : ExamAttemptStatus.FAILED,
        answers: (input.answers ?? {}) as Prisma.InputJsonValue,
        itemResults: input.itemResults as Prisma.InputJsonValue | undefined,
        submittedAt: new Date(),
      },
    });

    return { enrollmentId: enrollment.id, examAttemptId: attempt.id };
  }

  if (!input.lessonId) {
    throw new Error("lessonId is required");
  }

  const lesson = await academyFetchLesson(input.lessonId);
  const trackId = input.trackId ?? lesson.track;
  const enrollment = await ensureEnrollment(userId, trackId, curriculumVersion);
  const existing = await prisma.lessonProgress.findUnique({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: input.lessonId,
      },
    },
  });

  const metadata = mergeLessonMetadata(parseMetadata(existing?.metadata), input.type);
  const fullyComplete = isLessonFullyComplete(lesson, metadata);

  await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: input.lessonId,
      },
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId: input.lessonId,
      status: fullyComplete ? LessonProgressStatus.COMPLETED : LessonProgressStatus.STARTED,
      completedAt: fullyComplete ? new Date() : null,
      metadata: metadata as Prisma.InputJsonValue,
    },
    update: {
      status: fullyComplete ? LessonProgressStatus.COMPLETED : LessonProgressStatus.STARTED,
      completedAt: fullyComplete ? new Date() : null,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });

  if (fullyComplete) {
    await maybeCompleteEnrollment(enrollment.id, trackId, curriculumVersion);
  }

  return {
    enrollmentId: enrollment.id,
    trackId,
    lessonId: input.lessonId,
    fullyComplete,
    metadata,
  };
}

export async function getTrackProgress(
  userId: string,
  trackId: string,
  curriculumVersion?: string,
) {
  const version = curriculumVersion ?? DEFAULT_CURRICULUM_VERSION;
  const track = await academyFetchTrack(trackId);
  const lessonIds = track.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const completedLessonIds = await getFullyCompletedLessonIds(userId, trackId, version);

  const enrollment = await prisma.academyEnrollment.findUnique({
    where: {
      userId_trackId_curriculumVersion: { userId, trackId, curriculumVersion: version },
    },
    include: {
      lessonProgress: true,
      examAttempts: { orderBy: { submittedAt: "desc" }, take: 10 },
    },
  });

  return {
    trackId,
    trackName: track.name,
    curriculumVersion: version,
    enrollmentId: enrollment?.id ?? null,
    completion: computeTrackCompletion(completedLessonIds, lessonIds),
    completedLessonIds,
    lessonProgress: enrollment?.lessonProgress ?? [],
    examAttempts: enrollment?.examAttempts ?? [],
  };
}

export async function getLessonProgress(
  userId: string,
  lessonId: string,
  curriculumVersion?: string,
) {
  const version = curriculumVersion ?? DEFAULT_CURRICULUM_VERSION;
  const lesson = await academyFetchLesson(lessonId);
  const trackProgress = await getTrackProgress(userId, lesson.track, version);
  const row = trackProgress.lessonProgress.find((p) => p.lessonId === lessonId);
  const metadata = parseMetadata(row?.metadata);
  const fullyComplete = isLessonFullyComplete(lesson, metadata);

  return {
    lessonId,
    trackId: lesson.track,
    completed: fullyComplete,
    documentCompleted: metadata.documentCompleted === true,
    videoCompleted: metadata.videoCompleted === true,
    videoRequired: lessonRequiresVideo(lesson),
    trackProgress,
    neighbors: await getLessonNeighbors(lesson.track, lessonId),
  };
}

export async function getLessonNeighbors(trackId: string, lessonId: string) {
  const track = await academyFetchTrack(trackId);
  const ordered = track.modules.flatMap((m) => m.lessons);
  const index = ordered.findIndex((l) => l.id === lessonId);
  return {
    previous: index > 0 ? ordered[index - 1] : null,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null,
  };
}

export type AcademyDashboardLessonActivity = {
  lessonId: string;
  lessonTitle: string;
  trackId: string;
  trackName: string;
  status: "completed" | "in_progress";
  updatedAt: Date;
};

export type AcademyDashboardExamActivity = {
  bankId: string;
  formId: string;
  trackId: string;
  trackName: string;
  score: number;
  passed: boolean;
  submittedAt: Date;
};

export type AcademyContinueLearning = {
  trackId: string;
  trackName: string;
  lessonId: string;
  lessonTitle: string;
};

export type AcademyDashboardSummary = {
  completedLessons: number;
  totalLessons: number;
  tracksStarted: number;
  certificateCount: number;
};

export async function getAcademyDashboard(userId: string) {
  const tracksList = await academyFetchTracks();
  const trackById = new Map(tracksList.map((t) => [t.id, t]));

  const progress = await Promise.all(
    tracksList.map(async (track) => {
      try {
        return await getTrackProgress(userId, track.id);
      } catch {
        return null;
      }
    }),
  );

  const trackProgress = progress.filter((p): p is NonNullable<typeof p> => p !== null);

  const certificates = await prisma.academyCertificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
  });

  const recentLessons: AcademyDashboardLessonActivity[] = [];
  const recentExams: AcademyDashboardExamActivity[] = [];

  for (const tp of trackProgress) {
    const track = trackById.get(tp.trackId);
    const lessonTitles = new Map<string, string>();
    if (track) {
      for (const mod of track.modules) {
        for (const lesson of mod.lessons) {
          lessonTitles.set(lesson.id, lesson.title);
        }
      }
    }

    for (const lp of tp.lessonProgress) {
      const completed = tp.completedLessonIds.includes(lp.lessonId);
      recentLessons.push({
        lessonId: lp.lessonId,
        lessonTitle: lessonTitles.get(lp.lessonId) ?? lp.lessonId,
        trackId: tp.trackId,
        trackName: tp.trackName,
        status: completed ? "completed" : "in_progress",
        updatedAt: lp.updatedAt,
      });
    }

    for (const exam of tp.examAttempts) {
      if (!exam.submittedAt) continue;
      recentExams.push({
        bankId: exam.bankId,
        formId: exam.formId,
        trackId: tp.trackId,
        trackName: tp.trackName,
        score: exam.score,
        passed: exam.passed,
        submittedAt: exam.submittedAt,
      });
    }
  }

  recentLessons.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  recentExams.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  const summary: AcademyDashboardSummary = {
    completedLessons: trackProgress.reduce((sum, t) => sum + t.completion.completed, 0),
    totalLessons: trackProgress.reduce((sum, t) => sum + t.completion.total, 0),
    tracksStarted: trackProgress.filter((t) => t.completion.completed > 0).length,
    certificateCount: certificates.length,
  };

  const continueFromLesson = recentLessons.find((l) => l.status === "in_progress");
  const continueTrack: AcademyContinueLearning | null = continueFromLesson
    ? {
        trackId: continueFromLesson.trackId,
        trackName: continueFromLesson.trackName,
        lessonId: continueFromLesson.lessonId,
        lessonTitle: continueFromLesson.lessonTitle,
      }
    : null;

  return {
    tracks: trackProgress,
    certificates,
    summary,
    recentLessons: recentLessons.slice(0, 8),
    recentExams: recentExams.slice(0, 5),
    continueTrack,
  };
}
