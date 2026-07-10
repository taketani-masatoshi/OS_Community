import { NextResponse } from "next/server";
import {
  getGitHubAppConfig,
  isGitHubAppConfigured,
} from "@/lib/github-app";
import {
  removeGitHubAppInstallation,
  triggerGitHubProvisioning,
  upsertGitHubAppInstallation,
  verifyGitHubWebhookSignature,
} from "@/lib/github-provisioning";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";

type InstallationPayload = {
  action?: string;
  installation?: {
    id?: number;
    account?: { login?: string; type?: string };
  };
};

export async function POST(req: Request) {
  if (!isGitHubAppConfigured()) {
    return apiErrorResponse("GITHUB_APP_NOT_CONFIGURED", 503);
  }

  const config = getGitHubAppConfig();
  if (!config) {
    return apiErrorResponse("GITHUB_APP_NOT_CONFIGURED", 503);
  }

  const payload = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  if (!verifyGitHubWebhookSignature(payload, signature, config.webhookSecret)) {
    return apiErrorResponse("WEBHOOK_INVALID_SIGNATURE", 401);
  }

  const event = req.headers.get("x-github-event");
  let body: InstallationPayload;
  try {
    body = JSON.parse(payload) as InstallationPayload;
  } catch {
    return apiErrorResponse("INVALID_JSON", 400);
  }

  if (event === "installation") {
    const installationId = body.installation?.id;
    const accountLogin = body.installation?.account?.login;
    const accountType = body.installation?.account?.type;

    if (body.action === "deleted" && installationId) {
      await removeGitHubAppInstallation(installationId);
    } else if (installationId && accountLogin && accountType) {
      await upsertGitHubAppInstallation({ installationId, accountLogin, accountType });
    }
  }

  if (event === "installation_repositories") {
    const installationId = body.installation?.id;
    const accountLogin = body.installation?.account?.login;
    if (installationId && accountLogin) {
      const user = await prisma.user.findFirst({
        where: { githubLogin: accountLogin },
        select: { id: true },
      });
      if (user) {
        triggerGitHubProvisioning(user.id);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
