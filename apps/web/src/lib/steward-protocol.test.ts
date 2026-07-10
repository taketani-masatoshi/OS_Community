import { describe, it, expect } from "vitest";
import { loadStewardReadiness, demoStewardReadiness } from "@/lib/steward-protocol";

describe("steward-protocol mirror", () => {
  it("demo readiness has score", () => {
    const d = demoStewardReadiness();
    expect(d.score).toBeGreaterThanOrEqual(45);
  });

  it("loadStewardReadiness returns object or null", () => {
    const r = loadStewardReadiness();
    if (r) expect(r.score).toBeGreaterThan(0);
    else expect(r).toBeNull();
  });
});
