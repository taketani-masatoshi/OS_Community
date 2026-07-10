import { requireAuthApi } from "@/lib/session";
import { isGitHubAppConfigured } from "@/lib/github-app";
import { provisionUserGitHubPermissions } from "@/lib/github-provisioning";
import { apiErrorResponse } from "@/lib/api-error";

export async function POST() {
  if (!isGitHubAppConfigured()) {
    return apiErrorResponse("GITHUB_APP_NOT_CONFIGURED", 503);
  }

  const authResult = await requireAuthApi();
  if ("error" in authResult) return authResult.error;

  const result = await provisionUserGitHubPermissions(authResult.session.user.id);
  return Response.json(result);
}
