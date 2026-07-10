#!/usr/bin/env node
/**
 * Interactive Google OAuth setup.
 *
 * Usage: npm run auth:primary:setup
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { execSync } from "node:child_process";
import { OAUTH_CALLBACKS, getOAuthCallbacks, root, setEnvKeys } from "./lib/auth-env-file.mjs";

const rl = createInterface({ input, output });

function askYesNo(question, defaultYes = false) {
  const suffix = defaultYes ? " [Y/n]: " : " [y/N]: ";
  return rl.question(`${question}${suffix}`).then((answer) => {
    const normalized = answer.trim().toLowerCase();
    if (!normalized) return defaultYes;
    return normalized === "y" || normalized === "yes";
  });
}

console.log("OpenOrgOS Google OAuth setup\n");
const callbacks = getOAuthCallbacks();
console.log("Register BOTH redirect URIs in Google Cloud Console:");
console.log(`  ${callbacks.google.prod}`);
console.log(`  ${callbacks.google.local}\n`);

const configureGoogle = await askYesNo("Configure Google OAuth now?", true);
let googleConfigured = false;
if (configureGoogle) {
  console.log(`Console: ${callbacks.google.consoleUrl}\n`);
  const googleId = (await rl.question("Google Client ID: ")).trim();
  const googleSecret = (await rl.question("Google Client Secret: ")).trim();
  if (googleId && googleSecret) {
    setEnvKeys({
      AUTH_GOOGLE_ID: googleId,
      AUTH_GOOGLE_SECRET: googleSecret,
    });
    googleConfigured = true;
    console.log("Google credentials saved.\n");
  } else {
    console.error("Skipped Google — both Client ID and Secret are required.\n");
  }
}

if (!googleConfigured) {
  rl.close();
  console.error("No credentials were saved. Run again when the OAuth app is ready.");
  process.exit(1);
}

console.log("Running auth check...\n");
execSync("node scripts/check-auth-env.mjs", { cwd: root, stdio: "inherit" });

const restartDocker = await askYesNo("Restart Docker web container now?", true);
rl.close();

if (restartDocker) {
  execSync("docker compose up -d web && docker compose up -d --force-recreate cloudflared-inc", {
    cwd: root,
    stdio: "inherit",
  });
}

console.log("\nDone.");
console.log("Local dev: npm run dev  (AUTH_URL is forced to http://localhost:3000)");
console.log(`Production: ${getOAuthCallbacks().google.prod.replace("/api/auth/callback/google", "/login")}`);
