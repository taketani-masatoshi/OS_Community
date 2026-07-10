import { describe, expect, it } from "vitest";
import { FOUNDER_PROFILE_SLUG } from "@os-community/shared";
import { getCanonicalProfileSlug, getUserProfilePath, isFounderProfile } from "./users";

describe("getUserProfilePath", () => {
  it("uses founder slug for founder users", () => {
    expect(
      getUserProfilePath({
        id: "1",
        name: "竹谷昌敏",
        githubLogin: "taketani-masatoshi",
        publicSlug: "other",
      })
    ).toBe(`/users/${FOUNDER_PROFILE_SLUG}`);
  });

  it("prefers publicSlug over githubLogin", () => {
    expect(
      getUserProfilePath({
        id: "2",
        githubLogin: "dev-user",
        publicSlug: "dev-user",
      })
    ).toBe("/users/dev-user");
  });

  it("falls back to githubLogin or id", () => {
    expect(getUserProfilePath({ id: "uuid-1", githubLogin: "alice" })).toBe("/users/alice");
    expect(getUserProfilePath({ id: "uuid-2" })).toBe("/users/uuid-2");
  });
});

describe("getCanonicalProfileSlug", () => {
  it("returns founder slug for founder users", () => {
    expect(
      getCanonicalProfileSlug({
        id: "1",
        name: "竹谷昌敏",
        githubLogin: "legacy-login",
        publicSlug: null,
      })
    ).toBe(FOUNDER_PROFILE_SLUG);
  });

  it("prefers publicSlug then githubLogin then id", () => {
    expect(
      getCanonicalProfileSlug({
        id: "id-1",
        publicSlug: "member-slug",
        githubLogin: "gh-user",
      })
    ).toBe("member-slug");
    expect(getCanonicalProfileSlug({ id: "id-2", githubLogin: "gh-only" })).toBe("gh-only");
    expect(getCanonicalProfileSlug({ id: "id-3" })).toBe("id-3");
  });
});

describe("isFounderProfile", () => {
  it("matches founder profile slug only", () => {
    expect(isFounderProfile(FOUNDER_PROFILE_SLUG)).toBe(true);
    expect(isFounderProfile("someone-else")).toBe(false);
  });
});
