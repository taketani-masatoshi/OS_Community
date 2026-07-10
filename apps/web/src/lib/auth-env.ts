import type { Locale } from "@os-community/shared";

export const GOOGLE_PROVIDER_ID = "google" as const;

export type PrimaryLoginProviderId = typeof GOOGLE_PROVIDER_ID;

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getAuthBaseUrl(): string {
  return readEnv("AUTH_URL", "NEXTAUTH_URL") ?? "http://localhost:3000";
}

/** Prefer request protocol over AUTH_URL so localhost HTTP works when AUTH_URL is https. */
export function resolveUsesSecureCookies(requestProto?: string | null): boolean {
  const proto = requestProto?.split(",")[0]?.trim().toLowerCase();
  if (proto === "http") return false;
  if (proto === "https") return true;
  return getAuthBaseUrl().startsWith("https://");
}

export function getOAuthCallbackUrl(providerId: string): string {
  const base = getAuthBaseUrl().replace(/\/$/, "");
  return `${base}/api/auth/callback/${providerId}`;
}

export function resolveGoogleOAuthCredentials() {
  const clientId = readEnv("AUTH_GOOGLE_ID", "GOOGLE_CLIENT_ID");
  const clientSecret = readEnv("AUTH_GOOGLE_SECRET", "GOOGLE_CLIENT_SECRET");
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret),
    callbackUrl: getOAuthCallbackUrl(GOOGLE_PROVIDER_ID),
  };
}

export function isGithubAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_GITHUB_ID?.trim() && process.env.AUTH_GITHUB_SECRET?.trim()
  );
}

export function isGoogleAuthConfigured(): boolean {
  return resolveGoogleOAuthCredentials().configured;
}

export function isLinkedInAuthConfigured(): boolean {
  return resolveLinkedInOAuthCredentials().configured;
}

/** Google is the canonical OpenOrgOS email login when configured. */
export function isEmailLoginConfigured(): boolean {
  return isGoogleAuthConfigured();
}

/** Login page accepts Google only; GitHub/LinkedIn are linked after sign-in. */
export function isAnyLoginProviderConfigured(): boolean {
  return isGoogleAuthConfigured();
}

export function isPrimaryLoginConfigured(): boolean {
  return isGoogleAuthConfigured();
}

export function resolveLinkedInOAuthCredentials() {
  const clientId = readEnv("AUTH_LINKEDIN_ID");
  const clientSecret = readEnv("AUTH_LINKEDIN_SECRET");
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret),
    callbackUrl: getOAuthCallbackUrl("linkedin"),
  };
}

export function isPrimaryProviderId(
  provider: string
): provider is PrimaryLoginProviderId {
  return provider === GOOGLE_PROVIDER_ID;
}

export function isPrimaryProviderConfigured(provider: PrimaryLoginProviderId): boolean {
  return provider === GOOGLE_PROVIDER_ID && isGoogleAuthConfigured();
}

/** Human-readable OpenOrgOS email login label for UI copy. */
export function getPrimaryLoginProviderLabel(locale: Locale): string {
  return locale === "ja" ? "Google" : "Google";
}

export function applyPrimaryLoginProviderLabel(text: string, locale: Locale): string {
  return text.replaceAll("{providers}", getPrimaryLoginProviderLabel(locale));
}

export function resolveLoginAuthErrorMessage(
  error: string | undefined,
  messages: {
    errorConfiguration: string;
    errorOAuthCallback: string;
    errorRedirectUri: string;
    errorSignInWithGoogleFirst: string;
    errorAccessDenied: string;
    errorAccountNotLinked: string;
    errorAccountSuspended: string;
    errorSessionInvalid: string;
    errorDefault: string;
  },
  locale?: Locale
): string | null {
  if (!error) return null;

  const localize = (message: string) =>
    locale ? applyPrimaryLoginProviderLabel(message, locale) : message;

  switch (error) {
    case "Configuration":
      return localize(messages.errorConfiguration);
    case "SignInWithGoogleFirst":
      return localize(messages.errorSignInWithGoogleFirst);
    case "AccessDenied":
      return localize(messages.errorAccessDenied);
    case "AccountSuspended":
      return localize(messages.errorAccountSuspended);
    case "OAuthAccountNotLinked":
      return localize(messages.errorAccountNotLinked);
    case "OAuthCallback":
    case "OAuthSignin":
    case "Callback":
    case "CredentialsSignin":
    case "SessionRequired":
      return localize(messages.errorRedirectUri);
    case "InvalidCheck":
    case "JWTSessionError":
      return localize(messages.errorSessionInvalid);
    default:
      return localize(messages.errorDefault);
  }
}
