import { describe, expect, it } from "vitest";
import {
  formatCorporateNumberDisplay,
  isJapaneseCorporateNumber,
  normalizeCorporateNumber,
} from "@os-community/shared";

describe("isJapaneseCorporateNumber", () => {
  it("accepts known valid NTA number", () => {
    // 国税庁 (7000012050002)
    expect(isJapaneseCorporateNumber("7000012050002")).toBe(true);
  });

  it("accepts formatted input", () => {
    expect(isJapaneseCorporateNumber("7-0000-1205-0002")).toBe(true);
  });

  it("rejects wrong check digit", () => {
    expect(isJapaneseCorporateNumber("8000012050002")).toBe(false);
  });

  it("rejects non-13-digit strings", () => {
    expect(isJapaneseCorporateNumber("123")).toBe(false);
    expect(isJapaneseCorporateNumber("abcdefghijklm")).toBe(false);
  });
});

describe("normalizeCorporateNumber / format", () => {
  it("strips separators", () => {
    expect(normalizeCorporateNumber("7-0000-1205-0002")).toBe("7000012050002");
  });

  it("formats for display", () => {
    expect(formatCorporateNumberDisplay("7000012050002")).toBe("7-0000-1205-0002");
  });
});
