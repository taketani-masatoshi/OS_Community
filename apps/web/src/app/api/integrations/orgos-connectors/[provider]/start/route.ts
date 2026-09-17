import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { requireAuthApi } from "@/lib/session";
import {
  buildConnectorAuthorizeUrl,
  isConnectorProvider,
  isConnectorShipped,
  resolveConnectorCredentials,
  signConnectorState,
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

  const tenantId = req.nextUrl.searchParams.get("tenant_id")?.trim() ?? "";
  const nonce = req.nextUrl.searchParams.get("nonce")?.trim() ?? "";
  if (!tenantId || !nonce) {
    return apiErrorResponse("VALIDATION", 400);
  }

  if (!resolveConnectorCredentials(provider).configured) {
    return apiErrorResponse("ORGOS_CONNECTOR_NOT_CONFIGURED", 503);
  }

  const state = signConnectorState({
    provider,
    tenant_id: tenantId,
    nonce,
    user_id: auth.session.user.id,
    exp: Date.now() + 20 * 60 * 1000,
  });
  const url = buildConnectorAuthorizeUrl(provider, state);
  if (!url) {
    return apiErrorResponse("ORGOS_CONNECTOR_NOT_CONFIGURED", 503);
  }
  return NextResponse.redirect(url);
}
