import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getCommunityOooLoginEmailPolicy,
  isOooLoginEmailAllowed,
} from "./ooo-login-email";

describe("Community OOO login email policy", () => {
  const prev: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ["OOO_LOGIN_EMAIL_DOMAINS", "OOO_LOGIN_EMAIL_GRANDFATHER"]) {
      prev[key] = process.env[key];
    }
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("does not restrict when domains are unset", () => {
    delete process.env.OOO_LOGIN_EMAIL_DOMAINS;
    delete process.env.OOO_LOGIN_EMAIL_GRANDFATHER;
    expect(isOooLoginEmailAllowed("anyone@gmail.com")).toBe(true);
  });

  it("allows company domain and grandfathered email", () => {
    process.env.OOO_LOGIN_EMAIL_DOMAINS = "malkk.com";
    process.env.OOO_LOGIN_EMAIL_GRANDFATHER = "founder@gmail.com";
    const policy = getCommunityOooLoginEmailPolicy();
    expect(isOooLoginEmailAllowed("ceo@malkk.com", policy)).toBe(true);
    expect(isOooLoginEmailAllowed("founder@gmail.com", policy)).toBe(true);
    expect(isOooLoginEmailAllowed("other@gmail.com", policy)).toBe(false);
  });

  it("keeps only the first grandfather email", () => {
    process.env.OOO_LOGIN_EMAIL_DOMAINS = "malkk.com";
    process.env.OOO_LOGIN_EMAIL_GRANDFATHER = "first@gmail.com, second@gmail.com";
    const policy = getCommunityOooLoginEmailPolicy();
    expect(policy.grandfather_emails).toEqual(["first@gmail.com"]);
    expect(isOooLoginEmailAllowed("first@gmail.com", policy)).toBe(true);
    expect(isOooLoginEmailAllowed("second@gmail.com", policy)).toBe(false);
  });
});
