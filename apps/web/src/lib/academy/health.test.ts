import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkAcademyHealth } from "./health";

describe("checkAcademyHealth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("reports not configured when ACADEMY_API_URL is unset", async () => {
    delete process.env.ACADEMY_API_URL;

    const result = await checkAcademyHealth();

    expect(result).toEqual({ configured: false, reachable: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports reachable when /ready returns ok", async () => {
    process.env.ACADEMY_API_URL = "http://127.0.0.1:8787";
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const result = await checkAcademyHealth();

    expect(result.configured).toBe(true);
    expect(result.reachable).toBe(true);
    expect(result.latencyMs).toBeTypeOf("number");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8787/ready",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
  });

  it("reports unreachable on non-ok response", async () => {
    process.env.ACADEMY_API_URL = "http://127.0.0.1:8787";
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);

    const result = await checkAcademyHealth();

    expect(result).toMatchObject({
      configured: true,
      reachable: false,
      error: "HTTP 503",
    });
  });

  it("reports unreachable on fetch failure", async () => {
    process.env.ACADEMY_API_URL = "http://127.0.0.1:8787";
    vi.mocked(fetch).mockRejectedValue(new Error("fetch failed"));

    const result = await checkAcademyHealth();

    expect(result).toMatchObject({
      configured: true,
      reachable: false,
      error: "fetch failed",
    });
  });
});
