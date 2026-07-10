#!/usr/bin/env node
/**
 * Print the exact LinkedIn OAuth redirect URI this server sends, and setup hints.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const envPath = join(root, ".env");

function loadEnv() {
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const authUrl = (env.AUTH_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
const localAuthUrl = "http://localhost:3000";
const linkedinId = env.AUTH_LINKEDIN_ID?.trim();
const linkedinSecret = env.AUTH_LINKEDIN_SECRET?.trim();
const prodCallback = `${authUrl}/api/auth/callback/linkedin`;
const localCallback = `${localAuthUrl}/api/auth/callback/linkedin`;

console.log("LinkedIn OAuth redirect URI check\n");
console.log("  Client ID:", linkedinId ? `${linkedinId.slice(0, 8)}…` : "(missing)");
console.log("  Client Secret:", linkedinSecret ? "(set)" : "(missing)");
console.log("  AUTH_URL (.env):", authUrl);
console.log("");
console.log("Register in Developer Portal → Auth tab → Authorized redirect URLs for your app");
console.log("(NOT Widgets → Domains / Additional settings)\n");

if (authUrl === localAuthUrl) {
  console.log("  →", localCallback);
} else {
  console.log("  Production / docker (AUTH_URL):");
  console.log("  →", prodCallback);
  console.log("");
  console.log("  Local npm run dev (AUTH_URL override):");
  console.log("  →", localCallback);
}

console.log("");
console.log("Products: enable Sign In with LinkedIn using OpenID Connect");
console.log("Privacy policy: https://southwood.inc/legal/privacy");
console.log("Portal: https://www.linkedin.com/developers/apps");

if (!linkedinId || !linkedinSecret) {
  console.error("\n✗ AUTH_LINKEDIN_ID / AUTH_LINKEDIN_SECRET missing in .env");
  process.exit(1);
}

console.log("\n✓ Copy the URL above into the Auth tab, save, wait ~1 min, then retry Connect.");
