import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthBaseUrl } from "@/lib/auth-env";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
];

export type OrgosMailStatePayload = {
  tenant_id: string;
  nonce: string;
  user_id: string;
  exp: number;
};

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function isTenantMailConnectShipped(): boolean {
  return process.env.COMMUNITY_TENANT_MAIL_CONNECT_SHIPPED === "1";
}

export function resolveOrgosGmailOAuthCredentials(): {
  clientId?: string;
  clientSecret?: string;
  configured: boolean;
  callbackUrl: string;
} {
  const clientId = readEnv("ORGOS_GMAIL_CLIENT_ID", "AUTH_GOOGLE_ID", "GOOGLE_CLIENT_ID");
  const clientSecret = readEnv(
    "ORGOS_GMAIL_CLIENT_SECRET",
    "AUTH_GOOGLE_SECRET",
    "GOOGLE_CLIENT_SECRET",
  );
  const base = getAuthBaseUrl().replace(/\/$/, "");
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret),
    callbackUrl: `${base}/api/integrations/orgos-mail/callback`,
  };
}

export function stewardProtocolBaseUrl(): string | undefined {
  return readEnv("ORGOS_STEWARD_PROTOCOL_URL", "STEWARD_API_URL");
}

export function communityGovernanceToken(): string | undefined {
  return readEnv("ORGOS_COMMUNITY_GOVERNANCE_TOKEN");
}

function signingSecret(): string {
  const secret = readEnv("AUTH_SECRET");
  if (!secret) throw new Error("AUTH_SECRET required to sign OrgOS mail OAuth state");
  return secret;
}

function b64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

export function signOrgosMailState(payload: OrgosMailStatePayload): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", signingSecret()).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

export function verifyOrgosMailState(
  state: string,
  nowMs = Date.now(),
): { ok: true; payload: OrgosMailStatePayload } | { ok: false; error: string } {
  const [body, sig] = state.split(".");
  if (!body || !sig) return { ok: false, error: "invalid_state" };
  const expected = createHmac("sha256", signingSecret()).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, error: "invalid_state" };
  }
  let payload: OrgosMailStatePayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OrgosMailStatePayload;
  } catch {
    return { ok: false, error: "invalid_state" };
  }
  if (!payload.tenant_id || !payload.nonce || !payload.user_id) {
    return { ok: false, error: "invalid_state" };
  }
  if (typeof payload.exp !== "number" || nowMs > payload.exp) {
    return { ok: false, error: "state_expired" };
  }
  return { ok: true, payload };
}

export function buildOrgosGmailAuthorizeUrl(state: string): string | undefined {
  const creds = resolveOrgosGmailOAuthCredentials();
  if (!creds.configured || !creds.clientId) return undefined;
  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: creds.callbackUrl,
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export type GmailTokenPayload = {
  version: 1;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expiry_date?: number;
  scope?: string;
  email?: string;
};

export async function exchangeOrgosGmailCode(code: string): Promise<GmailTokenPayload> {
  const creds = resolveOrgosGmailOAuthCredentials();
  if (!creds.configured || !creds.clientId || !creds.clientSecret) {
    throw new Error("ORGOS_MAIL_NOT_CONFIGURED");
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      redirect_uri: creds.callbackUrl,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("ORGOS_MAIL_NOT_CONFIGURED");
  const body = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
  };
  if (!body.access_token) throw new Error("ORGOS_MAIL_NOT_CONFIGURED");
  return {
    version: 1,
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    token_type: body.token_type ?? "Bearer",
    expiry_date: body.expires_in ? Date.now() + body.expires_in * 1000 : undefined,
    scope: body.scope,
  };
}

export async function fetchGmailProfileEmail(accessToken: string): Promise<string | undefined> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return undefined;
  const body = (await res.json()) as { email?: string };
  return body.email?.trim();
}

export async function pushGmailTokenToSteward(input: {
  tenantId: string;
  nonce: string;
  communityUserId: string;
  communityUserEmail?: string;
  token: GmailTokenPayload;
}): Promise<{ ok: boolean; status: number; email?: string; error?: string }> {
  const base = stewardProtocolBaseUrl()?.replace(/\/$/, "");
  const token = communityGovernanceToken();
  if (!base || !token) {
    return { ok: false, status: 503, error: "STEWARD_UNAVAILABLE" };
  }
  const creds = resolveOrgosGmailOAuthCredentials();
  const res = await fetch(`${base}/protocol/v1/community/tenant-mail/gmail-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tenant_id: input.tenantId,
      nonce: input.nonce,
      community_user_id: input.communityUserId,
      community_user_email: input.communityUserEmail,
      oauth_client_id: creds.clientId,
      token: input.token,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    email?: string;
    error?: string;
  };
  if (!res.ok || body.ok === false) {
    return {
      ok: false,
      status: res.status >= 400 ? res.status : 503,
      error: body.error ?? "STEWARD_UNAVAILABLE",
    };
  }
  return { ok: true, status: res.status, email: body.email };
}

export function connectionsRedirect(query: Record<string, string>): string {
  const params = new URLSearchParams(query);
  return `/settings/connections?${params.toString()}`;
}
