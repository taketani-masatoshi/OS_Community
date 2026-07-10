import { checkDatabaseHealth } from "@/lib/db-health";
import { checkAcademyHealth } from "@/lib/academy/health";
import {
  getAuthBaseUrl,
  isLinkedInAuthConfigured,
  isPrimaryLoginConfigured,
  resolveGoogleOAuthCredentials,
} from "@/lib/auth-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OVERVIEW_ORIGINS = new Set(["https://oorgos.org", "https://www.oorgos.org"]);

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  if (!origin || !OVERVIEW_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  };
}

export async function OPTIONS(request: Request) {
  const headers = corsHeaders(request);
  if (!("Access-Control-Allow-Origin" in headers)) {
    return new Response(null, { status: 204 });
  }
  return new Response(null, { status: 204, headers });
}

export async function GET(request: Request) {
  const [db, academy] = await Promise.all([checkDatabaseHealth(), checkAcademyHealth()]);
  const authConfigured = Boolean(process.env.AUTH_SECRET?.trim());
  const loginConfigured = isPrimaryLoginConfigured();
  const google = resolveGoogleOAuthCredentials();
  const authBaseUrl = getAuthBaseUrl();

  const checks = {
    database: db.ok,
    authSecret: authConfigured,
    primaryLogin: loginConfigured,
    academyConfigured: academy.configured,
    academyReachable: academy.configured ? academy.reachable : true,
    linkedInConnect: isLinkedInAuthConfigured(),
  };

  const ok = db.ok && authConfigured && loginConfigured;

  return Response.json(
    {
      status: ok ? "ok" : "degraded",
      checks,
      authUrl: authBaseUrl,
      googleCallbackUrl: google.callbackUrl,
      databaseLatencyMs: db.latencyMs,
      ...(academy.configured
        ? { academyLatencyMs: academy.latencyMs, ...(academy.error ? { academyError: academy.error } : {}) }
        : {}),
      ...(db.error ? { databaseError: db.error } : {}),
    },
    { status: ok ? 200 : 503, headers: corsHeaders(request) },
  );
}
