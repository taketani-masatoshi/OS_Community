#!/usr/bin/env node
/**
 * Configure Google OAuth credentials in the repo root .env file.
 *
 * Usage:
 *   node scripts/configure-primary-auth.mjs --open google
 *   node scripts/configure-primary-auth.mjs google <client-id> <client-secret>
 */
import { execSync } from "node:child_process";
import { getOAuthCallbacks, setEnvKeys } from "./lib/auth-env-file.mjs";

function openUrl(url) {
  const openCmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  execSync(`${openCmd} ${JSON.stringify(url)}`, { stdio: "ignore" });
}

function printProviderHelp() {
  const info = getOAuthCallbacks().google;
  console.log(`${info.provider} OAuth setup`);
  console.log(`  Console: ${info.consoleUrl}`);
  console.log(`  Docs:    ${info.docsUrl}`);
  console.log("  Register these redirect URIs:");
  console.log(`    ${info.prod}`);
  console.log(`    ${info.local}`);
  console.log("");
}

function configureGoogle(clientId, clientSecret) {
  if (!clientId?.trim() || !clientSecret?.trim()) {
    console.error("Error: Google client ID and client secret are required.");
    process.exit(1);
  }
  setEnvKeys({
    AUTH_GOOGLE_ID: clientId.trim(),
    AUTH_GOOGLE_SECRET: clientSecret.trim(),
  });
  console.log("Updated .env with Google OAuth credentials.");
}

const args = process.argv.slice(2);

if (args[0] === "--open") {
  if (args[1] === "google") {
    printProviderHelp();
    openUrl(getOAuthCallbacks().google.consoleUrl);
    process.exit(0);
  }
  console.log("Usage:\n  node scripts/configure-primary-auth.mjs --open google");
  process.exit(1);
}

if (args[0] === "google" && args.length >= 3) {
  configureGoogle(args[1], args[2]);
} else {
  console.log(`Usage:
  node scripts/configure-primary-auth.mjs --open google
  node scripts/configure-primary-auth.mjs google <client-id> <client-secret>

Interactive setup:
  npm run auth:primary:setup`);
  process.exit(1);
}

console.log("Verify: npm run auth:check");
console.log("Restart web: docker compose up -d --force-recreate web");
