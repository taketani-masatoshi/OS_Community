import { requireAuthApi } from "@/lib/session";
import { getUserProfile, saveUserProfile } from "@/lib/user-profile";
import { apiErrorResponse } from "@/lib/api-error";
import { readJsonBody } from "@/lib/api-body";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuthApi();
  if ("error" in auth) return auth.error;

  const profile = await getUserProfile(auth.session.user.id);
  if (!profile) return apiErrorResponse("NOT_FOUND", 404);

  return Response.json(profile);
}

export async function PATCH(request: Request) {
  const auth = await requireAuthApi();
  if ("error" in auth) return auth.error;

  const bodyResult = await readJsonBody<{
    name?: string;
    specialty?: string;
    region?: string;
    organization?: string;
    bio?: string;
  }>(request);
  if (bodyResult instanceof Response) return bodyResult;
  const body = bodyResult;

  try {
    const user = await saveUserProfile(auth.session.user.id, {
      name: body.name ?? "",
      specialty: body.specialty ?? "",
      region: body.region ?? "",
      organization: body.organization,
      bio: body.bio,
    });
    return Response.json(user);
  } catch {
    return apiErrorResponse("INVALID_INPUT", 400);
  }
}
