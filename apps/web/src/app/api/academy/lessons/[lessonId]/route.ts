import { getAcademyClient } from "@/lib/academy/server-client";
import { academyErrorResponse, academyUnavailableResponse } from "@/lib/academy/bff-error";
import { AcademyApiError } from "@os-community/academy-client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  try {
    const client = getAcademyClient();
    const lesson = await client.getLesson(lessonId);
    return Response.json({ lesson });
  } catch (error) {
    if (error instanceof AcademyApiError) {
      return await academyErrorResponse(error);
    }
    return await academyUnavailableResponse(error);
  }
}
