#!/usr/bin/env node
/**
 * Configure GitHub OAuth credentials in the repo root .env file.
 *
 * Usage:
 *   node scripts/configure-github-auth.mjs <client-id> <client-secret>
 *   node scripts/configure-github-auth.mjs --open   # open GitHub OAuth registration
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = join(import.meta.dirname, "..");
const envPath = join(root, ".env");

const REGISTRATION_URL =
  "https://github.com/settings/applications/new?" +
  new URLSearchParams({
    "oauth_application[name]": "OpenOrgOS Community Dev",
    "oauth_application[url]": "https://southwood.inc",
    "oauth_application[callback_url]":
      "https://southwood.inc/api/auth/callback/github",
    "oauth_application[description]":
      "Local development OAuth for OS Community",
  }).toString();

function openRegistration() {
  const openCmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  execSync(`${openCmd} ${JSON.stringify(REGISTRATION_URL)}`, { stdio: "ignore" });
  console.log("Opened GitHub OAuth App registration:");
  console.log(REGISTRATION_URL);
}

function updateEnv(clientId, clientSecret) {
  if (!clientId?.trim() || !clientSecret?.trim()) {
    console.error("Error: client ID and client secret are required.");
    process.exit(1);
  }

  let env = readFileSync(envPath, "utf8");
  if (!/^AUTH_GITHUB_ID=/m.test(env) || !/^AUTH_GITHUB_SECRET=/m.test(env)) {
    console.error("Error: .env is missing AUTH_GITHUB_ID or AUTH_GITHUB_SECRET keys.");
    process.exit(1);
  }

  env = env.replace(/^AUTH_GITHUB_ID=.*$/m, `AUTH_GITHUB_ID=${clientId.trim()}`);
  env = env.replace(
    /^AUTH_GITHUB_SECRET=.*$/m,
    `AUTH_GITHUB_SECRET=${clientSecret.trim()}`
  );
  writeFileSync(envPath, env);

  console.log("Updated .env with GitHub OAuth credentials.");
  console.log("Restart Docker web: docker compose up -d --force-recreate web");
  console.log("Verify: node scripts/check-github-auth.mjs");
}

const args = process.argv.slice(2);
if (args[0] === "--open") {
  openRegistration();
} else if (args.length >= 2) {
  updateEnv(args[0], args[1]);
} else {
  console.log(`Usage:
  node scripts/configure-github-auth.mjs --open
  node scripts/configure-github-auth.mjs <client-id> <client-secret>`);
  process.exit(1);
}
