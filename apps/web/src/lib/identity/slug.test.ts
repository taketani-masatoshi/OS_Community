import { describe, expect, it } from "vitest";
import { isValidPublicSlug, normalizePublicSlug } from "./slug";

describe("normalizePublicSlug", () => {
  it("lowercases and replaces invalid characters", () => {
    expect(normalizePublicSlug("  Foo_Bar  ")).toBe("foo-bar");
    expect(normalizePublicSlug("User@Example!")).toBe("user-example");
  });

  it("collapses repeated hyphens and trims edges", () => {
    expect(normalizePublicSlug("a---b")).toBe("a-b");
    expect(normalizePublicSlug("-hello-")).toBe("hello");
  });

  it("truncates to max length", () => {
    const long = "a".repeat(60);
    expect(normalizePublicSlug(long).length).toBeLessThanOrEqual(48);
  });
});

describe("isValidPublicSlug", () => {
  it("accepts valid slugs", () => {
    expect(isValidPublicSlug("taketani-masatoshi")).toBe(true);
    expect(isValidPublicSlug("user42")).toBe(true);
  });

  it("rejects too short or malformed slugs", () => {
    expect(isValidPublicSlug("a")).toBe(false);
    expect(isValidPublicSlug("-bad")).toBe(false);
    expect(isValidPublicSlug("bad-")).toBe(false);
    expect(isValidPublicSlug("")).toBe(false);
  });
});
