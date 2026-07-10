import { requireAuthApi } from "@/lib/session";
import { apiErrorResponse } from "@/lib/api-error";
import { getProfessionalProfile, deleteProfessionalProfile } from "@/lib/identity/professional-profile";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuthApi();
  if ("error" in auth) return auth.error;

  const profile = await getProfessionalProfile(auth.session.user.id);
  return Response.json({ profile });
}

export async function DELETE() {
  const auth = await requireAuthApi();
  if ("error" in auth) return auth.error;

  await deleteProfessionalProfile(auth.session.user.id);
  return Response.json({ ok: true });
}
