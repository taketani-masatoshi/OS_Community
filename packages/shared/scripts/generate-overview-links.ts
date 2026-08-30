import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  overviewAssetHash,
  overviewAssetNames,
  stampOverviewHtml,
} from "../src/overview-asset-stamp";
import { OVERVIEW_LINKS_FILENAME, renderOverviewLinksScript } from "../src/overview-links";
import {
  OVERVIEW_LOCALE_FILENAME,
  renderOverviewLocaleScript,
} from "../src/overview-locale-script";

const here = dirname(fileURLToPath(import.meta.url));
const overviewDir = resolve(here, "../../../sites/coming-soon");
const pages = ["index.html", "demo.html", "404.html"];

const assets: [string, string][] = [
  [OVERVIEW_LINKS_FILENAME, renderOverviewLinksScript()],
  [OVERVIEW_LOCALE_FILENAME, renderOverviewLocaleScript()],
];

mkdirSync(overviewDir, { recursive: true });
for (const [name, contents] of assets) {
  const target = resolve(overviewDir, name);
  writeFileSync(target, contents, "utf8");
  console.log(`wrote ${target}`);
}

for (const page of pages) {
  const target = resolve(overviewDir, page);
  const html = readFileSync(target, "utf8");
  const hashes = new Map<string, string>();
  for (const name of overviewAssetNames(html)) {
    hashes.set(name, overviewAssetHash(readFileSync(resolve(overviewDir, name), "utf8")));
  }
  const stamped = stampOverviewHtml(html, (name) => hashes.get(name));
  if (stamped === html) continue;
  writeFileSync(target, stamped, "utf8");
  console.log(`stamped ${target}`);
}
