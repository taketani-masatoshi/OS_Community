import type { Locale } from "./i18n";

export const COMPLIANCE_REGISTRY_CATEGORIES = [
  {
    key: "REGULATED_PROFESSION",
    name: { ja: "国家資格・規制職", en: "Regulated professions", zh: "受监管职业" },
    desc: {
      ja: "弁護士、税理士、公認会計士など、各国で資格が必要な専門職",
      en: "Lawyers, tax accountants, CPAs, and other license-required professions by jurisdiction",
      zh: "律师、税务师、注册会计师等各国需持证的专业",
    },
  },
  {
    key: "ISO_AUDIT_QUALIFICATION",
    name: { ja: "ISO 監査資格", en: "ISO audit qualifications", zh: "ISO 审核资质" },
    desc: {
      ja: "ISO 9001 / 27001 / 13485 等のリード監査員・監査ガイドライン修得",
      en: "Lead auditor and ISO 19011 competence for management system audits",
      zh: "ISO 9001 / 27001 / 13485 等管理体系审核资质",
    },
  },
  {
    key: "COMPLIANCE_SPECIALIST",
    name: { ja: "コンプライアンス専門家", en: "Compliance specialists", zh: "合规专家" },
    desc: {
      ja: "通関士、制裁スクリーニング、反社チェック、利益相反審査など",
      en: "Customs brokers, sanctions screening, anti-social forces checks, COI review",
      zh: "报关员、制裁筛查、反社检查、利益冲突审查等",
    },
  },
] as const;

export type ComplianceRegistryCategoryKey =
  (typeof COMPLIANCE_REGISTRY_CATEGORIES)[number]["key"];

export const COMPLIANCE_CHECKLIST_TYPES = [
  {
    key: "CONFLICT_OF_INTEREST",
    name: { ja: "利益相反", en: "Conflict of interest", zh: "利益冲突" },
    desc: {
      ja: "委員会・取引先・メンバー申請時の利益相反申告と審査",
      en: "COI declarations and review for committees, vendors, and nominees",
      zh: "委员会、供应商、成员申请时的利益冲突申报与审查",
    },
  },
  {
    key: "SANCTIONS_SCREENING",
    name: { ja: "制裁国・制裁リスト", en: "Sanctions screening", zh: "制裁筛查" },
    desc: {
      ja: "OFAC、EU、UN、日本の制裁・輸出管理リストによるスクリーニング",
      en: "Screening against OFAC, EU, UN, and national sanctions programs",
      zh: "OFAC、EU、UN 及各国制裁名单筛查",
    },
  },
  {
    key: "ANTI_SOCIAL_FORCES",
    name: { ja: "反社会的勢力", en: "Anti-social forces", zh: "反社会势力" },
    desc: {
      ja: "日本の反社チェック（覚書、公開記録、代表者確認）",
      en: "Japan anti-social forces (反社) counterparty screening",
      zh: "日本反社会势力（反社）交易方筛查",
    },
  },
  {
    key: "IMPORT_EXPORT_CONTROLS",
    name: { ja: "輸出入管理", en: "Import / export controls", zh: "进出口管制" },
    desc: {
      ja: "通関・外為法・EAR 等の輸出入コンプライアンスチェック",
      en: "Customs, export control, and trade compliance checklists",
      zh: "报关、外汇法、EAR 等贸易合规检查",
    },
  },
] as const;

export type ComplianceChecklistTypeKey = (typeof COMPLIANCE_CHECKLIST_TYPES)[number]["key"];

export function getComplianceCategoryLabel(
  key: ComplianceRegistryCategoryKey,
  locale: Locale,
): string {
  const row = COMPLIANCE_REGISTRY_CATEGORIES.find((c) => c.key === key);
  if (!row) return key;
  return row.name[locale as keyof typeof row.name] ?? row.name.en;
}

export function getComplianceChecklistTypeLabel(
  key: ComplianceChecklistTypeKey,
  locale: Locale,
): string {
  const row = COMPLIANCE_CHECKLIST_TYPES.find((c) => c.key === key);
  if (!row) return key;
  return row.name[locale as keyof typeof row.name] ?? row.name.en;
}

export function localizedComplianceField(
  locale: Locale,
  en: string,
  local?: string | null,
): string {
  if (locale === "ja" && local) return local;
  return en;
}
