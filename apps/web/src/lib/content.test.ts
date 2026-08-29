import { describe, expect, it } from "vitest";
import { getContentById, stripMarkdownLeadHeading } from "./content";

describe("stripMarkdownLeadHeading", () => {
  it("removes a leading h1 line", () => {
    const input = "# Title\n\nBody paragraph.";
    expect(stripMarkdownLeadHeading(input)).toBe("Body paragraph.");
  });

  it("leaves content unchanged when no h1", () => {
    const input = "> Note\n\n## Section";
    expect(stripMarkdownLeadHeading(input)).toBe(input);
  });
});

describe("getContentById locale resolution", () => {
  it("loads English mission from i18n/en when locale is en", () => {
    const doc = getContentById("mission", "en");
    expect(doc).not.toBeNull();
    expect(doc?.content).toContain("organizational EHR");
    expect(doc?.content).not.toMatch(/組織の電子カルテ/);
  });

  it("falls back to English privacy when locale file is missing", () => {
    const doc = getContentById("privacy", "de");
    expect(doc).not.toBeNull();
    expect(doc?.content).toContain("Privacy Policy");
    expect(doc?.content).toContain("community.oorgos.org");
  });

  it("loads published ISO 37000 guidance", () => {
    const en = getContentById("iso-37000-orgos", "en");
    expect(en).not.toBeNull();
    expect(en?.entry.status).toBe("published");
    expect(en?.content).toContain("ISO 37000");
    expect(en?.content).toContain("self-declaration");
    expect(en?.content).toContain("orgos governance principles");
    const ja = getContentById("iso-37000-orgos", "ja");
    expect(ja).not.toBeNull();
    expect(ja?.content).toContain("自己宣言");
    expect(ja?.content).toContain("第三者 ISO 認証ではありません");
  });
});
