import { z } from "zod";
import { requireAuthApi } from "@/lib/session";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";
import {
  getTrackProgress,
  recordProgressEvent,
} from "@/lib/academy/progress-service";
import { DEFAULT_CURRICULUM_VERSION } from "@/lib/academy/progress-types";

const postBodySchema = z.object({
  type: z.enum([
    "document_completed",
    "video_completed",
    "lesson_started",
    "lesson_completed",
  ]),
  lessonId: z.string().min(1),
  curriculumVersion: z.string().optional(),
  trackId: z.string().optional(),
});

export async function GET(req: Request) {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;

  const url = new URL(req.url);
  const trackId = url.searchParams.get("trackId");
  if (!trackId) {
    return apiErrorResponse("TRACK_ID_REQUIRED", 400);
  }

  const curriculumVersion =
    url.searchParams.get("curriculumVersion") ?? DEFAULT_CURRICULUM_VERSION;

  try {
    const progress = await getTrackProgress(
      authResult.session.user.id,
      trackId,
      curriculumVersion,
    );
    return Response.json(progress);
  } catch {
    return apiErrorResponse("PROGRESS_LOAD_FAILED", 503);
  }
}

export async function POST(req: Request) {
  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;

  const bodyResult = await readJsonBody(req);
  if (bodyResult instanceof Response) return bodyResult;

  const parsed = postBodySchema.safeParse(bodyResult);
  if (!parsed.success) {
    return apiErrorResponse("VALIDATION", 400, { extra: { details: parsed.error.flatten() } });
  }

  try {
    const result = await recordProgressEvent(authResult.session.user.id, parsed.data);
    return Response.json({ ok: true, ...result });
  } catch {
    return apiErrorResponse("PROGRESS_SAVE_FAILED", 503);
  }
}
