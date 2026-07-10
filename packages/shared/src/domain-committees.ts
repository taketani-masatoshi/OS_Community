import { getLocalized, type Locale } from "./i18n";
import {
  buildGovernanceCommitteeDefinitions,
  type GovernanceCommitteeDefinition,
} from "./governance-matrix";

/** @deprecated Use GovernanceCommitteeDefinition from governance-matrix */
export type DomainCommitteeKey = GovernanceCommitteeDefinition["id"];

export const DOMAIN_COMMITTEE_KEYS = buildGovernanceCommitteeDefinitions().map(
  (c) => c.id
) as DomainCommitteeKey[];

/** @deprecated Use MODULE_EXPERT_DOMAIN_MAP from governance-matrix */
export { MODULE_EXPERT_DOMAIN_MAP, resolveDomainCommitteeSlugsForModule } from "./governance-matrix";

/** Backward-compatible alias — populated at runtime via resolveDomainCommitteeSlugsForModule */
export const MODULE_DOMAIN_COMMITTEE_MAP: Record<string, DomainCommitteeKey[]> = {};

export function getDomainCommitteeDefinition(key: DomainCommitteeKey) {
  return buildGovernanceCommitteeDefinitions().find((c) => c.id === key);
}

export function getDomainCommitteeName(key: DomainCommitteeKey, locale: Locale): string {
  const def = getDomainCommitteeDefinition(key);
  if (!def) return key;
  return getLocalized(def.name, locale);
}

export function getDomainCommitteeDomainLabel(key: DomainCommitteeKey, locale: Locale): string {
  const def = getDomainCommitteeDefinition(key);
  if (!def) return key;
  return getLocalized(def.domain, locale);
}

export const COMMITTEES_FROM_MATRIX = buildGovernanceCommitteeDefinitions().map((def) => ({
  id: def.id,
  name: def.name,
  domain: def.domain,
  jurisdictionCode: def.jurisdictionCode,
  expertDomainKey: def.expertDomainKey,
}));
