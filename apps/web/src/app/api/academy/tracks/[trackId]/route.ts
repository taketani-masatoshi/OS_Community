import { getAcademyClient } from "@/lib/academy/server-client";
import { academyErrorResponse, academyUnavailableResponse } from "@/lib/academy/bff-error";
import { AcademyApiError } from "@os-community/academy-client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const { trackId } = await params;
  try {
    const client = getAcademyClient();
    const track = await client.getTrack(trackId);
    return Response.json({ track });
  } catch (error) {
    if (error instanceof AcademyApiError) {
      return await academyErrorResponse(error);
    }
    return await academyUnavailableResponse(error);
  }
}
