import { createHmac } from "node:crypto";

const DEFAULT_AUDIENCE = "orgos-operator-console";
const TTL_SECONDS = 60;

export type ConsoleHandoffClaims = {
  sub: string;
  email: string;
  google_sub?: string;
  operator_id?: string;
  name?: string;
};

function issuer(): string {
  return (
    process.env.COMMUNITY_CONSOLE_OIDC_ISSUER?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    ""
  ).replace(/\/$/, "");
}

function audience(): string {
  return process.env.COMMUNITY_CONSOLE_OIDC_AUDIENCE?.trim() || DEFAULT_AUDIENCE;
}

function hs256Secret(): string | null {
  const secret = process.env.COMMUNITY_CONSOLE_OIDC_HS256_SECRET?.trim();
  return secret || null;
}

export function getConsoleHandoffConfig(): {
  configured: boolean;
  issuer: string;
  audience: string;
  consoleBaseUrl: string | null;
} {
  const consoleBaseUrl =
    process.env.OPERATOR_CONSOLE_HANDOFF_URL?.trim() ||
    process.env.NEXT_PUBLIC_OPERATOR_CONSOLE_URL?.trim() ||
    null;
  const iss = issuer();
  const secret = hs256Secret();
  return {
    configured: Boolean(secret && iss && consoleBaseUrl),
    issuer: iss,
    audience: audience(),
    consoleBaseUrl,
  };
}

/** Mint a short-lived HS256 id_token for Operator Console SSO. */
export function mintConsoleHandoffIdToken(claims: ConsoleHandoffClaims): string | { error: string } {
  const secret = hs256Secret();
  const iss = issuer();
  const aud = audience();
  if (!secret) {
    return { error: "COMMUNITY_CONSOLE_OIDC_HS256_SECRET is not configured" };
  }
  if (!iss) {
    return {
      error:
        "COMMUNITY_CONSOLE_OIDC_ISSUER (or AUTH_URL / NEXT_PUBLIC_SITE_URL) is not configured",
    };
  }
  if (!claims.email?.trim()) {
    return { error: "email required for console handoff" };
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss,
      aud,
      sub: claims.sub,
      email: claims.email.trim().toLowerCase(),
      google_sub: claims.google_sub,
      operator_id: claims.operator_id,
      name: claims.name,
      iat: now,
      exp: now + TTL_SECONDS,
    }),
  ).toString("base64url");
  const signed = `${header}.${payload}`;
  const sig = createHmac("sha256", secret).update(signed).digest("base64url");
  return `${signed}.${sig}`;
}

/** Only allow same-origin relative paths (open-redirect safe). */
export function safeConsoleNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.includes("://") || raw.includes("\\")) return "/";
  return raw;
}

export function buildConsoleHandoffUrl(consoleBaseUrl: string, token: string, next: string): string {
  const base = consoleBaseUrl.replace(/\/+$/, "");
  const url = new URL("/auth/community-handoff", `${base}/`);
  url.searchParams.set("token", token);
  url.searchParams.set("next", next);
  return url.toString();
}
