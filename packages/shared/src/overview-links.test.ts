import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BRAND_LINKS } from "./brand-links";
import {
  OVERVIEW_LINKS_FILENAME,
  consoleStartQueryPath,
  overviewLinks,
  renderOverviewLinksScript,
} from "./overview-links";

const overviewDir = join(dirname(fileURLToPath(import.meta.url)), "../../../sites/coming-soon");
const pages = ["index.html", "demo.html"] as const;
const read = (file: string) => readFileSync(join(overviewDir, file), "utf8");

describe("overview-links", () => {
  it("starts Console login at Community, never at the Console origin", () => {
    const links = overviewLinks();
    expect(links.consoleStart).toBe(
      `${BRAND_LINKS.community}${consoleStartQueryPath("/")}`,
    );
    expect(links.consoleStart.startsWith(BRAND_LINKS.console)).toBe(false);
  });

  it("keeps the generated overview asset in sync with brand links", () => {
    expect(read(OVERVIEW_LINKS_FILENAME)).toBe(renderOverviewLinksScript());
  });

  for (const page of pages) {
    describe(page, () => {
      it("loads the generated links before the i18n script", () => {
        const html = read(page);
        const links = html.indexOf(`/${OVERVIEW_LINKS_FILENAME}`);
        const i18n = html.search(/src="\/(overview|demo)-i18n\.js"/);
        expect(links).toBeGreaterThan(-1);
        expect(i18n).toBeGreaterThan(links);
      });

      it("uses canonical hrefs as the no-JS fallback", () => {
        const links = overviewLinks() as Record<string, string>;
        const anchors = read(page).match(/<a\b[^>]*data-ecosystem-link[^>]*>/g) ?? [];
        expect(anchors.length).toBeGreaterThan(0);
        for (const anchor of anchors) {
          const key = anchor.match(/data-ecosystem-link="([^"]+)"/)?.[1] ?? "";
          const href = anchor.match(/href="([^"]+)"/)?.[1] ?? "";
          expect(links[key], `unknown data-ecosystem-link="${key}"`).toBeDefined();
          expect(href).toBe(links[key]);
        }
      });
    });
  }

  it("has no divergent Community or Console SSO URLs in overview sources", () => {
    const consoleStart = overviewLinks().consoleStart;
    for (const file of [...pages, "overview-i18n.js", "demo-i18n.js"]) {
      const source = read(file);
      for (const url of source.match(/https:\/\/[a-z0-9.-]*oorgos\.org[^\s"'<)]*/g) ?? []) {
        expect(
          url.startsWith(BRAND_LINKS.community) || url.startsWith(BRAND_LINKS.overview),
          `${file}: unexpected origin ${url}`,
        ).toBe(true);
        if (url.includes("/ops/console/start")) {
          expect(url, `${file}: stale console start URL`).toBe(consoleStart);
        }
      }
    }
  });
});
