import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { loadStewardOperators } from "@/lib/steward-protocol";
import { requireRoleApi } from "@/lib/session";
import { readJsonBody } from "@/lib/api-body";
import { apiErrorResponse } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

export async function GET() {
  const registry = loadStewardOperators();
  if (!registry) {
    return Response.json({ pending: [], mirror_available: false });
  }
  return Response.json({
    pending: registry.governance_requests.filter((r) => r.status === "pending"),
    mirror_available: true,
  });
}

type DecideBody = {
  requestId: string;
  approve: boolean;
  note?: string;
  authorityId?: string;
};

export async function POST(request: Request) {
  const authResult = await requireRoleApi(["ADMIN"]);
  if ("error" in authResult) return authResult.error;

  const bodyResult = await readJsonBody<DecideBody>(request);
  if (bodyResult instanceof Response) return bodyResult;
  if (!bodyResult.requestId) {
    return apiErrorResponse("VALIDATION", 400);
  }

  const stewardRoot = process.env.STEWARD_ORGOS_ROOT?.trim();
  if (!stewardRoot) {
    return Response.json(
      {
        ok: false,
        mode: "read-only",
        message: "Set STEWARD_ORGOS_ROOT to enable governance decide via Steward CLI",
        cli_hint: `npm run orgos -- protocol community governance decide --request-id ${bodyResult.requestId} ${bodyResult.approve ? "--approve" : "--reject"} --decided-by ${authResult.session.user.id}`,
      },
      { status: 501 },
    );
  }

  const args = [
    "run",
    "orgos",
    "--",
    "protocol",
    "community",
    "governance",
    "decide",
    "--request-id",
    bodyResult.requestId,
    bodyResult.approve ? "--approve" : "--reject",
    "--decided-by",
    authResult.session.user.id,
    "--json",
  ];
  if (bodyResult.note) args.push("--note", bodyResult.note);
  if (bodyResult.authorityId) args.push("--authority-id", bodyResult.authorityId);

  try {
    const { stdout } = await execFileAsync("npm", args, { cwd: stewardRoot, maxBuffer: 1024 * 1024 });
    const result = JSON.parse(stdout.trim().split("\n").pop() ?? "{}");
    return Response.json({ ok: true, mode: "steward-cli", result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "governance decide failed";
    return apiErrorResponse("INTERNAL", 500, { extra: { message } });
  }
}
