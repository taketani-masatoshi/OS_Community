#!/usr/bin/env node
/**
 * OS_Steward の module.manifest.yaml / pack.manifest.yaml を読み、
 * PostgreSQL（Prisma）へ upsert する同期スクリプト。
 *
 * Usage: STEWARD_REPO_PATH=/path/to/OS_Steward DATABASE_URL=... npm run sync:modules
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const STEWARD_PATH = process.env.STEWARD_REPO_PATH ?? join(process.cwd(), "..", "OS_Steward");

const BUSINESS_MODULES = [
  "rental", "hospitality", "restaurant", "professional_services", "saas_subscription",
  "venture_capital", "event_space", "ecommerce", "retail_store", "clinic",
  "logistics", "staffing", "construction", "education", "membership",
  "software_outsourcing", "event_operations", "real_estate_brokerage",
  "property_management", "travel_booking",
];

const JURISDICTION_PACKS = ["JP", "US", "SG", "EE", "HK"];

function readYaml(path) {
  if (!existsSync(path)) return null;
  return parseYaml(readFileSync(path, "utf8"));
}

function slugToName(slug) {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function syncBusiness() {
  const readiness = readYaml(join(STEWARD_PATH, "steward/modules/readiness.yaml")) ?? {};
  const tiers = readiness.modules ?? {};

  for (const slug of BUSINESS_MODULES) {
    const manifest = readYaml(join(STEWARD_PATH, `steward/modules/${slug}/module.manifest.yaml`));
    const tier = tiers[slug]?.tier ?? "skeleton";
    const repo =
      manifest?.repository ??
      process.env.DEFAULT_STEWARD_REPO ??
      "https://github.com/steward-os/steward";
    const version = manifest?.version ?? null;

    await prisma.module.upsert({
      where: { slug },
      create: {
        slug,
        name: slugToName(slug),
        moduleType: "BUSINESS",
        trustLevel: "COMMUNITY",
        readinessTier: tier,
        manifestPath: `steward/modules/${slug}/module.manifest.yaml`,
        githubRepo: repo,
        version,
        metadata: manifest ?? {},
      },
      update: {
        readinessTier: tier,
        metadata: manifest ?? {},
        githubRepo: repo,
        version,
      },
    });
    console.log(`  business: ${slug} (${tier})`);
  }
}

async function syncJurisdiction() {
  for (const code of JURISDICTION_PACKS) {
    const slug = `jurisdiction-${code.toLowerCase()}`;
    const manifest = readYaml(join(STEWARD_PATH, `steward/jurisdiction-packs/${code}/pack.manifest.yaml`));
    const owner = manifest?.owner;

    await prisma.module.upsert({
      where: { slug },
      create: {
        slug,
        name: manifest?.name ?? code,
        moduleType: "JURISDICTION",
        trustLevel: "COMMUNITY",
        jurisdictionCode: code,
        manifestPath: `steward/jurisdiction-packs/${code}/pack.manifest.yaml`,
        githubRepo: manifest?.repository,
        version: manifest?.version,
        ownerOrg: owner?.org,
        maintainers: owner?.maintainers ?? [],
        metadata: manifest ?? {},
      },
      update: {
        version: manifest?.version,
        maintainers: owner?.maintainers ?? [],
        metadata: manifest ?? {},
        githubRepo: manifest?.repository,
      },
    });
    console.log(`  jurisdiction: ${slug}`);
  }
}

async function main() {
  console.log(`Syncing from: ${STEWARD_PATH}`);
  if (!existsSync(STEWARD_PATH)) {
    console.error(`Steward repo not found: ${STEWARD_PATH}`);
    process.exit(1);
  }
  await syncBusiness();
  await syncJurisdiction();
  console.log("Sync complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
