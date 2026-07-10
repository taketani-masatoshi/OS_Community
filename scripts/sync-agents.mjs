#!/usr/bin/env node
/**
 * CORE_AGENTS / OS_Steward agent.manifest.yaml を PostgreSQL（Agent）へ upsert。
 *
 * Usage: STEWARD_REPO_PATH=/path/to/OS_Steward DATABASE_URL=... npm run sync:agents
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const STEWARD_PATH = process.env.STEWARD_REPO_PATH ?? join(process.cwd(), "..", "OS_Steward");
const DEFAULT_REPO = process.env.DEFAULT_STEWARD_REPO ?? "https://github.com/steward-os/steward";

const CORE_AGENTS = [
  { id: "executive", domain: "governance" },
  { id: "secretary", domain: "governance" },
  { id: "finance", domain: "finance" },
  { id: "contract", domain: "finance" },
  { id: "compliance", domain: "finance" },
  { id: "operations", domain: "operations" },
];

function readYaml(path) {
  if (!existsSync(path)) return null;
  return parseYaml(readFileSync(path, "utf8"));
}

async function syncAgents() {
  for (const agent of CORE_AGENTS) {
    const manifestPath = `steward/agents/${agent.id}/agent.manifest.yaml`;
    const manifest = readYaml(join(STEWARD_PATH, manifestPath));
    const githubRepo = manifest?.repository ?? DEFAULT_REPO;
    const version = manifest?.version ?? null;

    await prisma.agent.upsert({
      where: { slug: agent.id },
      create: {
        slug: agent.id,
        domain: agent.domain,
        githubRepo,
        manifestPath,
        version,
        metadata: manifest ?? {},
      },
      update: {
        domain: agent.domain,
        githubRepo,
        manifestPath,
        version,
        metadata: manifest ?? {},
      },
    });
    console.log(`  agent: ${agent.id} (${agent.domain})`);
  }
}

async function main() {
  console.log(`Syncing agents (steward path: ${STEWARD_PATH})`);
  await syncAgents();
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
