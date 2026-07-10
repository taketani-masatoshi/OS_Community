#!/usr/bin/env node
/**
 * Fail fast when dev would conflict with a broken production build artifact.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const nextDir = join(import.meta.dirname, "..", "apps", "web", ".next");
const routesManifest = join(nextDir, "routes-manifest.json");
const buildIdPath = join(nextDir, "BUILD_ID");

if (!existsSync(nextDir)) {
  process.exit(0);
}

if (!existsSync(routesManifest) && existsSync(buildIdPath)) {
  console.error(
    "\n✗ apps/web/.next is a stale or partial production build (routes-manifest.json missing)."
  );
  console.error("  Fix: rm -rf apps/web/.next && npm run dev\n");
  console.error("  Do not run `npm run build` and `npm run dev` at the same time.\n");
  process.exit(1);
}

if (existsSync(routesManifest) && existsSync(buildIdPath)) {
  console.warn(
    "\n⚠ Production build artifacts detected in apps/web/.next while starting dev."
  );
  console.warn("  If pages return 500 / ENOENT, run: rm -rf apps/web/.next && npm run dev\n");
}
