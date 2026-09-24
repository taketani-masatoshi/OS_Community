/**
 * OrgOS connector OAuth broker (Slack / Asana / Google Drive).
 * Path: apps/web/src/lib/orgos-connectors.ts
 *
 * Community performs the OAuth dance and immediately hands the token to
 * Steward — nothing is persisted here. Each provider ships independently so an
 * unfinished integration can never appear in the Connections page.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthBaseUrl } from "@/lib/auth-env";

export const CONNECTOR_PROVIDERS = ["slack", "asana", "gdrive"] as const;

export type ConnectorProvider = (typeof CONNECTOR_PROVIDERS)[number];

export function isConnectorProvider(value: string): value is ConnectorProvider {
  return (CONNECTOR_PROVIDERS as readonly string[]).includes(value);
}

const PROVIDER_SCOPES: Record<ConnectorProvider, string[]> = {
  slack: ["chat:write", "channels:read"],
  asana: ["tasks:read", "tasks:write", "projects:read"],
  gdrive: ["https://www.googleapis.com/auth/drive.file"],
};

const SHIPPED_ENV: Record<ConnectorProvider, string> = {
  slack: "COMMUNITY_SLACK_CONNECT_SHIPPED",
  asana: "COMMUNITY_ASANA_CONNECT_SHIPPED",
  gdrive: "COMMUNITY_GDRIVE_CONNECT_SHIPPED",
};

export type ConnectorStatePayload = {
  provider: ConnectorProvider;
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

export function isConnectorShipped(provider: ConnectorProvider): boolean {
  return process.env[SHIPPED_ENV[provider]] === "1";
}

export function shippedConnectors(): ConnectorProvider[] {
  return CONNECTOR_PROVIDERS.filter(isConnectorShipped);
}

export function connectorCallbackUrl(provider: ConnectorProvider): string {
  const base = getAuthBaseUrl().replace(/\/$/, "");
  return `${base}/api/integrations/orgos-connectors/${provider}/callback`;
}

export function resolveConnectorCredentials(provider: ConnectorProvider): {
  clientId?: string;
  clientSecret?: string;
  configured: boolean;
  callbackUrl: string;
} {
  const upper = provider.toUpperCase();
  const clientId =
    provider === "gdrive"
      ? readEnv("ORGOS_GDRIVE_CLIENT_ID", "ORGOS_GMAIL_CLIENT_ID", "AUTH_GOOGLE_ID")
      : readEnv(`ORGOS_${upper}_CLIENT_ID`);
  const clientSecret =
    provider === "gdrive"
      ? readEnv("ORGOS_GDRIVE_CLIENT_SECRET", "ORGOS_GMAIL_CLIENT_SECRET", "AUTH_GOOGLE_SECRET")
      : readEnv(`ORGOS_${upper}_CLIENT_SECRET`);
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret),
    callbackUrl: connectorCallbackUrl(provider),
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
  if (!secret) throw new Error("AUTH_SECRET required to sign connector OAuth state");
  return secret;
}

function b64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

export function signConnectorState(payload: ConnectorStatePayload): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", signingSecret()).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

export function verifyConnectorState(
  state: string,
  nowMs = Date.now(),
): { ok: true; payload: ConnectorStatePayload } | { ok: false; error: string } {
  const [body, sig] = state.split(".");
  if (!body || !sig) return { ok: false, error: "invalid_state" };
  const expected = createHmac("sha256", signingSecret()).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, error: "invalid_state" };
  }
  let payload: ConnectorStatePayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ConnectorStatePayload;
  } catch {
    return { ok: false, error: "invalid_state" };
  }
  if (!payload.provider || !payload.tenant_id || !payload.nonce || !payload.user_id) {
    return { ok: false, error: "invalid_state" };
  }
  if (!isConnectorProvider(payload.provider)) return { ok: false, error: "invalid_state" };
  if (typeof payload.exp !== "number" || nowMs > payload.exp) {
    return { ok: false, error: "state_expired" };
  }
  return { ok: true, payload };
}

export function buildConnectorAuthorizeUrl(
  provider: ConnectorProvider,
  state: string,
): string | undefined {
  const creds = resolveConnectorCredentials(provider);
  if (!creds.configured || !creds.clientId) return undefined;
  const scopes = PROVIDER_SCOPES[provider];

  if (provider === "slack") {
    const params = new URLSearchParams({
      client_id: creds.clientId,
      scope: scopes.join(","),
      redirect_uri: creds.callbackUrl,
      state,
    });
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  if (provider === "asana") {
    const params = new URLSearchParams({
      client_id: creds.clientId,
      redirect_uri: creds.callbackUrl,
      response_type: "code",
      scope: scopes.join(" "),
      state,
    });
    return `https://app.asana.com/-/oauth_authorize?${params.toString()}`;
  }

  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: creds.callbackUrl,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export type ConnectorTokenPayload = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expiry_date?: number;
  scope?: string;
  account_label?: string;
  account_id?: string;
};

/** Slack returns the bot token in a nested shape; the others are standard OAuth2. */
export async function exchangeConnectorCode(
  provider: ConnectorProvider,
  code: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ConnectorTokenPayload> {
  const creds = resolveConnectorCredentials(provider);
  if (!creds.configured || !creds.clientId || !creds.clientSecret) {
    throw new Error("CONNECTOR_NOT_CONFIGURED");
  }

  if (provider === "slack") {
    const res = await fetchImpl("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        redirect_uri: creds.callbackUrl,
      }),
    });
    const body = (await res.json()) as {
      ok?: boolean;
      access_token?: string;
      scope?: string;
      team?: { id?: string; name?: string };
    };
    if (!res.ok || !body.ok || !body.access_token) throw new Error("CONNECTOR_EXCHANGE_FAILED");
    return {
      access_token: body.access_token,
      token_type: "Bearer",
      scope: body.scope,
      account_label: body.team?.name,
      account_id: body.team?.id,
    };
  }

  const tokenUrl =
    provider === "asana"
      ? "https://app.asana.com/-/oauth_token"
      : "https://oauth2.googleapis.com/token";
  const res = await fetchImpl(tokenUrl, {
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
  if (!res.ok) throw new Error("CONNECTOR_EXCHANGE_FAILED");
  const body = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
    data?: { email?: string; name?: string; gid?: string };
  };
  if (!body.access_token) throw new Error("CONNECTOR_EXCHANGE_FAILED");
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    token_type: body.token_type ?? "Bearer",
    expiry_date: body.expires_in ? Date.now() + body.expires_in * 1000 : undefined,
    scope: body.scope,
    account_label: body.data?.name ?? body.data?.email,
    account_id: body.data?.gid,
  };
}

export async function pushConnectorTokenToSteward(
  input: {
    provider: ConnectorProvider;
    tenantId: string;
    nonce: string;
    communityUserId: string;
    communityUserEmail?: string;
    token: ConnectorTokenPayload;
  },
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; status: number; error?: string }> {
  const base = stewardProtocolBaseUrl()?.replace(/\/$/, "");
  const governance = communityGovernanceToken();
  if (!base || !governance) {
    return { ok: false, status: 503, error: "STEWARD_UNAVAILABLE" };
  }
  const res = await fetchImpl(`${base}/protocol/v1/community/connectors/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${governance}`,
    },
    body: JSON.stringify({
      provider: input.provider,
      tenant_id: input.tenantId,
      nonce: input.nonce,
      community_user_id: input.communityUserId,
      community_user_email: input.communityUserEmail,
      token: input.token,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || body.ok === false) {
    return {
      ok: false,
      status: res.status >= 400 ? res.status : 503,
      error: body.error ?? "STEWARD_UNAVAILABLE",
    };
  }
  return { ok: true, status: res.status };
}

export function connectionsRedirect(query: Record<string, string>): string {
  const params = new URLSearchParams(query);
  return `/settings/connections?${params.toString()}`;
}
