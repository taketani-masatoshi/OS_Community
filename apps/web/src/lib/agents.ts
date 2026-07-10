import {
  CORE_AGENTS,
  DEFAULT_STEWARD_AGENT_REPO,
  type AgentDomain,
  type Messages,
} from "@os-community/shared";
import { prisma } from "@/lib/prisma";

export type AgentRegistryItem = {
  id: string;
  name: string;
  description: string;
  domain: AgentDomain;
  domainLabel: string;
  githubRepo: string | null;
  manifestPath: string | null;
  version: string | null;
};

type AgentRecord = {
  slug: string;
  domain: string;
  githubRepo: string | null;
  manifestPath: string | null;
  version: string | null;
};

function mergeAgentRecord(
  agent: AgentRecord,
  agentsPage: Messages["agentsPage"],
): AgentRegistryItem {
  const entry = agentsPage.entries[agent.slug];
  const domain = agent.domain as AgentDomain;
  return {
    id: agent.slug,
    name: entry?.name ?? agent.slug,
    description: entry?.description ?? "",
    domain,
    domainLabel: agentsPage.domainLabels[domain],
    githubRepo: agent.githubRepo,
    manifestPath: agent.manifestPath,
    version: agent.version,
  };
}

async function loadAgentRecords(): Promise<AgentRecord[]> {
  const dbAgents = await prisma.agent.findMany({ orderBy: { slug: "asc" } });
  if (dbAgents.length > 0) {
    return dbAgents.map((agent) => ({
      slug: agent.slug,
      domain: agent.domain,
      githubRepo: agent.githubRepo,
      manifestPath: agent.manifestPath,
      version: agent.version,
    }));
  }

  return CORE_AGENTS.map((agent) => ({
    slug: agent.id,
    domain: agent.domain,
    githubRepo: agent.githubRepo ?? DEFAULT_STEWARD_AGENT_REPO,
    manifestPath: agent.manifestPath ?? `steward/agents/${agent.id}/agent.manifest.yaml`,
    version: null,
  }));
}

export async function getAgentRegistryItems(
  agentsPage: Messages["agentsPage"],
): Promise<AgentRegistryItem[]> {
  const records = await loadAgentRecords();
  return records.map((agent) => mergeAgentRecord(agent, agentsPage));
}

export async function getAgentById(
  id: string,
  agentsPage: Messages["agentsPage"],
): Promise<AgentRegistryItem | null> {
  const agents = await getAgentRegistryItems(agentsPage);
  return agents.find((agent) => agent.id === id) ?? null;
}
