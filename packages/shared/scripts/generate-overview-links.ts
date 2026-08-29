import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { OVERVIEW_LINKS_FILENAME, renderOverviewLinksScript } from "../src/overview-links";
import {
  OVERVIEW_LOCALE_FILENAME,
  renderOverviewLocaleScript,
} from "../src/overview-locale-script";

const here = dirname(fileURLToPath(import.meta.url));
const overviewDir = resolve(here, "../../../sites/coming-soon");

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
