import { NextRequest } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { getAuthSession } from "@/lib/session";
import {
  isConnectorProvider,
  isConnectorShipped,
  resolveConnectorCredentials,
  stewardProtocolBaseUrl,
} from "@/lib/orgos-connectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isConnectorProvider(provider)) {
    return apiErrorResponse("NOT_FOUND", 404);
  }
  if (!isConnectorShipped(provider)) {
    return apiErrorResponse("FEATURE_NOT_SHIPPED", 503);
  }
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return apiErrorResponse("UNAUTHORIZED", 401);
  }
  return Response.json({
    ok: true,
    provider,
    shipped: true,
    oauth_configured: resolveConnectorCredentials(provider).configured,
    steward_configured: Boolean(stewardProtocolBaseUrl()),
  });
}
