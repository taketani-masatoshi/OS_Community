import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const root = join(import.meta.dirname, "../..");
export const envPath = join(root, ".env");

export function loadEnvFile(path = envPath) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

export function setEnvKeys(updates, path = envPath) {
  let env = readFileSync(path, "utf8");
  for (const [key, value] of Object.entries(updates)) {
    if (new RegExp(`^${key}=`, "m").test(env)) {
      env = env.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${value}`);
    } else {
      if (env.length > 0 && !env.endsWith("\n")) env += "\n";
      env += `${key}=${value}\n`;
    }
  }
  writeFileSync(path, env);
}

export function getAuthBaseUrl(env = loadEnvFile()) {
  return (env.AUTH_URL?.trim() || "https://community.oorgos.org").replace(/\/$/, "");
}

export function getOAuthCallbacks(env = loadEnvFile()) {
  const base = getAuthBaseUrl(env);
  return {
    google: {
      provider: "Google",
      path: "google",
      prod: `${base}/api/auth/callback/google`,
      local: "http://localhost:3000/api/auth/callback/google",
      consoleUrl: "https://console.cloud.google.com/apis/credentials",
      docsUrl: "https://developers.google.com/identity/protocols/oauth2/web-server",
    },
  };
}

/** @deprecated use getOAuthCallbacks() for AUTH_URL-aware redirect URIs */
export const OAUTH_CALLBACKS = getOAuthCallbacks();
