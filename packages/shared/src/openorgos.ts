import { localized } from "./i18n/localized";
import { buildGovernanceCommitteeDefinitions } from "./governance-matrix";

/** OpenOrgOS Community — 設計思想・サイト定数 */

export const BRAND = {
  name: "OpenOrgOS",
  community: "OpenOrgOS Community",
  tagline: "The open-source community for a global inter-organizational protocol",
  taglineJa: "組織間通信のグローバルプロトコルを育てるオープンソースコミュニティ",
  mission:
    "OpenOrgOS は、組織間通信のグローバルプロトコルを育てるオープンソースコミュニティです。組織内部の運営管理 OS ではありません。Org Event Model、identity exchange、authority delegation、auditability を定義します。ビジネスロジック・法解釈・組織行動はすべて、各国・各ドメインの委員会に委ねられます。",
} as const;

/** What the global OpenOrgOS protocol defines (not business logic or local law). */
export const PROTOCOL_DEFINITIONS = [
  { id: "org-event-model", labelEn: "Org Event Model" },
  { id: "identity-exchange", labelEn: "Identity Exchange" },
  { id: "authority-delegation", labelEn: "Authority Delegation" },
  { id: "auditability", labelEn: "Auditability" },
] as const;

export const PROTOCOL_COMMITTEE_DELEGATION =
  "All business logic, legal interpretation, and organizational behavior are delegated to national or domain-specific committees.";

export const COMMUNITY_PURPOSES = [
  {
    id: "rules",
    title: "人が可読なプロトコル",
    titleEn: "Human-Readable Protocol",
    body: "MD/YAML で組織間交換ルールを開発・メンテ。AI 処理と人間のレビューを両立。",
    href: "/modules",
  },
  {
    id: "protocol",
    title: "グローバルプロトコル",
    titleEn: "Global Protocol",
    body: "Org Event Model · identity exchange · authority delegation · auditability。",
    href: "/standards",
  },
  {
    id: "committees",
    title: "委員会への委任",
    titleEn: "Committee Delegation",
    body: "ビジネスロジック・法解釈・組織行動は各国・各ドメインの委員会が担う。",
    href: "/committees",
  },
  {
    id: "open",
    title: "オープンコミュニティ",
    titleEn: "Open Community",
    body: "すべての利用者の力・意見を取り入れ、プロトコルとモジュールを公開的に育てる。",
    href: "/governance",
  },
] as const;

export const CORE_PRINCIPLES = [
  {
    id: "open",
    title: "Open",
    titleJa: "Open（オープン）",
    body: "利用するすべての人々の力・意見を取り入れる。",
  },
  {
    id: "human-readable",
    title: "Human-Readable",
    titleJa: "人が可読",
    body: "人が MD/YAML ルールをメンテ。AI が処理し、人間のレビューが信頼を生む。",
  },
  {
    id: "controlled-integration",
    title: "Controlled Integration",
    titleJa: "統制された統合",
    body: "標準への採用は厳格なレビューを経る。",
  },
  {
    id: "trust-first",
    title: "Trust First",
    titleJa: "信頼を最優先",
    body: "組織運営に安心して使える、信頼されたルールとモジュール。",
  },
] as const;

