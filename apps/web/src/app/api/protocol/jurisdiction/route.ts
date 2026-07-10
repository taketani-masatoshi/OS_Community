import { loadWireTrustRegistry, listWireJurisdictions, stewardMirrorAvailable } from "@/lib/steward-protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const registry = loadWireTrustRegistry();
  if (!registry) {
    return Response.json({ nodes: [], jurisdictions: [], mirror_available: stewardMirrorAvailable() });
  }
  return Response.json({
    version: registry.version,
    publish_url: registry.publish_url,
    nodes: registry.nodes,
    jurisdictions: listWireJurisdictions(registry),
    mirror_available: true,
  });
}
