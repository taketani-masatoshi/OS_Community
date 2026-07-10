#!/usr/bin/env node
/**
 * Interactive GitHub OAuth setup — avoids shell quoting issues.
 *
 * Usage: node scripts/configure-github-auth-interactive.mjs
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = join(import.meta.dirname, "..");
const envPath = join(root, ".env");

const rl = createInterface({ input, output });

console.log("GitHub OAuth 設定");
console.log("Callback URL: https://southwood.inc/api/auth/callback/github");
console.log("OAuth App 作成: https://github.com/settings/applications/new\n");

const clientId = (await rl.question("Client ID: ")).trim();
const clientSecret = (await rl.question("Client Secret: ")).trim();
rl.close();

if (!clientId || !clientSecret) {
  console.error("Error: Client ID と Client Secret の両方が必要です。");
  process.exit(1);
}

let env = readFileSync(envPath, "utf8");
if (!/^AUTH_GITHUB_ID=/m.test(env) || !/^AUTH_GITHUB_SECRET=/m.test(env)) {
  console.error("Error: .env に AUTH_GITHUB_ID / AUTH_GITHUB_SECRET がありません。");
  process.exit(1);
}

env = env.replace(/^AUTH_GITHUB_ID=.*$/m, `AUTH_GITHUB_ID=${clientId}`);
env = env.replace(/^AUTH_GITHUB_SECRET=.*$/m, `AUTH_GITHUB_SECRET=${clientSecret}`);
writeFileSync(envPath, env);

console.log("\n.env を更新しました。");
console.log("Docker web コンテナを再起動します...\n");

execSync("docker compose up -d --force-recreate web", {
  cwd: root,
  stdio: "inherit",
});

console.log("\n完了。https://southwood.inc/login を開いて GitHub ログインを試してください。");
