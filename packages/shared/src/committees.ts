import type { Locale } from "./i18n/locales";
import type { LocalizedStrings } from "./i18n/locales";
import { resolveMessagesLocale } from "./i18n/locales";
import { localized } from "./i18n/localized";

/** 全モジュールを管轄する全体標準委員会 */
export const STANDARD_COMMITTEE_SLUG = "openorgos-standard";

export const COMMITTEE_TYPE_LABELS: Record<
  "STANDARD" | "DOMAIN" | "MODULE",
  LocalizedStrings
> = {
  STANDARD: localized({
    en: "Standard Committee",
    ja: "全体標準委員会",
    pt: "Comitê de Padrões",
    es: "Comité de Estándares",
    et: "Standardikomitee",
    fr: "Comité des normes",
    zh: "整体标准委员会",
    de: "Standardausschuss",
    ru: "Комитет по стандартам",
  }),
  DOMAIN: localized({
    en: "Domain Committee",
    ja: "ドメイン委員会",
    pt: "Comitê de Domínio",
    es: "Comité de Dominio",
    et: "Domeenikomitee",
    fr: "Comité de domaine",
    zh: "领域委员会",
    de: "Domänenausschuss",
    ru: "Доменный комитет",
  }),
  MODULE: localized({
    en: "Module Committee",
    ja: "モジュール委員会",
    pt: "Comitê de Módulo",
    es: "Comité de Módulo",
    et: "Moodulikomitee",
    fr: "Comité de module",
    zh: "模块委员会",
    de: "Modulausschuss",
    ru: "Модульный комитет",
  }),
};

export const COMMITTEE_MEMBER_ROLE_LABELS: Record<
  "CHAIR" | "MEMBER" | "REVIEWER" | "OBSERVER",
  LocalizedStrings
> = {
  CHAIR: localized({
    en: "Chair",
    ja: "委員長",
    pt: "Presidente",
    es: "Presidente",
    et: "Esimees",
    fr: "Président",
    zh: "主席",
    de: "Vorsitzender",
    ru: "Председатель",
  }),
  MEMBER: localized({
    en: "Member",
    ja: "委員",
    pt: "Membro",
    es: "Miembro",
    et: "Liige",
    fr: "Membre",
    zh: "委员",
    de: "Mitglied",
    ru: "Член",
  }),
  REVIEWER: localized({
    en: "Reviewer",
    ja: "レビュアー",
    pt: "Revisor",
    es: "Revisor",
    et: "Läbivaataja",
    fr: "Examinateur",
    zh: "审查员",
    de: "Prüfer",
    ru: "Рецензент",
  }),
  OBSERVER: localized({
    en: "Observer",
    ja: "オブザーバー",
    pt: "Observador",
    es: "Observador",
    et: "Vaatleja",
    fr: "Observateur",
    zh: "观察员",
    de: "Beobachter",
    ru: "Наблюдатель",
  }),
};

export function moduleCommitteeSlug(moduleSlug: string) {
  return `module-${moduleSlug}`;
}

const STANDARD_COMMITTEE_NAMES: LocalizedStrings = localized({
  en: "OpenOrgOS Standard Committee",
  ja: "OpenOrgOS 標準委員会",
  pt: "Comitê de Padrões OpenOrgOS",
  es: "Comité de Estándares OpenOrgOS",
  et: "OpenOrgOS standardikomitee",
  fr: "Comité des normes OpenOrgOS",
  zh: "OpenOrgOS 标准委员会",
  de: "OpenOrgOS-Standardausschuss",
  ru: "Комитет стандартов OpenOrgOS",
});

export function getStandardCommitteeName(locale: Locale): string {
  return STANDARD_COMMITTEE_NAMES[resolveMessagesLocale(locale)];
}

const MODULE_COMMITTEE_SUFFIX: LocalizedStrings = localized({
  en: "Committee",
  ja: "委員会",
  pt: "Comitê",
  es: "Comité",
  et: "Komitee",
  fr: "Comité",
  zh: "委员会",
  de: "Ausschuss",
  ru: "Комитет",
});

