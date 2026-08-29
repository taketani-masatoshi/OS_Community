import { apiErrorResponse } from "@/lib/api-error";
import { getAuthSession } from "@/lib/session";
import {
  isTenantMailConnectShipped,
  resolveOrgosGmailOAuthCredentials,
  stewardProtocolBaseUrl,
} from "@/lib/orgos-mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isTenantMailConnectShipped()) {
    return apiErrorResponse("FEATURE_NOT_SHIPPED", 503);
  }
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return apiErrorResponse("UNAUTHORIZED", 401);
  }
  const oauth = resolveOrgosGmailOAuthCredentials();
  return Response.json({
    ok: true,
    shipped: true,
    oauth_configured: oauth.configured,
    steward_configured: Boolean(stewardProtocolBaseUrl()),
  });
}
