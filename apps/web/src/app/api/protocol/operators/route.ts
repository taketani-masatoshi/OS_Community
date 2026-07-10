import { loadStewardOperators, stewardMirrorAvailable } from "@/lib/steward-protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jurisdiction = url.searchParams.get("jurisdiction") ?? undefined;
  const registry = loadStewardOperators();
  if (!registry) {
    return Response.json(
      {
        ok: false,
        mirror_available: false,
        operators: [],
        governance_requests: [],
        message: "Steward mirror not found — run scripts/sync-steward-protocol.sh",
      },
      { status: 503 }
    );
  }
  let operators = registry.operators;
  if (jurisdiction) {
    operators = operators.filter((o) => o.jurisdiction === jurisdiction);
  }
  return Response.json({
    ok: true,
    mirror_available: stewardMirrorAvailable(),
    committee_id: registry.committee_id,
    revocation_sla: registry.revocation_sla,
    operators,
    governance_requests: registry.governance_requests.filter((r) => r.status === "pending"),
  });
}