export const MODULE_LIFECYCLE = [
  {
    stage: "PROPOSAL",
    label: "Proposal",
    name: localized({
      en: "Proposal",
      ja: "提案",
      pt: "Proposta",
      es: "Propuesta",
      et: "Ettepanek",
      fr: "Proposition",
      zh: "提案",
      de: "Vorschlag",
      ru: "Предложение",
    }),
    desc: localized({
      en: "Anyone can propose",
      ja: "誰でも提案可能",
      pt: "Qualquer pessoa pode propor",
      es: "Cualquiera puede proponer",
      et: "Igaüks saab ettepaneku teha",
      fr: "Tout le monde peut proposer",
      zh: "任何人都可以提案",
      de: "Jeder kann vorschlagen",
      ru: "Любой может предложить",
    }),
  },
  {
    stage: "COMMUNITY",
    label: "Community Module",
    name: localized({
      en: "Community",
      ja: "コミュニティ",
      pt: "Comunidade",
      es: "Comunidad",
      et: "Kogukond",
      fr: "Communauté",
      zh: "社区",
      de: "Community",
      ru: "Сообщество",
    }),
    desc: localized({
      en: "Published · discussion begins",
      ja: "公開・議論開始",
      pt: "Publicado · discussão iniciada",
      es: "Publicado · comienza la discusión",
      et: "Avaldatud · arutelu algab",
      fr: "Publié · discussion lancée",
      zh: "公开并开始讨论",
      de: "Veröffentlicht · Diskussion beginnt",
      ru: "Опубликовано · начало обсуждения",
    }),
  },
  {
    stage: "REVIEWED",
    label: "Reviewed Module",
    name: localized({
      en: "Reviewed",
      ja: "レビュー済",
      pt: "Revisado",
      es: "Revisado",
      et: "Läbi vaadatud",
      fr: "Revu",
      zh: "已审查",
      de: "Geprüft",
      ru: "Проверено",
    }),
    desc: localized({
      en: "Quality review passed",
      ja: "品質レビュー通過",
      pt: "Revisão de qualidade aprovada",
      es: "Revisión de calidad aprobada",
      et: "Kvaliteediläbivaatus läbitud",
      fr: "Revue qualité validée",
      zh: "通过质量审查",
      de: "Qualitätsprüfung bestanden",
      ru: "Проверка качества пройдена",
    }),
  },
  {
    stage: "REFERENCE",
    label: "Reference Module",
    name: localized({
      en: "Reference",
      ja: "参照実装",
      pt: "Referência",
      es: "Referencia",
      et: "Viide",
      fr: "Référence",
      zh: "参考实现",
      de: "Referenz",
      ru: "Эталон",
    }),
    desc: localized({
      en: "Recommended reference implementation",
      ja: "参照実装として推奨",
      pt: "Implementação de referência recomendada",
      es: "Implementación de referencia recomendada",
      et: "Soovitatud võrdlusimplementatsioon",
      fr: "Implémentation de référence recommandée",
      zh: "推荐为参考实现",
      de: "Empfohlene Referenzimplementierung",
      ru: "Рекомендуемая эталонная реализация",
    }),
  },
  {
    stage: "OFFICIAL",
    label: "Official Module",
    name: localized({
      en: "Official",
      ja: "公式",
      pt: "Oficial",
      es: "Oficial",
      et: "Ametlik",
      fr: "Officiel",
      zh: "官方",
      de: "Offiziell",
      ru: "Официальный",
    }),
    desc: localized({
      en: "Adopted into OpenOrgOS Standard",
      ja: "OpenOrgOS Standard 採用",
      pt: "Adotado no OpenOrgOS Standard",
      es: "Adoptado en OpenOrgOS Standard",
      et: "OpenOrgOS Standardi kasutusele võetud",
      fr: "Adopté dans OpenOrgOS Standard",
      zh: "纳入 OpenOrgOS Standard",
      de: "In OpenOrgOS Standard übernommen",
      ru: "Принят в OpenOrgOS Standard",
    }),
  },
  {
    stage: "LTS",
    label: "LTS Module",
    name: localized({
      en: "LTS",
      ja: "LTS",
      pt: "LTS",
      es: "LTS",
      et: "LTS",
      fr: "LTS",
      zh: "LTS",
      de: "LTS",
      ru: "LTS",
    }),
    desc: localized({
      en: "Long-term support guarantee",
      ja: "長期サポート保証",
      pt: "Garantia de suporte de longo prazo",
      es: "Garantía de soporte a largo plazo",
      et: "Pikaajalise toe garantii",
      fr: "Garantie de support à long terme",
      zh: "长期支持保障",
      de: "Langfristige Support-Garantie",
      ru: "Гарантия долгосрочной поддержки",
    }),
  },
] as const;

export type LifecycleStage = (typeof MODULE_LIFECYCLE)[number]["stage"];

/** readiness tier → lifecycle stage の暫定マッピング */
export const READINESS_TO_LIFECYCLE: Record<string, LifecycleStage> = {
  skeleton: "COMMUNITY",
  activation_ready: "REVIEWED",
  production_ready: "REFERENCE",
  unsupported: "PROPOSAL",
};

