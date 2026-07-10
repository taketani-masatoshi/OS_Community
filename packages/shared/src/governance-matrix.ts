import { localized, type LocalizedStrings } from "./i18n/localized";
import { getLocalized, type Locale } from "./i18n";

/** 法域 — ビジネスロジック・法解釈の委任先 */
export const GOVERNANCE_JURISDICTIONS = [
  {
    code: "JP",
    name: localized({ ja: "日本", en: "Japan", zh: "日本" }),
    region: localized({ ja: "アジア太平洋", en: "Asia-Pacific", zh: "亚太" }),
  },
  {
    code: "US",
    name: localized({ ja: "米国", en: "United States", zh: "美国" }),
    region: localized({ ja: "北米", en: "North America", zh: "北美" }),
  },
  {
    code: "SG",
    name: localized({ ja: "シンガポール", en: "Singapore", zh: "新加坡" }),
    region: localized({ ja: "アジア太平洋", en: "Asia-Pacific", zh: "亚太" }),
  },
  {
    code: "HK",
    name: localized({ ja: "香港", en: "Hong Kong", zh: "香港" }),
    region: localized({ ja: "アジア太平洋", en: "Asia-Pacific", zh: "亚太" }),
  },
  {
    code: "EE",
    name: localized({ ja: "エストニア", en: "Estonia", zh: "爱沙尼亚" }),
    region: localized({ ja: "欧州", en: "Europe", zh: "欧洲" }),
  },
  {
    code: "EU",
    name: localized({ ja: "欧州連合", en: "European Union", zh: "欧盟" }),
    region: localized({ ja: "欧州", en: "Europe", zh: "欧洲" }),
  },
  {
    code: "CN",
    name: localized({ ja: "中国", en: "China", zh: "中国" }),
    region: localized({ ja: "アジア太平洋", en: "Asia-Pacific", zh: "亚太" }),
  },
] as const;

export type GovernanceJurisdictionCode = (typeof GOVERNANCE_JURISDICTIONS)[number]["code"];

/** 専門ドメイン — 法域ごとに組み合わせ可能 */
export const GOVERNANCE_EXPERT_DOMAINS = [
  {
    key: "accounting",
    name: localized({ ja: "会計・税務", en: "Accounting & Tax", zh: "会计与税务" }),
  },
  {
    key: "legal",
    name: localized({ ja: "法務・契約", en: "Legal & Contracts", zh: "法务与合同" }),
  },
  {
    key: "medical-qms",
    name: localized({ ja: "医療機器QMS", en: "Medical Device QMS", zh: "医疗器械 QMS" }),
  },
  {
    key: "startup-gov",
    name: localized({ ja: "創業・ガバナンス", en: "Startup & Governance", zh: "创业与治理" }),
  },
  {
    key: "education",
    name: localized({ ja: "教材・トレーニング", en: "Training & Materials", zh: "教材与培训" }),
  },
  {
    key: "certification",
    name: localized({ ja: "資格・認定", en: "Certification", zh: "资格与认证" }),
  },
] as const;

export type GovernanceExpertDomainKey = (typeof GOVERNANCE_EXPERT_DOMAINS)[number]["key"];

export type GovernanceCommitteeDefinition = {
  id: string;
  jurisdictionCode: GovernanceJurisdictionCode;
  expertDomainKey: GovernanceExpertDomainKey;
  name: LocalizedStrings;
  domain: LocalizedStrings;
};

export function buildGovernanceCommitteeSlug(
  jurisdictionCode: string,
  expertDomainKey: string
): string {
  return `${jurisdictionCode.toLowerCase()}-${expertDomainKey}`;
}

export function buildGovernanceCommitteeDefinitions(): GovernanceCommitteeDefinition[] {
  const definitions: GovernanceCommitteeDefinition[] = [];

  for (const jurisdiction of GOVERNANCE_JURISDICTIONS) {
    for (const domain of GOVERNANCE_EXPERT_DOMAINS) {
      const id = buildGovernanceCommitteeSlug(jurisdiction.code, domain.key);
      definitions.push({
        id,
        jurisdictionCode: jurisdiction.code,
        expertDomainKey: domain.key,
        name: localized({
          ja: `${jurisdiction.name.ja}${domain.name.ja}委員会`,
          en: `${jurisdiction.name.en} ${domain.name.en} Committee`,
          zh: `${jurisdiction.name.zh}${domain.name.zh}委员会`,
        }),
        domain: domain.name,
      });
    }
  }

  return definitions;
}

/** 法域パックごとのデフォルト専門ドメイン */
export const JURISDICTION_DEFAULT_EXPERT_DOMAINS: Record<
  GovernanceJurisdictionCode,
  GovernanceExpertDomainKey[]
> = {
  JP: ["accounting", "legal", "startup-gov"],
  US: ["legal", "startup-gov", "certification"],
  SG: ["legal", "startup-gov"],
  HK: ["legal", "startup-gov"],
  EE: ["legal", "startup-gov", "certification"],
  EU: ["legal", "accounting", "certification"],
  CN: ["legal", "accounting"],
};

/** ビジネスモジュール slug → 専門ドメイン（法域は module.jurisdictionCode で解決） */
export const MODULE_EXPERT_DOMAIN_MAP: Partial<
  Record<string, GovernanceExpertDomainKey[]>
