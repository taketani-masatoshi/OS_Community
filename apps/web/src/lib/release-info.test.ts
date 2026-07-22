import { describe, expect, it } from "vitest";
import { compareVersions } from "./release-info";

describe("compareVersions", () => {
  it("orders core semver", () => {
    expect(compareVersions("0.1.0", "0.2.0")).toBeLessThan(0);
    expect(compareVersions("1.0.0", "0.9.9")).toBeGreaterThan(0);
  });

  it("orders beta prereleases", () => {
    expect(compareVersions("0.1.0-beta.1", "0.1.0-beta.2")).toBeLessThan(0);
    expect(compareVersions("0.1.0-beta.2", "0.1.0")).toBeLessThan(0);
    expect(compareVersions("0.1.0", "0.1.0-beta.9")).toBeGreaterThan(0);
  });
});
