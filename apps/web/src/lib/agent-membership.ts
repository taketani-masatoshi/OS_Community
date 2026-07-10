import { prisma } from "@/lib/prisma";
import { getAgentById } from "@/lib/agents";
import { triggerGitHubProvisioning } from "@/lib/github-provisioning";
import type { Messages } from "@os-community/shared";

export async function grantAgentMembership(input: {
  agentId: string;
  userId: string;
  agentsPage: Messages["agentsPage"];
}) {
  const agent = await getAgentById(input.agentId, input.agentsPage);
  if (!agent) {
    return { ok: false as const, reason: "NOT_FOUND" as const };
  }

  const existing = await prisma.agentMember.findUnique({
    where: {
      agentSlug_userId: { agentSlug: agent.id, userId: input.userId },
    },
  });
  if (existing) {
    return { ok: true as const, alreadyMember: true as const, agentSlug: agent.id };
  }

  await prisma.agentMember.create({
    data: {
      agentSlug: agent.id,
      userId: input.userId,
    },
  });

  triggerGitHubProvisioning(input.userId);

  return { ok: true as const, alreadyMember: false as const, agentSlug: agent.id };
}
