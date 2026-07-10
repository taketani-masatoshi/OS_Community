import { apiErrorResponse } from "@/lib/api-error";
import { AcademyConfigError } from "@/lib/academy/server-client";

function mapAcademyErrorCode(upstreamCode: string, status: number): string {
  if (status === 503 || upstreamCode === "service_unavailable") return "SERVICE_UNAVAILABLE";
  if (status === 404) return "NOT_FOUND";
  return "ACADEMY_UPSTREAM_ERROR";
}

export async function academyUnavailableResponse(error: unknown): Promise<Response> {
  if (error instanceof AcademyConfigError) {
    return apiErrorResponse("SERVICE_UNAVAILABLE", 503);
  }
  return apiErrorResponse("SERVICE_UNAVAILABLE", 503);
}

/** BFF Route Handler — unified `{ code, error }` JSON. */
export async function academyErrorResponse(error: unknown): Promise<Response> {
  if (error instanceof AcademyConfigError) {
    return academyUnavailableResponse(error);
  }
  if (error && typeof error === "object" && "status" in error && "code" in error) {
    const e = error as { status: number; code: string };
    const status = e.status >= 400 && e.status < 600 ? e.status : 502;
    return apiErrorResponse(mapAcademyErrorCode(String(e.code), status), status);
  }
  return apiErrorResponse("ACADEMY_UPSTREAM_ERROR", 502);
}
