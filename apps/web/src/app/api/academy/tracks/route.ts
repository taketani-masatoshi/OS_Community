import { getAcademyClient } from "@/lib/academy/server-client";
import { academyErrorResponse, academyUnavailableResponse } from "@/lib/academy/bff-error";
import { AcademyApiError } from "@os-community/academy-client";

/** Public read proxy — auth は Phase 3 で拡張 */
export async function GET() {
  try {
    const client = getAcademyClient();
    const tracks = await client.getTracks();
    return Response.json({ tracks });
  } catch (error) {
    if (error instanceof AcademyApiError) {
      return await academyErrorResponse(error);
    }
    return await academyUnavailableResponse(error);
  }
}
