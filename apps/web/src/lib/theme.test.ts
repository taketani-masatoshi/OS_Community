import { describe, expect, it } from "vitest";
import {
  isThemePreference,
  preferenceFromSources,
  readCookieValue,
  themeCookieDomain,
  themeCookieSetter,
  THEME_STORAGE_KEY,
} from "./theme";

describe("isThemePreference", () => {
  it("accepts light, dark, and system", () => {
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("system")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isThemePreference("auto")).toBe(false);
    expect(isThemePreference("")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});

describe("readCookieValue", () => {
  it("reads the theme cookie", () => {
    expect(readCookieValue(`${THEME_STORAGE_KEY}=dark; other=1`)).toBe("dark");
    expect(readCookieValue(`other=1; ${THEME_STORAGE_KEY}=light`)).toBe("light");
  });

  it("returns null when missing", () => {
    expect(readCookieValue("other=1")).toBe(null);
    expect(readCookieValue("")).toBe(null);
  });
});

describe("preferenceFromSources", () => {
  it("prefers cookie over localStorage", () => {
    expect(preferenceFromSources("light", "dark")).toBe("light");
    expect(preferenceFromSources("system", "dark")).toBe("system");
  });

  it("falls back to localStorage when cookie is absent or invalid", () => {
    expect(preferenceFromSources(null, "dark")).toBe("dark");
    expect(preferenceFromSources("nope", "light")).toBe("light");
  });

  it("defaults to system", () => {
    expect(preferenceFromSources(null, null)).toBe("system");
    expect(preferenceFromSources("auto", "nope")).toBe("system");
  });
});

describe("themeCookieDomain", () => {
  it("shares oorgos.org subdomains", () => {
    expect(themeCookieDomain("oorgos.org")).toBe(".oorgos.org");
    expect(themeCookieDomain("community.oorgos.org")).toBe(".oorgos.org");
    expect(themeCookieDomain("approve.oorgos.org")).toBe(".oorgos.org");
    expect(themeCookieDomain("receipt.oorgos.org")).toBe(".oorgos.org");
  });

  it("keeps localhost host-only", () => {
    expect(themeCookieDomain("localhost")).toBeUndefined();
    expect(themeCookieDomain("127.0.0.1")).toBeUndefined();
  });
});

describe("themeCookieSetter", () => {
  it("sets Domain and Secure on production HTTPS", () => {
    const cookie = themeCookieSetter("dark", "community.oorgos.org", "https:");
    expect(cookie).toContain("Domain=.oorgos.org");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain(`${THEME_STORAGE_KEY}=dark`);
  });

  it("omits Domain on localhost HTTP", () => {
    const cookie = themeCookieSetter("light", "localhost", "http:");
    expect(cookie).not.toContain("Domain=");
    expect(cookie).not.toContain("Secure");
  });
});
