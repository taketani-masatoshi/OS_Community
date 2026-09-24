import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { requireAuthApi } from "@/lib/session";
import {
  connectionsRedirect,
  exchangeConnectorCode,
  isConnectorProvider,
  isConnectorShipped,
  pushConnectorTokenToSteward,
  verifyConnectorState,
} from "@/lib/orgos-connectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isConnectorProvider(provider)) {
    return apiErrorResponse("NOT_FOUND", 404);
  }
  if (!isConnectorShipped(provider)) {
    return apiErrorResponse("FEATURE_NOT_SHIPPED", 503);
  }
  const auth = await requireAuthApi();
  if ("error" in auth) return auth.error;

  if (req.nextUrl.searchParams.get("error")) {
    return NextResponse.redirect(
      new URL(connectionsRedirect({ connector: provider, status: "error" }), req.nextUrl.origin),
    );
  }

  const code = req.nextUrl.searchParams.get("code")?.trim() ?? "";
  const state = req.nextUrl.searchParams.get("state")?.trim() ?? "";
  if (!code || !state) return apiErrorResponse("VALIDATION", 400);

  const verified = verifyConnectorState(state);
  if (!verified.ok) return apiErrorResponse("VALIDATION", 400);
  if (verified.payload.provider !== provider) return apiErrorResponse("VALIDATION", 400);
  if (verified.payload.user_id !== auth.session.user.id) {
    return apiErrorResponse("FORBIDDEN", 403);
  }

  try {
    const token = await exchangeConnectorCode(provider, code);
    const pushed = await pushConnectorTokenToSteward({
      provider,
      tenantId: verified.payload.tenant_id,
      nonce: verified.payload.nonce,
      communityUserId: auth.session.user.id,
      communityUserEmail:
        auth.session.user.primaryEmail ?? auth.session.user.email ?? undefined,
      token,
    });
    if (!pushed.ok) {
      return apiErrorResponse(
        pushed.error === "STEWARD_UNAVAILABLE" ? "STEWARD_UNAVAILABLE" : "VALIDATION",
        pushed.status === 401 ? 401 : pushed.status >= 400 ? pushed.status : 503,
      );
    }
    return NextResponse.redirect(
      new URL(connectionsRedirect({ connector: provider, status: "linked" }), req.nextUrl.origin),
    );
  } catch {
    return apiErrorResponse("STEWARD_UNAVAILABLE", 503);
  }
}
