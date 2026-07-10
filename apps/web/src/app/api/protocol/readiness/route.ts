import { loadStewardReadiness, demoStewardReadiness, stewardMirrorAvailable } from "@/lib/steward-protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = loadStewardReadiness() ?? demoStewardReadiness();
  return Response.json({
    ...data,
    mirror_available: stewardMirrorAvailable(),
    source: stewardMirrorAvailable() ? "steward-mirror" : "demo",
  });
}
