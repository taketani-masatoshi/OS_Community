import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  overviewAssetHash,
  overviewAssetNames,
  stampOverviewHtml,
} from "./overview-asset-stamp";

const overviewDir = join(dirname(fileURLToPath(import.meta.url)), "../../../sites/coming-soon");
const pages = ["index.html", "demo.html", "404.html"] as const;
const read = (file: string) => readFileSync(join(overviewDir, file), "utf8");

describe("stampOverviewHtml", () => {
  it("adds and replaces the version of local css/js", () => {
    const html = '<link href="/a.css" /><script src="/b.js?v=deadbeef"></script>';
    expect(stampOverviewHtml(html, () => "12345678")).toBe(
      '<link href="/a.css?v=12345678" /><script src="/b.js?v=12345678"></script>',
    );
  });

  it("leaves unknown and external references alone", () => {
    const html = '<script src="https://cdn.test/x.js"></script><link href="/gone.css" />';
    expect(stampOverviewHtml(html, () => undefined)).toBe(html);
  });
});

describe("overview pages", () => {
  for (const page of pages) {
    it(`${page} references the current asset contents`, () => {
      const html = read(page);
      const names = overviewAssetNames(html);
      expect(names.length).toBeGreaterThan(0);
      const expected = stampOverviewHtml(html, (name) => overviewAssetHash(read(name)));
      expect(html, `run \`npm run overview:links\` to refresh ${page}`).toBe(expected);
      expect(html).not.toMatch(/(src|href)="\/[A-Za-z0-9._-]+\.(css|js)"/);
    });
  }
});
