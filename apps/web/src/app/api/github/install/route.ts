import { NextResponse } from "next/server";
import { getGitHubAppInstallUrl, isGitHubAppConfigured } from "@/lib/github-app";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET() {
  if (!isGitHubAppConfigured()) {
    return apiErrorResponse("GITHUB_APP_NOT_CONFIGURED", 503);
  }

  const url = getGitHubAppInstallUrl();
  if (!url) {
    return apiErrorResponse("GITHUB_INSTALL_URL_UNAVAILABLE", 503);
  }

  return NextResponse.redirect(url);
}
