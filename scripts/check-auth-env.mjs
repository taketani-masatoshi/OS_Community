#!/usr/bin/env node
/**
 * Verify auth env vars in .env and print setup hints.
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

function pick(env, ...keys) {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) return value;
  }
  return "";
}

const env = loadEnv();
const authSecret = env.AUTH_SECRET?.trim();
const authUrl = env.AUTH_URL?.trim() || "http://localhost:3000";
const githubId = env.AUTH_GITHUB_ID?.trim();
const githubSecret = env.AUTH_GITHUB_SECRET?.trim();
const googleId = pick(env, "AUTH_GOOGLE_ID", "GOOGLE_CLIENT_ID");
const googleSecret = pick(env, "AUTH_GOOGLE_SECRET", "GOOGLE_CLIENT_SECRET");
const linkedinId = pick(env, "AUTH_LINKEDIN_ID");
const linkedinSecret = pick(env, "AUTH_LINKEDIN_SECRET");

const baseUrl = authUrl.replace(/\/$/, "");
const googleCallback = `${baseUrl}/api/auth/callback/google`;
const githubCallback = `${baseUrl}/api/auth/callback/github`;
const linkedinCallback = `${baseUrl}/api/auth/callback/linkedin`;
const localGoogleCallback = "http://localhost:3000/api/auth/callback/google";
const localGithubCallback = "http://localhost:3000/api/auth/callback/github";
const localLinkedinCallback = "http://localhost:3000/api/auth/callback/linkedin";

console.log("Auth environment check");
console.log("  AUTH_URL:", authUrl);
console.log("  AUTH_SECRET:", authSecret ? "(set)" : "(missing)");
console.log("  AUTH_GOOGLE_ID:", googleId ? `${googleId.slice(0, 8)}…` : "(missing)");
console.log("  AUTH_GOOGLE_SECRET:", googleSecret ? "(set)" : "(missing)");
console.log("  AUTH_GITHUB_ID:", githubId ? `${githubId.slice(0, 8)}…` : "(missing)");
console.log("  AUTH_GITHUB_SECRET:", githubSecret ? "(set)" : "(missing)");
console.log("  AUTH_LINKEDIN_ID:", linkedinId ? `${linkedinId.slice(0, 8)}…` : "(missing)");
console.log("  AUTH_LINKEDIN_SECRET:", linkedinSecret ? "(set)" : "(missing)");

let ok = true;

if (!authSecret) {
  console.error("\n✗ AUTH_SECRET is required. Generate one with: openssl rand -base64 32");
  ok = false;
}

if (!googleId && !googleSecret && !githubId && !githubSecret && !linkedinId && !linkedinSecret) {
  console.error(
    "\n✗ No sign-in providers configured. Set AUTH_GOOGLE_*, AUTH_GITHUB_*, and/or AUTH_LINKEDIN_* in .env"
  );
  ok = false;
}

for (const [label, id, secret] of [
  ["Google", googleId, googleSecret],
  ["GitHub", githubId, githubSecret],
  ["LinkedIn", linkedinId, linkedinSecret],
]) {
  if (id && !secret) {
    console.error(`\n✗ ${label}: client ID is set but client secret is missing`);
    ok = false;
  }
  if (!id && secret) {
    console.error(`\n✗ ${label}: client secret is set but client ID is missing`);
    ok = false;
  }
}

if (ok) {
  console.log("\n✓ Auth env looks OK. Start dev with: npm run dev");
  if (googleId && googleSecret) {
    console.log(`  Google OAuth callback (AUTH_URL): ${googleCallback}`);
    console.log(`  Google OAuth callback (local dev): ${localGoogleCallback}`);
  }
  if (githubId && githubSecret) {
    console.log(`  GitHub OAuth callback (AUTH_URL): ${githubCallback}`);
    console.log(`  GitHub OAuth callback (local dev): ${localGithubCallback}`);
  }
  if (linkedinId && linkedinSecret) {
    console.log(`  LinkedIn OAuth callback (AUTH_URL): ${linkedinCallback}`);
    console.log(`  LinkedIn OAuth callback (local dev): ${localLinkedinCallback}`);
  }
  console.log("  Sign-in providers: Google, GitHub, and LinkedIn (configure any combination in .env).");
  if (!googleId) {
    console.log("  Google setup: npm run auth:primary:setup · docs/google-oauth-setup.md");
  }
  if (!linkedinId) {
    console.log("  LinkedIn setup: npm run auth:linkedin:setup · docs/linkedin-oauth-setup.md");
  }
}

process.exit(ok ? 0 : 1);
