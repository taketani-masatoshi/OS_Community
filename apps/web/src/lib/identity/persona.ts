import { prisma } from "@/lib/prisma";
import { getLinkedIdentity } from "@/lib/identity/accounts";
import { getUserLayerStatus } from "@/lib/identity/layers";

export type CommunityPersona = "coder" | "professional" | "hybrid" | "exploring";

export type CommunityPersonaResult = {
  persona: CommunityPersona;
  coderSignals: string[];
  professionalSignals: string[];
};

export async function getUserCommunityPersona(userId: string): Promise<CommunityPersonaResult> {
  const [identity, layers, moduleRoleCount, wildCount, committeeCount, pendingRequests] =
    await Promise.all([
      getLinkedIdentity(userId),
      getUserLayerStatus(userId),
      prisma.moduleRole.count({ where: { userId } }),
      prisma.wildModuleRegistration.count({ where: { userId } }),
      prisma.committeeMember.count({ where: { userId } }),
      prisma.moduleRoleRequest.count({ where: { userId, status: "PENDING" } }),
    ]);

  const coderSignals: string[] = [];
  const professionalSignals: string[] = [];

  if (identity.githubLinked) coderSignals.push("github");
  if (layers.githubReposConnected) coderSignals.push("repos");
  if (moduleRoleCount > 0) coderSignals.push("moduleRoles");

  if (identity.linkedinLinked) professionalSignals.push("linkedin");
  if (wildCount > 0) professionalSignals.push("moduleProposals");
  if (committeeCount > 0) professionalSignals.push("committees");
  if (pendingRequests > 0) professionalSignals.push("roleApplications");

  const coder = coderSignals.length > 0;
  const professional = professionalSignals.length > 0;

  let persona: CommunityPersona = "exploring";
  if (coder && professional) persona = "hybrid";
  else if (coder) persona = "coder";
  else if (professional) persona = "professional";

  return { persona, coderSignals, professionalSignals };
}
