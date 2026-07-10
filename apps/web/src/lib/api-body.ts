import { apiErrorResponse } from "@/lib/api-error";

export async function readJsonBody<T>(req: Request): Promise<T | Response> {
  try {
    return (await req.json()) as T;
  } catch {
    return apiErrorResponse("INVALID_JSON", 400);
  }
}
