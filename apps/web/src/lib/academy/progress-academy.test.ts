import { describe, it, expect, vi, beforeEach } from "vitest";
import { isAcademyConfigured } from "@/lib/academy/progress-academy";
import { AcademyConfigError } from "@/lib/academy/server-client";

describe("progress-academy", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("isAcademyConfigured is false without env", () => {
    vi.stubEnv("ACADEMY_API_URL", "");
    expect(isAcademyConfigured()).toBe(false);
  });

  it("isAcademyConfigured is true with env", () => {
    vi.stubEnv("ACADEMY_API_URL", "http://127.0.0.1:8787");
    expect(isAcademyConfigured()).toBe(true);
  });

  it("getConfiguredAcademyClient throws when not configured", async () => {
    vi.stubEnv("ACADEMY_API_URL", "");
    const { getConfiguredAcademyClient } = await import("@/lib/academy/progress-academy");
    expect(() => getConfiguredAcademyClient()).toThrow(AcademyConfigError);
  });
});
