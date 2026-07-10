#!/usr/bin/env node
/**
 * Build a cloudflared config with credentials-file path for the current user.
 * Usage: node scripts/lib/cloudflare-tunnel.mjs <ingress-yml> > /tmp/cloudflared-xxx.yml
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const ingressFile = process.argv[2];
if (!ingressFile) {
  console.error("Usage: node cloudflare-tunnel.mjs <deploy/cloudflared/*.ingress.yml>");
  process.exit(1);
}

const ingressPath = path.isAbsolute(ingressFile)
  ? ingressFile
  : path.join(root, ingressFile);

const doc = parseYaml(fs.readFileSync(ingressPath, "utf8"));
const tunnelId = doc.tunnel;
if (!tunnelId) {
  console.error("ingress file must include tunnel: <uuid>");
  process.exit(1);
}

const creds = path.join(os.homedir(), ".cloudflared", `${tunnelId}.json`);
if (!fs.existsSync(creds)) {
  console.error(`Missing credentials: ${creds}`);
  console.error("Run: cloudflared tunnel create <name>");
  process.exit(1);
}

const config = {
  tunnel: tunnelId,
  "credentials-file": creds,
  ingress: doc.ingress,
};

process.stdout.write(stringifyYaml(config));
