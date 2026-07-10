import { PrismaClient, ModuleType, TrustLevel } from "@prisma/client";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

const prisma = new PrismaClient();

const STEWARD_PATH = process.env.STEWARD_REPO_PATH ?? join(process.cwd(), "..", "..", "OS_Steward");

const BUSINESS_MODULES = [
  "rental", "hospitality", "restaurant", "professional_services", "saas_subscription",
  "venture_capital", "event_space", "ecommerce", "retail_store", "clinic",
  "logistics", "staffing", "construction", "education", "membership",
  "software_outsourcing", "event_operations", "real_estate_brokerage",
  "property_management", "travel_booking",
];

const JURISDICTION_PACKS = ["JP", "US", "SG", "EE", "HK"];

function readYaml(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null;
  return parseYaml(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function slugToName(slug: string): string {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function upsertBusinessModules() {
  const readinessPath = join(STEWARD_PATH, "steward/modules/readiness.yaml");
  const readiness = readYaml(readinessPath) ?? {};
  const tiers = (readiness as { modules?: Record<string, { tier?: string }> }).modules ?? {};

  for (const slug of BUSINESS_MODULES) {
    const manifestPath = join(STEWARD_PATH, `steward/modules/${slug}/module.manifest.yaml`);
    const manifest = readYaml(manifestPath);
    const tier = tiers[slug]?.tier ?? "skeleton";

    await prisma.module.upsert({
      where: { slug },
      create: {
        slug,
        name: slugToName(slug),
        moduleType: ModuleType.BUSINESS,
        trustLevel: TrustLevel.COMMUNITY,
        readinessTier: tier,
        manifestPath: `steward/modules/${slug}/module.manifest.yaml`,
        githubRepo: process.env.DEFAULT_STEWARD_REPO ?? "https://github.com/steward-os/steward",
        metadata: manifest ?? {},
      },
      update: {
        readinessTier: tier,
        metadata: manifest ?? {},
      },
    });
  }
}

async function upsertJurisdictionPacks() {
  for (const code of JURISDICTION_PACKS) {
    const slug = `jurisdiction-${code.toLowerCase()}`;
    const manifestPath = join(STEWARD_PATH, `steward/jurisdiction-packs/${code}/pack.manifest.yaml`);
    const manifest = readYaml(manifestPath);
    const owner = manifest?.owner as { org?: string; maintainers?: string[] } | undefined;

    await prisma.module.upsert({
      where: { slug },
      create: {
        slug,
        name: (manifest?.name as string) ?? code,
        moduleType: ModuleType.JURISDICTION,
        trustLevel: TrustLevel.COMMUNITY,
        jurisdictionCode: code,
        manifestPath: `steward/jurisdiction-packs/${code}/pack.manifest.yaml`,
        githubRepo: (manifest?.repository as string) ?? undefined,
        version: (manifest?.version as string) ?? undefined,
        ownerOrg: owner?.org,
        maintainers: owner?.maintainers ?? [],
        metadata: manifest ?? {},
      },
      update: {
        version: (manifest?.version as string) ?? undefined,
        maintainers: owner?.maintainers ?? [],
        metadata: manifest ?? {},
      },
    });
  }
}

async function seedFounder() {
  const {
    FOUNDER_NAME,
    FOUNDER_PROFILE_SLUG,
    FOUNDER_GITHUB_DEFAULT,
    FOUNDER_GITHUB_LEGACY,
    STANDARD_COMMITTEE_SLUG,
  } = await import("@os-community/shared");

  const name = process.env.SEED_FOUNDER_NAME ?? FOUNDER_NAME;
  const githubLogin =
    process.env.SEED_FOUNDER_GITHUB ?? process.env.SEED_ADMIN_GITHUB ?? FOUNDER_GITHUB_DEFAULT;
  const profilePath = process.env.SEED_FOUNDER_PROFILE_SLUG ?? FOUNDER_PROFILE_SLUG;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ githubLogin }, { githubLogin: FOUNDER_GITHUB_LEGACY }, { name }],
    },
  });

  const founder = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          githubLogin,
          publicSlug: profilePath,
          siteRole: "ADMIN",
          specialty: "ガバナンス・OrgOS",
          region: "日本",
          organization: "OpenOrgOS",
          bio: "OpenOrgOS 創設者。OrgOS のオープンソースコミュニティを牽引。",
          profileCompletedAt: new Date(),
        },
      })
    : await prisma.user.create({
        data: {
          name,
          githubLogin,
          publicSlug: profilePath,
          siteRole: "ADMIN",
          specialty: "ガバナンス・OrgOS",
          region: "日本",
          organization: "OpenOrgOS",
          bio: "OpenOrgOS 創設者。OrgOS のオープンソースコミュニティを牽引。",
          profileCompletedAt: new Date(),
        },
      });

  const modules = await prisma.module.findMany();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 3);

  for (const mod of modules) {
    for (const role of ["MAINTAINER", "CONTRIBUTOR"] as const) {
      await prisma.moduleRole.upsert({
        where: {
          moduleId_userId_role: { moduleId: mod.id, userId: founder.id, role },
        },
        create: { moduleId: mod.id, userId: founder.id, role },
        update: {},
      });
    }

    const maintainers = mod.maintainers.includes(name)
      ? mod.maintainers
      : [...mod.maintainers, name];
    await prisma.module.update({
      where: { id: mod.id },
      data: { maintainers },
    });

    const committee = await prisma.committee.findUnique({ where: { moduleId: mod.id } });
    if (committee) {
      await prisma.committeeMember.upsert({
        where: {
          committeeId_userId: { committeeId: committee.id, userId: founder.id },
        },
        create: { committeeId: committee.id, userId: founder.id, role: "CHAIR" },
        update: { role: "CHAIR" },
      });
    }
  }

  for (const [type, prefix] of [
    ["STEWARD_OPERATOR", "OOO"],
    ["STEWARD_DESIGNER", "OOD"],
  ] as const) {
    const certificateNo = `${prefix}-${profilePath.toUpperCase()}-001`;
    await prisma.certification.upsert({
      where: { certificateNo },
      create: {
        userId: founder.id,
        type,
        certificateNo,
        status: "APPROVED",
        expiresAt,
        notes: "Founding certified professional",
      },
      update: {
        userId: founder.id,
        status: "APPROVED",
        expiresAt,
      },
    });
  }

  const standard = await prisma.committee.findUnique({
    where: { slug: STANDARD_COMMITTEE_SLUG },
  });
  if (standard) {
    await prisma.committeeMember.upsert({
      where: {
        committeeId_userId: { committeeId: standard.id, userId: founder.id },
      },
      create: { committeeId: standard.id, userId: founder.id, role: "CHAIR" },
      update: { role: "CHAIR" },
    });
  }

  console.log(`Founder seeded: ${name} (@${githubLogin}) → /users/${profilePath}`);
  console.log(`  Modules: MAINTAINER + CONTRIBUTOR on ${modules.length} modules`);
  console.log(`  Certifications: OOO + OOD`);
}

