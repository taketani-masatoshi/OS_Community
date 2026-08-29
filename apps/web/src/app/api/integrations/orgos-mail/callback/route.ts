import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { requireAuthApi } from "@/lib/session";
import {
  connectionsRedirect,
  exchangeOrgosGmailCode,
  fetchGmailProfileEmail,
  isTenantMailConnectShipped,
  pushGmailTokenToSteward,
  verifyOrgosMailState,
} from "@/lib/orgos-mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isTenantMailConnectShipped()) {
    return apiErrorResponse("FEATURE_NOT_SHIPPED", 503);
  }
  const auth = await requireAuthApi();
  if ("error" in auth) return auth.error;

  const errorParam = req.nextUrl.searchParams.get("error");
  if (errorParam) {
    return NextResponse.redirect(
      new URL(connectionsRedirect({ orgos_mail: "error" }), req.nextUrl.origin),
    );
  }

  const code = req.nextUrl.searchParams.get("code")?.trim() ?? "";
  const state = req.nextUrl.searchParams.get("state")?.trim() ?? "";
  if (!code || !state) {
    return apiErrorResponse("VALIDATION", 400);
  }

  const verified = verifyOrgosMailState(state);
  if (!verified.ok) {
    return apiErrorResponse("VALIDATION", 400);
  }
  if (verified.payload.user_id !== auth.session.user.id) {
    return apiErrorResponse("FORBIDDEN", 403);
  }

  try {
    const token = await exchangeOrgosGmailCode(code);
    if (!token.refresh_token) {
      return NextResponse.redirect(
        new URL(connectionsRedirect({ orgos_mail: "error" }), req.nextUrl.origin),
      );
    }
    const email =
      (await fetchGmailProfileEmail(token.access_token)) ??
      auth.session.user.primaryEmail ??
      auth.session.user.email ??
      undefined;
    const pushed = await pushGmailTokenToSteward({
      tenantId: verified.payload.tenant_id,
      nonce: verified.payload.nonce,
      communityUserId: auth.session.user.id,
      communityUserEmail: email,
      token: { ...token, email },
    });
    if (!pushed.ok) {
      return apiErrorResponse(
        pushed.error === "STEWARD_UNAVAILABLE" ? "STEWARD_UNAVAILABLE" : "VALIDATION",
        pushed.status === 401 ? 401 : pushed.status >= 400 ? pushed.status : 503,
      );
    }
    return NextResponse.redirect(
      new URL(connectionsRedirect({ orgos_mail: "linked" }), req.nextUrl.origin),
    );
  } catch {
    return apiErrorResponse("STEWARD_UNAVAILABLE", 503);
  }
}
