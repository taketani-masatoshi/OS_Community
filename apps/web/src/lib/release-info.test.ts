import { afterEach, describe, expect, it, vi } from "vitest";
import { compareVersions, getReleaseInfo, resetChannelFeedCache } from "./release-info";

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

describe("getReleaseInfo channel cache", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
    resetChannelFeedCache();
    vi.unstubAllGlobals();
  });

  it("fetches the channel feed once within the TTL", async () => {
    process.env.OPENORGOS_CHANNEL_URL = "https://example.test/channel.json";
    process.env.APP_VERSION = "0.1.0-beta.2";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ channel: "beta", latest: "0.1.0-beta.2" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getReleaseInfo();
    await getReleaseInfo();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
