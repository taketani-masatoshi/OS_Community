#!/usr/bin/env node
/**
 * Configure LinkedIn OAuth credentials in the repo root .env file.
 *
 * Usage:
 *   node scripts/configure-linkedin-auth.mjs --open
 *   node scripts/configure-linkedin-auth.mjs <client-id> <client-secret>
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const envPath = join(root, ".env");

const CONSOLE_URL = "https://www.linkedin.com/developers/apps";
const REDIRECT_PROD = "https://southwood.inc/api/auth/callback/linkedin";
const REDIRECT_LOCAL = "http://localhost:3000/api/auth/callback/linkedin";

function openRegistration() {
  const openCmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  execSync(`${openCmd} ${JSON.stringify(CONSOLE_URL)}`, { stdio: "ignore" });
  console.log("LinkedIn Developer Portal:");
  console.log(CONSOLE_URL);
  console.log("\nAdd BOTH redirect URLs (Auth tab):");
  console.log(`  ${REDIRECT_PROD}`);
  console.log(`  ${REDIRECT_LOCAL}`);
  console.log("\nEnable product: Sign In with LinkedIn using OpenID Connect");
}

function updateEnv(clientId, clientSecret) {
  if (!clientId?.trim() || !clientSecret?.trim()) {
    console.error("Error: client ID and client secret are required.");
    process.exit(1);
  }

  let env = readFileSync(envPath, "utf8");
  for (const key of ["AUTH_LINKEDIN_ID", "AUTH_LINKEDIN_SECRET"]) {
    if (!new RegExp(`^${key}=`, "m").test(env)) {
      env += `\n${key}=\n`;
    }
  }

  env = env.replace(/^AUTH_LINKEDIN_ID=.*$/m, `AUTH_LINKEDIN_ID=${clientId.trim()}`);
  env = env.replace(
    /^AUTH_LINKEDIN_SECRET=.*$/m,
    `AUTH_LINKEDIN_SECRET=${clientSecret.trim()}`
  );
  writeFileSync(envPath, env);

  console.log("Updated .env with LinkedIn OAuth credentials.");
  console.log("Verify: npm run auth:check");
  console.log("Restart dev server, then connect at http://localhost:3000/mypage");
}

const args = process.argv.slice(2);
if (args[0] === "--open") {
  openRegistration();
} else if (args.length >= 2) {
  updateEnv(args[0], args[1]);
} else {
  console.log(`Usage:
  node scripts/configure-linkedin-auth.mjs --open
  node scripts/configure-linkedin-auth.mjs <client-id> <client-secret>

Interactive: npm run auth:linkedin:setup`);
  process.exit(1);
}
