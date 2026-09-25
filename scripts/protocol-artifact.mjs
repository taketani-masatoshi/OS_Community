import { createHash } from "node:crypto";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const required = ["community-readiness.json", "community-sla.json", "trusted-operators.yaml", "wire-node-governance.yaml", "community-wire-node-api.json", "community-tenant-mail-api.json"];
const allowed = new Set([
  ...required,
  "community-integration.json",
  "gov-gateway-adapters.yaml",
  "trusted-hubs.yaml",
  "wire-trust-registry.yaml",
]);
function inventory(dir) {
  const files = {};
  for (const name of readdirSync(dir).sort()) {
    if (!allowed.has(name)) throw new Error(`Unexpected protocol export: ${name}`);
    const path = join(dir, name);
    if (!lstatSync(path).isFile()) throw new Error(`Protocol artifact must contain regular files only: ${name}`);
    const bytes = readFileSync(path);
    if (!bytes.length) throw new Error(`Empty protocol export: ${name}`);
    files[name] = createHash("sha256").update(bytes).digest("hex");
  }
  for (const name of required) if (!files[name]) throw new Error(`Missing protocol export: ${name}`);
  return files;
}
function assertSha(value) {
  if (!/^[a-f0-9]{40}$/i.test(value ?? "")) throw new Error("A full source commit SHA is required");
}
export function captureProtocol(source, artifact, communitySha, coreSha) {
  assertSha(communitySha); assertSha(coreSha);
  if (existsSync(artifact)) throw new Error("Artifact destination must be new");
  const files = inventory(source);
  mkdirSync(artifact, { recursive: true });
  cpSync(source, join(artifact, "mirror"), { recursive: true });
  writeFileSync(join(artifact, "manifest.json"), JSON.stringify({ version: 1, community_sha: communitySha, core_sha: coreSha, files }, null, 2));
  verifyProtocol(artifact, communitySha);
}
export function verifyProtocol(artifact, communitySha, source) {
  assertSha(communitySha);
  const manifest = JSON.parse(readFileSync(join(artifact, "manifest.json"), "utf8"));
  assertSha(manifest.core_sha);
  if (manifest.version !== 1 || manifest.community_sha !== communitySha) throw new Error("Protocol artifact source mismatch");
  if (JSON.stringify(inventory(join(artifact, "mirror"))) !== JSON.stringify(manifest.files)) throw new Error("Protocol artifact content mismatch");
  if (source && JSON.stringify(inventory(source)) !== JSON.stringify(manifest.files)) throw new Error("E2E protocol source changed after capture");
  return manifest;
}
export function restoreProtocol(artifact, destination, communitySha) {
  verifyProtocol(artifact, communitySha);
  // CI-only generated destination; remove stale checkout exports before copying.
  rmSync(destination, { recursive: true, force: true });
  cpSync(join(artifact, "mirror"), destination, { recursive: true });
  verifyProtocol(artifact, communitySha, destination);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [action, artifact] = process.argv.slice(2);
  if (!artifact) throw new Error("Usage: protocol-artifact.mjs capture|verify|restore <artifact-dir>");
  const source = resolve("apps/web/public/steward-protocol");
  if (action === "capture") captureProtocol(source, artifact, process.env.GITHUB_SHA, process.env.SOURCE_CORE_SHA);
  else if (action === "verify") verifyProtocol(artifact, process.env.GITHUB_SHA, source);
  else if (action === "restore") restoreProtocol(artifact, source, process.env.GITHUB_SHA);
  else throw new Error("Unknown artifact action");
}