> = {
  clinic: ["medical-qms"],
  education: ["education"],
  venture_capital: ["startup-gov"],
  saas_subscription: ["startup-gov"],
  membership: ["startup-gov"],
  professional_services: ["legal"],
  restaurant: ["startup-gov"],
  hospitality: ["startup-gov"],
  ecommerce: ["startup-gov"],
  retail_store: ["startup-gov"],
  logistics: ["startup-gov"],
  staffing: ["startup-gov"],
  construction: ["startup-gov"],
  rental: ["startup-gov"],
  event_space: ["startup-gov"],
  event_operations: ["startup-gov"],
  real_estate_brokerage: ["startup-gov"],
  property_management: ["startup-gov"],
  travel_booking: ["startup-gov"],
  software_outsourcing: ["startup-gov"],
};

const DEFAULT_MODULE_JURISDICTION: GovernanceJurisdictionCode = "JP";

export function parseJurisdictionCodeFromModuleSlug(slug: string): GovernanceJurisdictionCode | null {
  const match = slug.match(/^jurisdiction-([a-z]{2})$/i);
  if (!match) return null;
  const code = match[1].toUpperCase() as GovernanceJurisdictionCode;
  return GOVERNANCE_JURISDICTIONS.some((j) => j.code === code) ? code : null;
}

export function resolveModuleJurisdictionCode(module: {
  slug: string;
  jurisdictionCode?: string | null;
}): GovernanceJurisdictionCode {
  const fromField = module.jurisdictionCode?.toUpperCase() as GovernanceJurisdictionCode | undefined;
  if (fromField && GOVERNANCE_JURISDICTIONS.some((j) => j.code === fromField)) {
    return fromField;
  }
  const fromSlug = parseJurisdictionCodeFromModuleSlug(module.slug);
  if (fromSlug) return fromSlug;
  return DEFAULT_MODULE_JURISDICTION;
}

export function resolveDomainCommitteeSlugsForModule(module: {
  slug: string;
  jurisdictionCode?: string | null;
}): string[] {
  const jurisdiction = resolveModuleJurisdictionCode(module);
  const parsedFromSlug = parseJurisdictionCodeFromModuleSlug(module.slug);

  if (parsedFromSlug) {
    const domains = JURISDICTION_DEFAULT_EXPERT_DOMAINS[jurisdiction] ?? [];
    return domains.map((domain) => buildGovernanceCommitteeSlug(jurisdiction, domain));
  }

  const expertDomains =
    MODULE_EXPERT_DOMAIN_MAP[module.slug] ??
    JURISDICTION_DEFAULT_EXPERT_DOMAINS[jurisdiction]?.slice(0, 1) ??
    [];

  return expertDomains.map((domain) => buildGovernanceCommitteeSlug(jurisdiction, domain));
}

export function getGovernanceJurisdictionLabel(code: string, locale: Locale): string {
  const def = GOVERNANCE_JURISDICTIONS.find((j) => j.code === code);
  if (!def) return code;
  return getLocalized(def.name, locale);
}

export function getGovernanceExpertDomainLabel(key: string, locale: Locale): string {
  const def = GOVERNANCE_EXPERT_DOMAINS.find((d) => d.key === key);
  if (!def) return key;
  return getLocalized(def.name, locale);
}

export function findGovernanceCommitteeDefinition(slug: string): GovernanceCommitteeDefinition | undefined {
  return buildGovernanceCommitteeDefinitions().find((def) => def.id === slug);
}

/** Display tree: jurisdiction → expert domains. Extend GOVERNANCE_JURISDICTIONS / GOVERNANCE_EXPERT_DOMAINS. */
export type DomainGovernanceTreeNode = {
  jurisdiction: (typeof GOVERNANCE_JURISDICTIONS)[number];
  domains: Array<{
    domain: (typeof GOVERNANCE_EXPERT_DOMAINS)[number];
    slug: string;
  }>;
};

/**
 * Domains shown under each jurisdiction in the UI tree.
 * Override per country via JURISDICTION_DEFAULT_EXPERT_DOMAINS; add countries in GOVERNANCE_JURISDICTIONS.
 */
export function getTreeExpertDomainKeysForJurisdiction(
  code: GovernanceJurisdictionCode
): GovernanceExpertDomainKey[] {
  const configured = JURISDICTION_DEFAULT_EXPERT_DOMAINS[code];
  if (configured?.length) return [...configured];
  return GOVERNANCE_EXPERT_DOMAINS.map((domain) => domain.key);
}

/** Config-driven hierarchy for UI — add countries/domains in constants above. */
export function buildDomainGovernanceTree(): DomainGovernanceTreeNode[] {
  return GOVERNANCE_JURISDICTIONS.map((jurisdiction) => {
    const domainKeys = getTreeExpertDomainKeysForJurisdiction(jurisdiction.code);
    const domains = domainKeys
      .map((key) => GOVERNANCE_EXPERT_DOMAINS.find((domain) => domain.key === key))
      .filter((domain): domain is (typeof GOVERNANCE_EXPERT_DOMAINS)[number] => !!domain)
      .map((domain) => ({
        domain,
        slug: buildGovernanceCommitteeSlug(jurisdiction.code, domain.key),
      }));

    return { jurisdiction, domains };
  });
}