export const COMMUNITY_ROLES = [
  { id: "USER", title: "User", titleJa: "利用者", desc: "OpenOrgOS を導入・利用する。" },
  {
    id: "CONTRIBUTOR",
    title: "Contributor",
    titleJa: "コントリビューター",
    desc: "ルール、コード、ドキュメント、翻訳等 — 専門分野・地域を問わず広く歓迎。",
  },
  { id: "REVIEWER", title: "Reviewer", titleJa: "レビュアー", desc: "品質レビューを担当。広く参加可能。" },
  { id: "MAINTAINER", title: "Maintainer", titleJa: "メンテナ", desc: "特定モジュールの保守責任者。" },
  {
    id: "COMMITTEE",
    title: "Committee Member",
    titleJa: "委員会メンバー",
    desc: "標準仕様の策定・承認。自領域の委員会が基本。他地域・他法域の委員会はブリッジ専門性と審査を要する。",
  },
  { id: "FELLOW", title: "Foundation Fellow", titleJa: "フェロー", desc: "長期的にコミュニティへ貢献した人物。" },
] as const;

export const PROMOTION_FLOW = [
  { from: "Contributor", to: "Reviewer", criteria: "継続的なレビュー貢献・品質判定の実績" },
  { from: "Reviewer", to: "Maintainer", criteria: "特定モジュール領域の専門性・保守コミットメント" },
  {
    from: "Maintainer",
    to: "Committee Member",
    criteria: "標準策定への貢献・委員会推薦・ガバナンス審査（他地域委員会は専門分野の一致・ブリッジ専門性を確認）",
  },
  { from: "Committee Member", to: "Foundation Fellow", criteria: "長期貢献・コミュニティ全体への影響" },
] as const;

export const COMMITTEES = buildGovernanceCommitteeDefinitions().map((def) => ({
  id: def.id,
  name: def.name,
  domain: def.domain,
  jurisdictionCode: def.jurisdictionCode,
  expertDomainKey: def.expertDomainKey,
}));

export const COMMUNITY_VALUES = [
  { label: "人が可読", labelEn: "Human-Readable" },
  { label: "オープン", labelEn: "Open" },
  { label: "監査可能性", labelEn: "Auditability" },
  { label: "信頼", labelEn: "Trust" },
] as const;

export const CERTIFICATION_LABELS: Record<string, string> = {
  STEWARD_OPERATOR: "OpenOrgOS Operator (OOO)",
  STEWARD_DESIGNER: "OpenOrgOS Designer (OOD)",
};

export const MODULE_ROLE_LABELS: Record<string, string> = {
  MAINTAINER: "Maintainer",
  DEPUTY: "Co-maintainer",
  CONTRIBUTOR: "Contributor",
};

export const MODULE_TYPE_LABELS: Record<string, string> = {
  BUSINESS: "Business Module",
  JURISDICTION: "Organization Pack",
  WILD: "Community / Unreviewed",
};

export type AgentDomain = "governance" | "finance" | "operations";

export type AgentInfo = {
  id: string;
  domain: AgentDomain;
  githubRepo?: string;
  manifestPath?: string;
};

export const DEFAULT_STEWARD_AGENT_REPO = "https://github.com/steward-os/steward";

export const CORE_AGENTS: AgentInfo[] = [
  {
    id: "executive",
    domain: "governance",
    githubRepo: DEFAULT_STEWARD_AGENT_REPO,
    manifestPath: "steward/agents/executive/agent.manifest.yaml",
  },
  {
    id: "secretary",
    domain: "governance",
    githubRepo: DEFAULT_STEWARD_AGENT_REPO,
    manifestPath: "steward/agents/secretary/agent.manifest.yaml",
  },
  {
    id: "finance",
    domain: "finance",
    githubRepo: DEFAULT_STEWARD_AGENT_REPO,
    manifestPath: "steward/agents/finance/agent.manifest.yaml",
  },
  {
    id: "contract",
    domain: "finance",
    githubRepo: DEFAULT_STEWARD_AGENT_REPO,
    manifestPath: "steward/agents/contract/agent.manifest.yaml",
  },
  {
    id: "compliance",
    domain: "finance",
    githubRepo: DEFAULT_STEWARD_AGENT_REPO,
    manifestPath: "steward/agents/compliance/agent.manifest.yaml",
  },
  {
    id: "operations",
    domain: "operations",
    githubRepo: DEFAULT_STEWARD_AGENT_REPO,
    manifestPath: "steward/agents/operations/agent.manifest.yaml",
  },
];
