import { describe, expect, it } from "vitest";
import { canMergeOAuthAccounts } from "./merge-oauth-account";

describe("canMergeOAuthAccounts", () => {
  it("allows merge when Google and GitHub share the same email", () => {
    expect(
      canMergeOAuthAccounts({
        primaryEmail: "User@Example.com",
        legacyEmail: "user@example.com",
        profileEmail: null,
      })
    ).toBe(true);
  });

  it("allows merge when OAuth profile email matches primary", () => {
    expect(
      canMergeOAuthAccounts({
        primaryEmail: "user@example.com",
        legacyEmail: null,
        profileEmail: "user@example.com",
      })
    ).toBe(true);
  });

  it("rejects merge when emails differ", () => {
    expect(
      canMergeOAuthAccounts({
        primaryEmail: "google@example.com",
        legacyEmail: "github@example.com",
        profileEmail: "github@example.com",
      })
    ).toBe(false);
  });

  it("rejects merge when primary email is missing", () => {
    expect(
      canMergeOAuthAccounts({
        primaryEmail: null,
        legacyEmail: "user@example.com",
        profileEmail: "user@example.com",
      })
    ).toBe(false);
  });
});
