/**
 * Cache-busting stamps for the static overview site.
 *
 * `vercel.json` caches css/js for a day, but the HTML is not cached. A new
 * section therefore shipped with its translations still pointing at yesterday's
 * script, so the page fell back to the untranslated markup. Stamping the
 * content hash into the URL makes an asset change a new URL.
 */

import { createHash } from "node:crypto";

const STAMPABLE = /(src|href)="\/([A-Za-z0-9._-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"/g;

export function overviewAssetHash(contents: string): string {
  return createHash("sha256").update(contents).digest("hex").slice(0, 8);
}

export type AssetHashLookup = (assetName: string) => string | undefined;

export function stampOverviewHtml(html: string, hashFor: AssetHashLookup): string {
  return html.replace(STAMPABLE, (match, attr: string, name: string) => {
    const hash = hashFor(name);
    return hash ? `${attr}="/${name}?v=${hash}"` : match;
  });
}

/** Asset filenames referenced by a page, without any existing stamp. */
export function overviewAssetNames(html: string): string[] {
  const names = new Set<string>();
  for (const match of html.matchAll(STAMPABLE)) names.add(match[2] as string);
  return [...names];
}