export function getModuleCommitteeName(moduleName: string, locale: Locale): string {
  return `${moduleName} ${MODULE_COMMITTEE_SUFFIX[resolveMessagesLocale(locale)]}`;
}

export const STANDARD_COMMITTEE_DESCRIPTION: LocalizedStrings = localized({
  en: "Umbrella committee that governs OpenOrgOS Standard adoption and lifecycle promotion across all modules.",
  ja: "各モジュール委員会を統合し、OpenOrgOS Standard への採用・ライフサイクル昇格を全モジュール横断で管轄します。",
  pt: "Comitê guarda-chuva que governa a adoção do OpenOrgOS Standard e a promoção do ciclo de vida em todos os módulos.",
  es: "Comité paraguas que rige la adopción de OpenOrgOS Standard y la promoción del ciclo de vida en todos los módulos.",
  et: "Katuskomitee, mis juhib OpenOrgOS Standardi kasutuselevõttu ja elutsükli edendamist kõigi moodulite ulatuses.",
  fr: "Comité fédérateur qui supervise l'adoption d'OpenOrgOS Standard et la promotion du cycle de vie à travers tous les modules.",
  zh: "统合各模块委员会，横向管辖 OpenOrgOS Standard 的采纳与生命周期晋升。",
  de: "Dachgremium, das die OpenOrgOS Standard-Adoption und Lebenszyklus-Beförderung modulübergreifend steuert.",
  ru: "Надзорный комитет, управляющий принятием OpenOrgOS Standard и продвижением жизненного цикла во всех модулях.",
});

export const MODULE_COMMITTEE_DESCRIPTION: LocalizedStrings = localized({
  en: "Responsible for quality review, lifecycle promotion proposals, and merge approval on the module repository.",
  ja: "当該モジュールの品質レビュー、ライフサイクル昇格提案、GitHub リポジトリの merge 承認を担います。",
  pt: "Responsável pela revisão de qualidade, propostas de promoção do ciclo de vida e aprovação de merge no repositório do módulo.",
  es: "Responsable de la revisión de calidad, propuestas de promoción del ciclo de vida y aprobación de merge en el repositorio del módulo.",
  et: "Vastutab kvaliteediläbivaatuse, elutsükli edendamise ettepanekute ja merge'i heakskiitmise eest mooduli hoidlas.",
  fr: "Responsable de la revue qualité, des propositions de promotion du cycle de vie et de l'approbation des merge sur le dépôt du module.",
  zh: "负责该模块的质量审查、生命周期晋升提案及仓库 merge 审批。",
  de: "Verantwortlich für Qualitätsprüfung, Lebenszyklus-Beförderungsvorschläge und Merge-Freigabe im Modul-Repository.",
  ru: "Отвечает за проверку качества, предложения о продвижении жизненного цикла и одобрение merge в репозитории модуля.",
});

export const DOMAIN_COMMITTEE_DESCRIPTION: LocalizedStrings = localized({
  en: "Domain governance committee overseeing modules in its specialty or jurisdiction. Proposes standards and promotions to the Standard Committee.",
  ja: "専門分野・法域ごとのガバナンス委員会。管轄モジュールを監督し、標準委員会へ昇格を提案します。",
  pt: "Comitê de governança de domínio que supervisiona módulos na sua especialidade ou jurisdição.",
  es: "Comité de gobernanza de dominio que supervisa módulos en su especialidad o jurisdicción.",
  et: "Domeeni juhtimiskomitee, mis järelevalvet teostab oma valdkonna või jurisdiktsiooni moodulite üle.",
  fr: "Comité de gouvernance de domaine supervisant les modules de sa spécialité ou juridiction.",
  zh: "按专业领域或法域管辖模块的治理委员会，向标准委员会提出晋升建议。",
  de: "Domänen-Governance-Gremium für Module in seiner Fachdomäne oder Rechtsordnung.",
  ru: "Доменный комитет управления, курирующий модули в своей области или юрисдiction.",
});
