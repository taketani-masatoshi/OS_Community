#!/usr/bin/env node
/**
 * Interactive LinkedIn OAuth setup.
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { execSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const rl = createInterface({ input, output });

console.log("LinkedIn OAuth setup (Professional layer — connect after sign-in)\n");
console.log("Portal: https://www.linkedin.com/developers/apps");
console.log("Product: Sign In with LinkedIn using OpenID Connect");
console.log("Redirect URLs:");
console.log("  https://southwood.inc/api/auth/callback/linkedin");
console.log("  http://localhost:3000/api/auth/callback/linkedin\n");

const clientId = (await rl.question("LinkedIn Client ID: ")).trim();
const clientSecret = (await rl.question("LinkedIn Client Secret: ")).trim();
rl.close();

if (!clientId || !clientSecret) {
  console.error("Both Client ID and Client Secret are required.");
  process.exit(1);
}

execSync(
  `node scripts/configure-linkedin-auth.mjs ${JSON.stringify(clientId)} ${JSON.stringify(clientSecret)}`,
  { cwd: root, stdio: "inherit" }
);

execSync("node scripts/check-auth-env.mjs", { cwd: root, stdio: "inherit" });
