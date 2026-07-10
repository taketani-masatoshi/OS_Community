import { describe, it, expect } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows requests under the limit", async () => {
    const key = `test-${Date.now()}-a`;
    expect((await checkRateLimit(key, 3, 60_000)).ok).toBe(true);
    expect((await checkRateLimit(key, 3, 60_000)).ok).toBe(true);
    expect((await checkRateLimit(key, 3, 60_000)).ok).toBe(true);
  });

  it("blocks when limit exceeded", async () => {
    const key = `test-${Date.now()}-b`;
    expect((await checkRateLimit(key, 2, 60_000)).ok).toBe(true);
    expect((await checkRateLimit(key, 2, 60_000)).ok).toBe(true);
    const blocked = await checkRateLimit(key, 2, 60_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });
});
