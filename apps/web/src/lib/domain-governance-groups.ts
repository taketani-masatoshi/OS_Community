import type { Locale } from "@os-community/shared";
import {
  buildDomainGovernanceTree,
  findGovernanceCommitteeDefinition,
  getGovernanceExpertDomainLabel,
  getGovernanceJurisdictionLabel,
  getLocalized,
} from "@os-community/shared";

export type DomainCommitteeTreeItem = {
  slug: string;
  jurisdictionCode: string | null;
  expertDomainKey: string | null;
  memberCount: number;
  governedModuleCount: number;
};

export type DomainGovernanceGroup = {
  code: string;
  jurisdictionLabel: string;
  regionLabel: string;
  domains: Array<{
    slug: string;
    domainLabel: string;
    committeeName: string;
    memberCount: number | null;
    governedModuleCount: number | null;
    href: string | null;
  }>;
};

function committeeMatrixKey(committee: DomainCommitteeTreeItem): string | null {
  if (committee.jurisdictionCode && committee.expertDomainKey) {
    return `${committee.jurisdictionCode.toUpperCase()}:${committee.expertDomainKey}`;
  }
  const [jurisdiction, ...domainParts] = committee.slug.split("-");
  if (!jurisdiction || domainParts.length === 0) return null;
  return `${jurisdiction.toUpperCase()}:${domainParts.join("-")}`;
}

export function buildDomainGovernanceGroups(
  locale: Locale,
  committees: DomainCommitteeTreeItem[],
): DomainGovernanceGroup[] {
  const cellBySlug = new Map(committees.map((committee) => [committee.slug, committee]));
  const cellByKey = new Map<string, DomainCommitteeTreeItem>();
  for (const committee of committees) {
    const key = committeeMatrixKey(committee);
    if (key) cellByKey.set(key, committee);
  }

  return buildDomainGovernanceTree().map((group) => ({
    code: group.jurisdiction.code,
    jurisdictionLabel: getGovernanceJurisdictionLabel(group.jurisdiction.code, locale),
    regionLabel: getLocalized(group.jurisdiction.region, locale),
    domains: group.domains.map((item) => {
      const cell =
        cellBySlug.get(item.slug) ??
        cellByKey.get(`${group.jurisdiction.code}:${item.domain.key}`);
      const domainLabel = getGovernanceExpertDomainLabel(item.domain.key, locale);
      const def = findGovernanceCommitteeDefinition(item.slug);
      const committeeName = def ? getLocalized(def.name, locale) : domainLabel;

      return {
        slug: item.slug,
        domainLabel,
        committeeName,
        memberCount: cell?.memberCount ?? null,
        governedModuleCount: cell?.governedModuleCount ?? null,
        href: cell ? `/committees/${cell.slug}` : null,
      };
    }),
  }));
}
