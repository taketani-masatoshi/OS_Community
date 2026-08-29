import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { requireAuthApi } from "@/lib/session";
import {
  buildOrgosGmailAuthorizeUrl,
  isTenantMailConnectShipped,
  resolveOrgosGmailOAuthCredentials,
  signOrgosMailState,
} from "@/lib/orgos-mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isTenantMailConnectShipped()) {
    return apiErrorResponse("FEATURE_NOT_SHIPPED", 503);
  }
  const auth = await requireAuthApi();
  if ("error" in auth) return auth.error;

  const tenantId = req.nextUrl.searchParams.get("tenant_id")?.trim() ?? "";
  const nonce = req.nextUrl.searchParams.get("nonce")?.trim() ?? "";
  if (!tenantId || !nonce) {
    return apiErrorResponse("VALIDATION", 400);
  }

  const oauth = resolveOrgosGmailOAuthCredentials();
  if (!oauth.configured) {
    return apiErrorResponse("ORGOS_MAIL_NOT_CONFIGURED", 503);
  }

  const state = signOrgosMailState({
    tenant_id: tenantId,
    nonce,
    user_id: auth.session.user.id,
    exp: Date.now() + 20 * 60 * 1000,
  });
  const url = buildOrgosGmailAuthorizeUrl(state);
  if (!url) {
    return apiErrorResponse("ORGOS_MAIL_NOT_CONFIGURED", 503);
  }
  return NextResponse.redirect(url);
}
