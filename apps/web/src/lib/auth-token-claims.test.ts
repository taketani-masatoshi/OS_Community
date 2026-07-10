import { describe, expect, it } from "vitest";
import {
  DEFAULT_CLAIMS_REFRESH_MS,
  applyTokenClaims,
  shouldReloadTokenClaims,
} from "./auth-token-claims";

describe("shouldReloadTokenClaims", () => {
  const now = 1_700_000_000_000;
  const freshToken = {
    siteRole: "MEMBER",
    claimsRefreshedAt: now - 60_000,
  };

  it("reloads on sign-in and explicit update triggers", () => {
    expect(shouldReloadTokenClaims(freshToken, { id: "u1" }, undefined, now)).toBe(true);
    expect(shouldReloadTokenClaims(freshToken, undefined, "signIn", now)).toBe(true);
    expect(shouldReloadTokenClaims(freshToken, undefined, "update", now)).toBe(true);
  });

  it("skips reload for fresh cached claims on normal reads", () => {
    expect(shouldReloadTokenClaims(freshToken, undefined, undefined, now)).toBe(false);
  });

  it("reloads when claims are missing or stale", () => {
    expect(shouldReloadTokenClaims({}, undefined, undefined, now)).toBe(true);
    expect(
      shouldReloadTokenClaims(
        { siteRole: "MEMBER", claimsRefreshedAt: now - DEFAULT_CLAIMS_REFRESH_MS - 1 },
        undefined,
        undefined,
        now,
      ),
    ).toBe(true);
  });
});

describe("applyTokenClaims", () => {
  it("stores claimsRefreshedAt", () => {
    const token: Record<string, unknown> = {};
    applyTokenClaims(
      token,
      {
        siteRole: "MEMBER",
        githubLogin: "alice",
        publicSlug: "alice",
        primaryEmail: "alice@example.com",
        profileComplete: true,
        emailLoginConnected: true,
        linkedinConnected: false,
        githubAccountLinked: true,
        githubReposConnected: false,
      },
      123,
    );
    expect(token.claimsRefreshedAt).toBe(123);
    expect(token.profileComplete).toBe(true);
  });
});
