import type { PageMessages } from "@os-community/shared";

const FALLBACK_TIER_LABELS: PageMessages["standards"]["readinessTiers"] = {
  skeleton: "Skeleton",
  activation_ready: "Activation ready",
  production_ready: "Production ready",
  unsupported: "Unsupported",
};

export function readinessTierLabel(
  tiers: PageMessages["standards"]["readinessTiers"] | undefined,
  tier: string,
): string {
  const labels = tiers ?? FALLBACK_TIER_LABELS;
  const key = tier as keyof typeof labels;
  return labels[key] ?? tier;
}
