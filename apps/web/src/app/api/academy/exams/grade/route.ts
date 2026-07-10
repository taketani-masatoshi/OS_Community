import { z } from "zod";
import { requireAuthApi } from "@/lib/session";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import { AcademyConfigError } from "@/lib/academy/server-client";
import { gradeExamViaContentApi } from "@/lib/academy/grade-client";
import {
  assertModuleQuizPrerequisites,
  assertTrackExamPrerequisites,
  ExamRetakeBlockedError,
  QuizPrerequisiteError,
  recordProgressEvent,
} from "@/lib/academy/progress-service";
import { DEFAULT_CURRICULUM_VERSION } from "@/lib/academy/progress-types";
import { getAcademyClient } from "@/lib/academy/server-client";

const bodySchema = z.object({
  bankId: z.string().min(1),
  formId: z.string().min(1),
  trackId: z.string().min(1),
  moduleSlug: z.string().optional(),
  curriculumVersion: z.string().optional(),
  answers: z.array(
    z.object({
      item_id: z.string().min(1),
      choice_id: z.string().optional(),
      answer: z.union([z.string(), z.boolean()]).optional(),
    }),
  ),
});

export async function POST(req: Request) {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;

  const baseUrl = process.env.ACADEMY_API_URL;
  const token = process.env.ACADEMY_INTERNAL_TOKEN;
  if (!baseUrl || !token) {
    return apiErrorResponse("SERVICE_UNAVAILABLE", 503);
  }

  const bodyResult = await readJsonBody(req);
  if (bodyResult instanceof Response) return bodyResult;

  const parsed = bodySchema.safeParse(bodyResult);
  if (!parsed.success) {
    return apiErrorResponse("VALIDATION", 400, { extra: { details: parsed.error.flatten() } });
  }

  const curriculumVersion = parsed.data.curriculumVersion ?? DEFAULT_CURRICULUM_VERSION;
  const userId = authResult.session.user.id;

  try {
    if (parsed.data.moduleSlug) {
      const mod = await getAcademyClient().getModule(parsed.data.trackId, parsed.data.moduleSlug);
      await assertModuleQuizPrerequisites(userId, parsed.data.trackId, mod, curriculumVersion);
    } else if (parsed.data.bankId === "ccu-v1") {
      await assertTrackExamPrerequisites(userId, parsed.data.trackId, curriculumVersion);
    }

    const result = await gradeExamViaContentApi(baseUrl, token, {
      bankId: parsed.data.bankId,
      formId: parsed.data.formId,
      answers: parsed.data.answers,
    });

    await recordProgressEvent(userId, {
      type: result.pass ? "exam_passed" : "exam_failed",
      trackId: parsed.data.trackId,
      curriculumVersion,
      bankId: parsed.data.bankId,
      formId: parsed.data.formId,
      score: result.score,
      passScore: result.pass_score,
      passed: result.pass,
      answers: parsed.data.answers,
      itemResults: result.items,
    });

    return Response.json({ result });
  } catch (error) {
    if (error instanceof QuizPrerequisiteError) {
      return apiErrorResponse("QUIZ_PREREQUISITE", 403);
    }
    if (error instanceof ExamRetakeBlockedError) {
      return apiErrorResponse("EXAM_ALREADY_PASSED", 403);
    }
    if (error instanceof AcademyConfigError) {
      return apiErrorResponse("SERVICE_UNAVAILABLE", 503);
    }
    return apiErrorResponse("GRADING_FAILED", 502);
  }
}
