import type { MonoIconName } from "@/components/icons/MonoIcon";

/** Starter modules shown at the top of the registry for new visitors. */
export const RECOMMENDED_MODULE_SLUGS = ["clinic", "professional_services", "event_operations"] as const;

const DOMAIN_ICON_RULES: { pattern: RegExp; icon: MonoIconName }[] = [
  { pattern: /clinic|health|medical/, icon: "activity" },
  { pattern: /contract|legal|compliance/, icon: "scale" },
  { pattern: /finance|account|tax|j-sox/, icon: "bar-chart" },
  { pattern: /governance|executive|secretary/, icon: "landmark" },
  { pattern: /event|hospitality|restaurant|travel/, icon: "calendar" },
  { pattern: /retail|ecommerce|store/, icon: "shopping-bag" },
  { pattern: /logistics|construction|operations/, icon: "wrench" },
  { pattern: /education|research|membership/, icon: "book" },
  { pattern: /jurisdiction/, icon: "globe" },
  { pattern: /software|saas|outsourcing/, icon: "monitor" },
];

export function getModuleDomainIcon(slug: string, moduleType: string): MonoIconName {
  const haystack = `${slug} ${moduleType}`.toLowerCase();
  for (const rule of DOMAIN_ICON_RULES) {
    if (rule.pattern.test(haystack)) return rule.icon;
  }
  return "box";
}

/** Hide repeated demo maintainer logins behind a friendly label. */
export function formatMaintainerDisplay(
  stewards: string[],
  communityLabel: string
): string | null {
  if (stewards.length === 0) return null;
  const unique = [...new Set(stewards.filter(Boolean))];
  if (unique.length === 1 && unique[0] !== "—") {
    return communityLabel;
  }
  return unique.join(", ");
}