async function seedLeadershipMembers() {
  const { LEADERSHIP_MEMBER_KAORU, LEADERSHIP_MEMBER_LISA } = await import("@os-community/shared");

  for (const entry of [LEADERSHIP_MEMBER_KAORU, LEADERSHIP_MEMBER_LISA]) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ publicSlug: entry.profileSlug }, { name: entry.name }] },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: entry.name,
          publicSlug: entry.profileSlug,
          siteRole: "MEMBER",
          organization: "OpenOrgOS Community",
          region: "日本",
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name: entry.name,
          publicSlug: entry.profileSlug,
          siteRole: "MEMBER",
          organization: "OpenOrgOS Community",
          region: "日本",
        },
      });
    }

    console.log(`Leadership member seeded: ${entry.name} → /users/${entry.profileSlug}`);
  }
}

async function seedCommittees() {
  const {
    STANDARD_COMMITTEE_SLUG,
    moduleCommitteeSlug,
    buildGovernanceCommitteeDefinitions,
    DOMAIN_COMMITTEE_DESCRIPTION,
    resolveDomainCommitteeSlugsForModule,
    GOVERNANCE_JURISDICTIONS,
    GOVERNANCE_EXPERT_DOMAINS,
  } = await import("@os-community/shared");

  await prisma.committee.upsert({
    where: { slug: STANDARD_COMMITTEE_SLUG },
    create: {
      slug: STANDARD_COMMITTEE_SLUG,
      name: "OpenOrgOS Standard Committee",
      type: "STANDARD",
      description: "Governs OpenOrgOS Standard adoption across all modules.",
    },
    update: {},
  });

  for (const def of buildGovernanceCommitteeDefinitions()) {
    await prisma.committee.upsert({
      where: { slug: def.id },
      create: {
        slug: def.id,
        domainKey: def.id,
        jurisdictionCode: def.jurisdictionCode,
        expertDomainKey: def.expertDomainKey,
        name: def.name.en,
        type: "DOMAIN",
        description: DOMAIN_COMMITTEE_DESCRIPTION.en,
      },
      update: {
        name: def.name.en,
        domainKey: def.id,
        jurisdictionCode: def.jurisdictionCode,
        expertDomainKey: def.expertDomainKey,
      },
    });
  }

  for (const jurisdiction of GOVERNANCE_JURISDICTIONS) {
    for (const domain of GOVERNANCE_EXPERT_DOMAINS) {
      const slug = `${jurisdiction.code.toLowerCase()}-${domain.key}`;
      await prisma.expertiseTag.upsert({
        where: { slug },
        create: {
          slug,
          name: `${jurisdiction.name.en} · ${domain.name.en}`,
          jurisdictionCode: jurisdiction.code,
          expertDomainKey: domain.key,
        },
        update: {
          name: `${jurisdiction.name.en} · ${domain.name.en}`,
          jurisdictionCode: jurisdiction.code,
          expertDomainKey: domain.key,
        },
      });
    }
  }

  const modules = await prisma.module.findMany({
    select: { id: true, slug: true, name: true, jurisdictionCode: true },
  });
  for (const mod of modules) {
    await prisma.committee.upsert({
      where: { slug: moduleCommitteeSlug(mod.slug) },
      create: {
        slug: moduleCommitteeSlug(mod.slug),
        name: `${mod.name} Committee`,
        type: "MODULE",
        moduleId: mod.id,
        description: `Module committee for ${mod.name}.`,
      },
      update: { name: `${mod.name} Committee` },
    });
  }

  for (const mod of modules) {
    const slugs = resolveDomainCommitteeSlugsForModule(mod);
    for (const slug of slugs) {
      const committee = await prisma.committee.findUnique({ where: { slug } });
      if (!committee) continue;
      await prisma.moduleDomainCommittee.upsert({
        where: {
          moduleId_committeeId: { moduleId: mod.id, committeeId: committee.id },
        },
        create: { moduleId: mod.id, committeeId: committee.id },
        update: {},
      });
    }
  }

  const admin = await prisma.user.findFirst({
    where: { siteRole: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });
  const standard = await prisma.committee.findUnique({ where: { slug: STANDARD_COMMITTEE_SLUG } });
  if (admin && standard) {
    await prisma.committeeMember.upsert({
      where: { committeeId_userId: { committeeId: standard.id, userId: admin.id } },
      create: { committeeId: standard.id, userId: admin.id, role: "CHAIR" },
      update: { role: "CHAIR" },
    });
  }
}

async function upsertAgents() {
  const defaultRepo = process.env.DEFAULT_STEWARD_REPO ?? "https://github.com/steward-os/steward";
  const agents = [
    { slug: "executive", domain: "governance" },
    { slug: "secretary", domain: "governance" },
    { slug: "finance", domain: "finance" },
    { slug: "contract", domain: "finance" },
    { slug: "compliance", domain: "finance" },
    { slug: "operations", domain: "operations" },
  ];

  for (const agent of agents) {
    const manifestPath = `steward/agents/${agent.slug}/agent.manifest.yaml`;
    await prisma.agent.upsert({
      where: { slug: agent.slug },
      create: {
        slug: agent.slug,
        domain: agent.domain,
        githubRepo: defaultRepo,
        manifestPath,
      },
      update: {
        domain: agent.domain,
        githubRepo: defaultRepo,
        manifestPath,
      },
    });
  }
}

async function main() {
  console.log(`Seeding from Steward path: ${STEWARD_PATH}`);
  await upsertBusinessModules();
  await upsertJurisdictionPacks();
  await upsertAgents();
  await seedCommittees();
  await seedFounder();
  await seedLeadershipMembers();
  const { seedComplianceRegistry } = await import("./seed-compliance-registry");
  await seedComplianceRegistry(prisma);
  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
