import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

export type StewardReadiness = {
  generated_at?: string;
  score: number;
  steward_side_cap?: number;
  strict_cap_base?: number;
  checks: Array<{ id: string; ok: boolean; detail: string }>;
};

export type StewardSla = {
  generated_at?: string;
  ok: boolean;
  policy: { max_hours: number; escalation_hours: number };
  overdue: Array<{ operator_id: string; hours_since_revoke: number; sla_hours: number }>;
  active_operators: number;
  pending_governance: number;
};

export type StewardOperator = {
  operator_id: string;
  org_name: string;
  org_uri?: string;
  jurisdiction: string;
  hub_ids: string[];
  status: string;
  certified_at?: string;
  certified_by?: string;
};

export type WireTrustNode = {
  node_id: string;
  did?: string;
  node_uri?: string;
  display_name: string;
  protocol_public_key?: string;
  wire_url?: string;
  witness_jurisdiction?: string;
  notes?: string;
};

export type WireTrustRegistry = {
  version: string;
  publish_url?: string;
  nodes: WireTrustNode[];
};

export type StewardOperatorsRegistry = {
  version: string;
  committee_id?: string;
  revocation_sla: { max_hours: number; escalation_hours: number };
  operators: StewardOperator[];
  governance_requests: Array<{
    request_id: string;
    operator_id: string;
    org_name: string;
    jurisdiction: string;
    hub_ids: string[];
    status: string;
    requested_by: string;
    requested_at: string;
  }>;
};

function stewardMirrorRoot(): string {
  const env = process.env.STEWARD_PROTOCOL_MIRROR?.trim();
  if (env) return env;
  const candidates = [
    join(process.cwd(), "public", "steward-protocol"),
    join(process.cwd(), "..", "..", "OS_Steward", "publish", "protocol"),
    join(process.cwd(), "..", "OS_Steward", "publish", "protocol"),
    join(process.cwd(), "publish", "protocol"),
  ];
  for (const c of candidates) {
    if (existsSync(join(c, "community-readiness.json")) || existsSync(join(c, "trusted-operators.yaml"))) {
      return c;
    }
  }
  return candidates[0]!;
}

function readJson<T>(name: string): T | null {
  const path = join(stewardMirrorRoot(), name);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

export function getStewardMirrorPath(): string {
  return stewardMirrorRoot();
}

export function loadStewardReadiness(): StewardReadiness | null {
  return readJson<StewardReadiness>("community-readiness.json");
}

export function loadStewardSla(): StewardSla | null {
  return readJson<StewardSla>("community-sla.json");
}

export function loadStewardOperators(): StewardOperatorsRegistry | null {
  const path = join(stewardMirrorRoot(), "trusted-operators.yaml");
  if (!existsSync(path)) return null;
  try {
    return parseYaml(readFileSync(path, "utf-8")) as StewardOperatorsRegistry;
  } catch {
    return null;
  }
}

export function loadWireTrustRegistry(): WireTrustRegistry | null {
  const path = join(stewardMirrorRoot(), "wire-trust-registry.yaml");
  if (!existsSync(path)) return null;
  try {
    return parseYaml(readFileSync(path, "utf-8")) as WireTrustRegistry;
  } catch {
    return null;
  }
}

export function listWireJurisdictions(registry: WireTrustRegistry): string[] {
  const codes = new Set<string>();
  for (const node of registry.nodes) {
    if (node.witness_jurisdiction) codes.add(node.witness_jurisdiction);
  }
  return [...codes].sort();
}

export function stewardMirrorAvailable(): boolean {
  return (
    existsSync(join(stewardMirrorRoot(), "community-readiness.json")) ||
    existsSync(join(stewardMirrorRoot(), "trusted-operators.yaml"))
  );
}

export function demoStewardReadiness(): StewardReadiness {
  return {
    score: 95,
    checks: [
      { id: "trusted-operators-registry", ok: true, detail: "demo — sync Steward mirror" },
      { id: "revocation-sla-current", ok: true, detail: "demo" },
    ],
  };
}

export function demoStewardSla(): StewardSla {
  return {
    ok: true,
    policy: { max_hours: 24, escalation_hours: 4 },
    overdue: [],
    active_operators: 2,
    pending_governance: 0,
  };
}
