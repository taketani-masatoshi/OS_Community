#!/usr/bin/env node
/**
 * Verify GitHub OAuth credentials in .env and print setup hints.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const envPath = join(root, ".env");

function loadEnv() {
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const clientId = env.AUTH_GITHUB_ID?.trim();
const clientSecret = env.AUTH_GITHUB_SECRET?.trim();
const authUrl = env.AUTH_URL?.trim() ?? "(missing)";
const callback = authUrl.startsWith("http")
  ? `${authUrl.replace(/\/$/, "")}/api/auth/callback/github`
  : null;

console.log("GitHub OAuth check");
console.log("  AUTH_URL:", authUrl);
console.log("  Callback URL (must match GitHub OAuth App):", callback ?? "(set AUTH_URL first)");
console.log("  AUTH_GITHUB_ID:", clientId ? `${clientId.slice(0, 6)}…` : "(missing)");
console.log("  AUTH_GITHUB_SECRET:", clientSecret ? "(set)" : "(missing)");

if (!clientId || !clientSecret) {
  console.error("\n✗ Missing AUTH_GITHUB_ID or AUTH_GITHUB_SECRET in .env");
  process.exit(1);
}

const res = await fetch(`https://api.github.com/applications/${clientId}`, {
  headers: {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "os-community-check",
  },
});

if (res.status === 200) {
  const app = await res.json();
  console.log("\n✓ GitHub OAuth App OK:", app.name ?? app.url ?? clientId);
  console.log("  Register callback exactly:", callback);
  process.exit(0);
}

if (res.status === 404) {
  console.error("\n✗ GitHub OAuth App not found — Client ID or Secret is wrong, or the app was deleted.");
  console.error("  Fix: GitHub → Settings → Developer settings → OAuth Apps");
  console.error("  Callback URL:", callback);
  console.error("  Then: node scripts/configure-github-auth.mjs --open");
  process.exit(1);
}

console.error(`\n✗ GitHub API returned ${res.status}`);
process.exit(1);
