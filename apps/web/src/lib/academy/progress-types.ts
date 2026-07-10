import type { LessonSummary } from "@os-community/academy-client";

export const DEFAULT_CURRICULUM_VERSION =
  process.env.ACADEMY_CURRICULUM_VERSION ?? "2026.06.0";

export const EXAM_RETAKE_MAX_ATTEMPTS = Number(process.env.ACADEMY_EXAM_MAX_ATTEMPTS ?? 3);
export const EXAM_RETAKE_COOLDOWN_HOURS = Number(process.env.ACADEMY_EXAM_COOLDOWN_HOURS ?? 24);

export type ProgressEventType =
  | "lesson_started"
  | "lesson_completed"
  | "document_completed"
  | "video_completed"
  | "exam_passed"
  | "exam_failed";

export type LessonProgressMetadata = {
  documentCompleted?: boolean;
  videoCompleted?: boolean;
};

export type RecordProgressInput = {
  type: ProgressEventType;
  lessonId?: string;
  trackId?: string;
  curriculumVersion?: string;
  bankId?: string;
  formId?: string;
  score?: number;
  passScore?: number;
  passed?: boolean;
  answers?: unknown;
  itemResults?: unknown;
};

export function mapProgressEventToLessonStatus(
  type: ProgressEventType,
): "STARTED" | "COMPLETED" | null {
  if (type === "lesson_started") return "STARTED";
  if (type === "lesson_completed" || type === "document_completed") return "COMPLETED";
  return null;
}

export function lessonRequiresVideo(lesson: Pick<LessonSummary, "content" | "video">): boolean {
  if (lesson.content?.video_required === false) return false;
  return Boolean(lesson.video?.youtube?.video_id);
}

export function isLessonFullyComplete(
  lesson: Pick<LessonSummary, "content" | "video">,
  metadata: LessonProgressMetadata | null | undefined,
): boolean {
  const docDone = metadata?.documentCompleted === true;
  const videoDone = !lessonRequiresVideo(lesson) || metadata?.videoCompleted === true;
  return docDone && videoDone;
}

export function computeTrackCompletion(
  completedLessonIds: string[],
  totalLessonIds: string[],
): { completed: number; total: number; percent: number; isComplete: boolean } {
  const total = totalLessonIds.length;
  const completedSet = new Set(completedLessonIds);
  const completed = totalLessonIds.filter((id) => completedSet.has(id)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent, isComplete: total > 0 && completed === total };
}

export function mergeLessonMetadata(
  existing: LessonProgressMetadata | null | undefined,
  type: ProgressEventType,
): LessonProgressMetadata {
  const meta: LessonProgressMetadata = { ...existing };
  if (type === "document_completed" || type === "lesson_completed") {
    meta.documentCompleted = true;
  }
  if (type === "video_completed") {
    meta.videoCompleted = true;
  }
  return meta;
}
