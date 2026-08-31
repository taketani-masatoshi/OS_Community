import { describe, expect, it } from "vitest";
import {
  getSessionDisplayName,
  isHeaderSignedIn,
  isSignedInSession,
} from "./session-display";

describe("isSignedInSession", () => {
  it("returns true when user id is present", () => {
    expect(isSignedInSession({ user: { id: "u1" } } as never)).toBe(true);
  });

  it("returns false when session is missing or user id is absent", () => {
    expect(isSignedInSession(null)).toBe(false);
    expect(isSignedInSession({ user: { name: "Alice" } } as never)).toBe(false);
  });
});

describe("isHeaderSignedIn", () => {
  it("treats a server snapshot as signed in before the client session hydrates", () => {
    expect(
      isHeaderSignedIn(null, { userName: "Alice", isAdmin: false }),
    ).toBe(true);
  });

  it("falls back to the client session when the server snapshot is absent", () => {
    expect(isHeaderSignedIn({ user: { id: "u1" } } as never, null)).toBe(true);
    expect(isHeaderSignedIn(null, null)).toBe(false);
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
