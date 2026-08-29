import { describe, expect, it } from "vitest";
import { isConsoleStartCallback } from "./console-login-intent";

describe("console-login-intent", () => {
  it("detects console start callback paths", () => {
    expect(isConsoleStartCallback("/ops/console/start")).toBe(true);
    expect(isConsoleStartCallback("/ops/console/start?next=%2F")).toBe(true);
    expect(isConsoleStartCallback("/ops/console/start?next=/wire/")).toBe(true);
  });

  it("rejects non-console callbacks", () => {
    expect(isConsoleStartCallback("/mypage")).toBe(false);
    expect(isConsoleStartCallback("/ops/console/blocked")).toBe(false);
    expect(isConsoleStartCallback("https://evil.com/ops/console/start")).toBe(false);
  });
});
