import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildOrgosGmailAuthorizeUrl,
  connectionsRedirect,
  isTenantMailConnectShipped,
  signOrgosMailState,
  verifyOrgosMailState,
} from "./orgos-mail";

describe("Community OrgOS mail connect helpers", () => {
  const prev: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of [
      "COMMUNITY_TENANT_MAIL_CONNECT_SHIPPED",
      "AUTH_SECRET",
      "AUTH_URL",
      "ORGOS_GMAIL_CLIENT_ID",
      "ORGOS_GMAIL_CLIENT_SECRET",
      "AUTH_GOOGLE_ID",
      "AUTH_GOOGLE_SECRET",
    ]) {
      prev[key] = process.env[key];
    }
    process.env.AUTH_SECRET = "test-secret-for-orgos-mail";
    process.env.AUTH_URL = "http://localhost:3000";
    process.env.ORGOS_GMAIL_CLIENT_ID = "gmail-client";
    process.env.ORGOS_GMAIL_CLIENT_SECRET = "gmail-secret";
    delete process.env.COMMUNITY_TENANT_MAIL_CONNECT_SHIPPED;
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("is unshipped unless COMMUNITY_TENANT_MAIL_CONNECT_SHIPPED=1", () => {
    expect(isTenantMailConnectShipped()).toBe(false);
    process.env.COMMUNITY_TENANT_MAIL_CONNECT_SHIPPED = "1";
    expect(isTenantMailConnectShipped()).toBe(true);
  });

  it("signs and verifies OAuth state", () => {
    const state = signOrgosMailState({
      tenant_id: "mal",
      nonce: "nonce-1",
      user_id: "user-1",
      exp: Date.now() + 60_000,
    });
    const verified = verifyOrgosMailState(state);
    expect(verified.ok).toBe(true);
    if (verified.ok) {
      expect(verified.payload.tenant_id).toBe("mal");
      expect(verified.payload.nonce).toBe("nonce-1");
    }
  });

  it("rejects expired or tampered state", () => {
    const expired = signOrgosMailState({
      tenant_id: "mal",
      nonce: "n",
      user_id: "u",
      exp: Date.now() - 1,
    });
    expect(verifyOrgosMailState(expired).ok).toBe(false);
    const live = signOrgosMailState({
      tenant_id: "mal",
      nonce: "n",
      user_id: "u",
      exp: Date.now() + 60_000,
    });
    expect(verifyOrgosMailState(`${live}x`).ok).toBe(false);
  });

  it("builds a Google authorize URL with gmail.send", () => {
    const url = buildOrgosGmailAuthorizeUrl("state-token");
    expect(url).toContain("accounts.google.com");
    expect(url).toContain("gmail.send");
    expect(decodeURIComponent(url ?? "")).toContain("/api/integrations/orgos-mail/callback");
  });

  it("shipped mock hop: Google authorize URL then Connections redirect", () => {
    process.env.COMMUNITY_TENANT_MAIL_CONNECT_SHIPPED = "1";
    expect(isTenantMailConnectShipped()).toBe(true);
    const state = signOrgosMailState({
      tenant_id: "mal",
      nonce: "nonce-shipped",
      user_id: "user-1",
      exp: Date.now() + 60_000,
    });
    const authorize = buildOrgosGmailAuthorizeUrl(state);
    expect(authorize).toContain("accounts.google.com");
    expect(authorize).toContain("state=");
    expect(connectionsRedirect({ orgos_mail: "linked" })).toBe(
      "/settings/connections?orgos_mail=linked",
    );
    expect(connectionsRedirect({ orgos_mail: "error" })).toBe(
      "/settings/connections?orgos_mail=error",
    );
    const verified = verifyOrgosMailState(state);
    expect(verified.ok).toBe(true);
  });
});
