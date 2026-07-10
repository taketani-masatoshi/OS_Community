import { requireProfileCompleteApi } from "@/lib/session";
import { apiErrorResponse } from "@/lib/api-error";
import { getT } from "@/lib/i18n";
import { grantAgentMembership } from "@/lib/agent-membership";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireProfileCompleteApi();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const { messages: t } = await getT();

  try {
    const result = await grantAgentMembership({
      agentId: id,
      userId: authResult.session.user.id,
      agentsPage: t.agentsPage,
    });
    if (!result.ok) {
      return apiErrorResponse("NOT_FOUND", 404);
    }
    return Response.json({ ok: true, alreadyMember: result.alreadyMember });
  } catch {
    return apiErrorResponse("SAVE_FAILED", 500);
  }
}
