import { describe, expect, it } from "vitest";
import {
  buildLocaleCookie,
  localeCookieDomain,
  toConsoleUiLocale,
} from "./locale-bridge";

describe("locale-bridge", () => {
  it("maps Community locales to Console ja/en", () => {
    expect(toConsoleUiLocale("ja")).toBe("ja");
    expect(toConsoleUiLocale("en")).toBe("en");
    expect(toConsoleUiLocale("de")).toBe("en");
    expect(toConsoleUiLocale("fr")).toBe("en");
  });

  it("shares cookies on oorgos.org subdomains", () => {
    expect(localeCookieDomain("community.oorgos.org")).toBe(".oorgos.org");
    expect(localeCookieDomain("operator.oorgos.org")).toBe(".oorgos.org");
    expect(localeCookieDomain("localhost")).toBeUndefined();
  });

  it("builds paired cookie setters", () => {
    const cookie = buildLocaleCookie("locale", "ja", "community.oorgos.org", "https:");
    expect(cookie).toContain("locale=ja");
    expect(cookie).toContain("Domain=.oorgos.org");
    expect(cookie).toContain("Secure");
  });
});
