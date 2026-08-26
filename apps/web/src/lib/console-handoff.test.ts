import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildConsoleHandoffUrl,
  mintConsoleHandoffIdToken,
  safeConsoleNextPath,
} from "./console-handoff";

describe("console-handoff", () => {
  const prev: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of [
      "COMMUNITY_CONSOLE_OIDC_HS256_SECRET",
      "COMMUNITY_CONSOLE_OIDC_ISSUER",
      "COMMUNITY_CONSOLE_OIDC_AUDIENCE",
      "AUTH_URL",
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_OPERATOR_CONSOLE_URL",
    ]) {
      prev[k] = process.env[k];
    }
    process.env.COMMUNITY_CONSOLE_OIDC_HS256_SECRET = "test-secret";
    process.env.COMMUNITY_CONSOLE_OIDC_ISSUER = "https://community.oorgos.org";
    process.env.COMMUNITY_CONSOLE_OIDC_AUDIENCE = "orgos-operator-console";
    process.env.NEXT_PUBLIC_OPERATOR_CONSOLE_URL = "http://127.0.0.1:9470";
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("mints HS256 JWT with email and operator_id", () => {
    const token = mintConsoleHandoffIdToken({
      sub: "user-1",
      email: "k.lab.masa@gmail.com",
      google_sub: "google-sub-1",
      operator_id: "OP-001",
    });
    expect(typeof token).toBe("string");
    if (typeof token !== "string") return;
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
    const payload = JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf-8")) as {
      email: string;
      operator_id: string;
      iss: string;
      aud: string;
    };
    expect(payload.email).toBe("k.lab.masa@gmail.com");
    expect(payload.operator_id).toBe("OP-001");
    expect(payload.iss).toBe("https://community.oorgos.org");
    expect(payload.aud).toBe("orgos-operator-console");
  });

  it("builds handoff URL", () => {
    const url = buildConsoleHandoffUrl("http://127.0.0.1:9470", "tok", "/wire/");
    expect(url).toContain("http://127.0.0.1:9470/auth/community-handoff");
    expect(url).toContain("token=tok");
    expect(url).toContain("next=%2Fwire%2F");
  });

  it("sanitizes next path", () => {
    expect(safeConsoleNextPath("/wire/")).toBe("/wire/");
    expect(safeConsoleNextPath("https://evil.example/")).toBe("/");
    expect(safeConsoleNextPath("//evil")).toBe("/");
  });
});
