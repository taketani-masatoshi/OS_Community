import { afterEach, describe, expect, it } from "vitest";
import {
  communityUrl,
  consoleStartAbsoluteUrl,
  consoleStartPath,
  overviewUrl,
  safeConsoleNextPath,
} from "./ecosystem-links";

describe("ecosystem-links", () => {
  const prevSite = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (prevSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prevSite;
  });

  it("builds relative console start paths", () => {
    expect(consoleStartPath()).toBe("/ops/console/start?next=%2F");
    expect(consoleStartPath("/wire/")).toBe("/ops/console/start?next=%2Fwire%2F");
  });

  it("rejects unsafe next paths", () => {
    expect(safeConsoleNextPath("//evil.com")).toBe("/");
    expect(safeConsoleNextPath("https://evil.com")).toBe("/");
    expect(safeConsoleNextPath("/wire/")).toBe("/wire/");
  });

  it("uses brand overview URL", () => {
    expect(overviewUrl()).toBe("https://oorgos.org");
  });

  it("prefers NEXT_PUBLIC_SITE_URL for absolute console start", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3000/";
    expect(communityUrl()).toBe("http://127.0.0.1:3000");
    expect(consoleStartAbsoluteUrl("/")).toBe(
      "http://127.0.0.1:3000/ops/console/start?next=%2F",
    );
  });
});
