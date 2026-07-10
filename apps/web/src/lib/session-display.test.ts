import { describe, expect, it } from "vitest";
import { getSessionDisplayName, isSignedInSession } from "./session-display";

describe("isSignedInSession", () => {
  it("returns true when user id is present", () => {
    expect(isSignedInSession({ user: { id: "u1" } } as never)).toBe(true);
  });

  it("returns false when session is missing or user id is absent", () => {
    expect(isSignedInSession(null)).toBe(false);
    expect(isSignedInSession({ user: { name: "Alice" } } as never)).toBe(false);
  });
});

describe("getSessionDisplayName", () => {
  it("prefers github login, then name, then email fallbacks", () => {
    expect(getSessionDisplayName({ githubLogin: "alice", name: "Alice" } as never)).toBe("alice");
    expect(getSessionDisplayName({ name: "Alice", primaryEmail: "a@example.com" } as never)).toBe(
      "Alice",
    );
    expect(getSessionDisplayName({ id: "u1" } as never)).toBe("u1");
  });
});
