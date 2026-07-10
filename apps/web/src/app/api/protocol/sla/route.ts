import { loadStewardSla, demoStewardSla, stewardMirrorAvailable } from "@/lib/steward-protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = loadStewardSla() ?? demoStewardSla();
  return Response.json({
    ...data,
    mirror_available: stewardMirrorAvailable(),
    source: stewardMirrorAvailable() ? "steward-mirror" : "demo",
  });
}
