import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GOOGLE_PROVIDER_ID,
  isAnyLoginProviderConfigured,
  isEmailLoginConfigured,
  isGithubAuthConfigured,
  isGoogleAuthConfigured,
  isLinkedInAuthConfigured,
  isPrimaryLoginConfigured,
  isPrimaryProviderConfigured,
  isPrimaryProviderId,
  resolveGoogleOAuthCredentials,
  resolveLoginAuthErrorMessage,
  resolveUsesSecureCookies,
} from "./auth-env";

const messages = {
  errorConfiguration: "config",
  errorOAuthCallback: "callback",
  errorRedirectUri: "redirect",
  errorSignInWithGoogleFirst: "googleFirst",
  errorAccessDenied: "denied",
  errorAccountNotLinked: "notLinked",
  errorSessionInvalid: "session",
  errorDefault: "default",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveUsesSecureCookies", () => {
  it("prefers request protocol over AUTH_URL", () => {
    vi.stubEnv("AUTH_URL", "https://openorgos.net");
    expect(resolveUsesSecureCookies("http")).toBe(false);
    expect(resolveUsesSecureCookies("https")).toBe(true);
  });

  it("falls back to AUTH_URL when request proto is absent", () => {
    vi.stubEnv("AUTH_URL", "http://localhost:3000");
    expect(resolveUsesSecureCookies(null)).toBe(false);
    vi.stubEnv("AUTH_URL", "https://openorgos.net");
    expect(resolveUsesSecureCookies(undefined)).toBe(true);
  });
});

describe("resolveGoogleOAuthCredentials", () => {
  it("detects configured Google OAuth", () => {
    vi.stubEnv("AUTH_GOOGLE_ID", "google-client-id");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "google-client-secret");
    vi.stubEnv("AUTH_URL", "https://openorgos.net");

    expect(resolveGoogleOAuthCredentials()).toMatchObject({
      configured: true,
      callbackUrl: "https://openorgos.net/api/auth/callback/google",
    });
    expect(isGoogleAuthConfigured()).toBe(true);
  });
});

describe("login provider selection", () => {
  it("treats Google as email login", () => {
    vi.stubEnv("AUTH_GOOGLE_ID", "google-client-id");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "google-client-secret");

    expect(isEmailLoginConfigured()).toBe(true);
    expect(isAnyLoginProviderConfigured()).toBe(true);
  });

  it("treats GitHub and LinkedIn as connect-only (not login providers)", () => {
    vi.stubEnv("AUTH_GITHUB_ID", "github-id");
    vi.stubEnv("AUTH_GITHUB_SECRET", "github-secret");
    vi.stubEnv("AUTH_LINKEDIN_ID", "linkedin-id");
    vi.stubEnv("AUTH_LINKEDIN_SECRET", "linkedin-secret");

    expect(isEmailLoginConfigured()).toBe(false);
    expect(isGithubAuthConfigured()).toBe(true);
    expect(isLinkedInAuthConfigured()).toBe(true);
    expect(isAnyLoginProviderConfigured()).toBe(false);
    expect(isPrimaryLoginConfigured()).toBe(false);
  });
});

describe("provider helpers", () => {
  it("identifies Google as the primary email provider", () => {
    expect(isPrimaryProviderId(GOOGLE_PROVIDER_ID)).toBe(true);
    expect(isPrimaryProviderId("github")).toBe(false);
    expect(isPrimaryProviderId("linkedin")).toBe(false);
  });

  it("checks provider configuration", () => {
    vi.stubEnv("AUTH_GOOGLE_ID", "google-client-id");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "google-client-secret");

    expect(isPrimaryProviderConfigured(GOOGLE_PROVIDER_ID)).toBe(true);
  });
});

describe("isGithubAuthConfigured", () => {
  it("returns false when GitHub OAuth env vars are missing", () => {
    vi.stubEnv("AUTH_GITHUB_ID", "");
    vi.stubEnv("AUTH_GITHUB_SECRET", "");
    expect(isGithubAuthConfigured()).toBe(false);
  });
});

describe("resolveLoginAuthErrorMessage", () => {
  it("returns null when error is absent", () => {
    expect(resolveLoginAuthErrorMessage(undefined, messages)).toBeNull();
  });

  it("maps known NextAuth error codes", () => {
    expect(resolveLoginAuthErrorMessage("Configuration", messages)).toBe("config");
    expect(resolveLoginAuthErrorMessage("AccessDenied", messages)).toBe("denied");
    expect(resolveLoginAuthErrorMessage("OAuthAccountNotLinked", messages)).toBe("notLinked");
    expect(resolveLoginAuthErrorMessage("OAuthCallback", messages)).toBe("redirect");
    expect(resolveLoginAuthErrorMessage("SignInWithGoogleFirst", messages)).toBe("googleFirst");
    expect(resolveLoginAuthErrorMessage("JWTSessionError", messages)).toBe("session");
  });

  it("falls back to default for unknown codes", () => {
    expect(resolveLoginAuthErrorMessage("SomethingElse", messages)).toBe("default");
  });
});
