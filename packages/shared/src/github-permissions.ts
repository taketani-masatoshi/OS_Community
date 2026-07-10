import type { Locale } from "./i18n/locales";
import type { LocalizedStrings } from "./i18n/locales";
import { resolveMessagesLocale } from "./i18n/locales";
import { localized } from "./i18n/localized";

export type ModuleRoleType = "MAINTAINER" | "DEPUTY" | "CONTRIBUTOR";
export type CommitteeType = "STANDARD" | "MODULE";
export type CommitteeMemberRole = "CHAIR" | "MEMBER" | "REVIEWER";

export type GitHubPermissionLevel = "read" | "triage" | "write" | "maintain" | "admin";

export type EffectiveGitHubPermission = {
  scope: "repo" | "org";
  target: string;
  level: GitHubPermissionLevel;
  sourceKey: string;
  actions: string[];
};

const LEVEL_LABELS: Record<GitHubPermissionLevel, LocalizedStrings> = {
  read: localized({
    en: "Read",
    ja: "読取",
    pt: "Leitura",
    es: "Lectura",
    et: "Lugemine",
    fr: "Lecture",
    zh: "读取",
    de: "Lesen",
    ru: "Чтение",
  }),
  triage: localized({
    en: "Triage",
    ja: "トリアージ",
    pt: "Triagem",
    es: "Clasificación",
    et: "Sorteerimine",
    fr: "Triage",
    zh: "分诊",
    de: "Triage",
    ru: "Сортировка",
  }),
  write: localized({
    en: "Write",
    ja: "書込",
    pt: "Escrita",
    es: "Escritura",
    et: "Kirjutamine",
    fr: "Écriture",
    zh: "写入",
    de: "Schreiben",
    ru: "Запись",
  }),
  maintain: localized({
    en: "Maintain",
    ja: "保守",
    pt: "Manutenção",
    es: "Mantenimiento",
    et: "Hooldus",
    fr: "Maintenance",
    zh: "维护",
    de: "Wartung",
    ru: "Обслуживание",
  }),
  admin: localized({
    en: "Admin",
    ja: "管理",
    pt: "Administração",
    es: "Administración",
    et: "Administreerimine",
    fr: "Administration",
    zh: "管理",
    de: "Administration",
    ru: "Администрирование",
  }),
};

export function getGitHubLevelLabel(level: GitHubPermissionLevel, locale: Locale) {
  return LEVEL_LABELS[level][resolveMessagesLocale(locale)];
}

type LocalizedStringList = Record<Locale, string[]>;

/** モジュール役割 → GitHub リポジトリ権限 */
export const MODULE_ROLE_GITHUB: Record<
  ModuleRoleType,
  { level: GitHubPermissionLevel; actions: LocalizedStringList }
> = {
  CONTRIBUTOR: {
    level: "read",
    actions: {
      ja: ["リポジトリの閲覧", "Public clone"],
      en: ["View repository", "Public clone"],
      pt: ["Ver repositório", "Clone público"],
      es: ["Ver repositorio", "Clon público"],
      et: ["Repoziitoriumi vaatamine", "Avalik clone"],
      fr: ["Voir le dépôt", "Clone public"],
      zh: ["查看仓库", "公开克隆"],
      de: ["Repository ansehen", "Public Clone"],
      ru: ["Просмотр репозитория", "Public clone"],
    },
  },
  DEPUTY: {
    level: "maintain",
    actions: {
      ja: ["PR レビュー", "develop への merge"],
      en: ["Review PRs", "Merge to develop"],
      pt: ["Revisar PRs", "Merge para develop"],
      es: ["Revisar PRs", "Merge a develop"],
      et: ["PR-de läbivaatamine", "Merge develop'i"],
      fr: ["Revoir les PR", "Fusionner vers develop"],
      zh: ["审查 PR", "合并到 develop"],
      de: ["PRs prüfen", "In develop mergen"],
      ru: ["Ревью PR", "Merge в develop"],
    },
  },
  MAINTAINER: {
    level: "maintain",
    actions: {
      ja: ["main への merge", "リリース tag 作成"],
      en: ["Merge to main", "Create release tags"],
      pt: ["Merge para main", "Criar tags de release"],
      es: ["Merge a main", "Crear tags de release"],
      et: ["Merge main'i", "Release-siltide loomine"],
      fr: ["Fusionner vers main", "Créer des tags de release"],
      zh: ["合并到 main", "创建 release tag"],
      de: ["In main mergen", "Release-Tags erstellen"],
      ru: ["Merge в main", "Создание release-тегов"],
    },
  },
};

/** 委員会役割 → GitHub 権限（モジュール委員会 = 当該 repo） */
export const MODULE_COMMITTEE_GITHUB: Record<
  CommitteeMemberRole,
  { level: GitHubPermissionLevel; actions: LocalizedStringList }
> = {
  MEMBER: {
    level: "triage",
    actions: {
      ja: ["ライフサイクル昇格の提案", "Issue/PR ラベル管理"],
      en: ["Propose lifecycle promotion", "Manage issue/PR labels"],
      pt: ["Propor promoção do ciclo de vida", "Gerenciar labels de issue/PR"],
      es: ["Proponer promoción del ciclo de vida", "Gestionar etiquetas de issue/PR"],
      et: ["Elutsükli edendamise ettepanek", "Issue/PR siltide haldamine"],
      fr: ["Proposer une promotion du cycle de vie", "Gérer les labels issue/PR"],
      zh: ["提议生命周期晋升", "管理 Issue/PR 标签"],
      de: ["Lebenszyklus-Beförderung vorschlagen", "Issue/PR-Labels verwalten"],
      ru: ["Предложить продвижение жизненного цикла", "Управление метками issue/PR"],
    },
  },
  REVIEWER: {
    level: "write",
    actions: {
      ja: ["品質レビュー署名", "昇格 PR の承認"],
      en: ["Sign quality reviews", "Approve promotion PRs"],
      pt: ["Assinar revisões de qualidade", "Aprovar PRs de promoção"],
      es: ["Firmar revisiones de calidad", "Aprobar PRs de promoción"],
      et: ["Kvaliteediläbivaatuste allkirjastamine", "Edendamise PR-de heakskiitmine"],
      fr: ["Signer les revues qualité", "Approuver les PR de promotion"],
      zh: ["签署质量审查", "批准晋升 PR"],
      de: ["Qualitätsprüfungen signieren", "Beförderungs-PRs genehmigen"],
      ru: ["Подписание проверок качества", "Одобрение PR на продвижение"],
    },
  },
  CHAIR: {
    level: "admin",
    actions: {
      ja: ["委員会 merge 承認", "メンバー任命"],
      en: ["Committee merge approval", "Appoint members"],
      pt: ["Aprovação de merge do comitê", "Nomear membros"],
      es: ["Aprobación de merge del comité", "Nombrar miembros"],
      et: ["Komitee merge'i heakskiit", "Liikmete määramine"],
      fr: ["Approbation merge du comité", "Nommer des membres"],
      zh: ["委员会 merge 审批", "任命成员"],
      de: ["Merge-Freigabe des Ausschusses", "Mitglieder ernennen"],
      ru: ["Одобрение merge комитетом", "Назначение членов"],
    },
  },
};

/** 全体標準委員会 → GitHub Org 権限 */
export const STANDARD_COMMITTEE_GITHUB: Record<
  CommitteeMemberRole,
  { level: GitHubPermissionLevel; actions: LocalizedStringList }
> = {
  MEMBER: {
    level: "read",
    actions: {
      ja: ["Standard 草案へのコメント"],
      en: ["Comment on Standard drafts"],
      pt: ["Comentar rascunhos do Standard"],
      es: ["Comentar borradores del Standard"],
      et: ["Kommenteerida Standardi mustandeid"],
      fr: ["Commenter les brouillons Standard"],
      zh: ["对 Standard 草案评论"],
      de: ["Standard-Entwürfe kommentieren"],
      ru: ["Комментирование черновиков Standard"],
    },
  },
  REVIEWER: {
    level: "write",
    actions: {
      ja: ["Standard レビュー", "横断モジュール昇格の審査"],
      en: ["Review Standard changes", "Cross-module promotion review"],
      pt: ["Revisar alterações do Standard", "Revisão de promoção entre módulos"],
      es: ["Revisar cambios del Standard", "Revisión de promoción entre módulos"],
      et: ["Standardi muudatuste läbivaatamine", "Moodulitevaheline edendamise läbivaatus"],
      fr: ["Revoir les changements Standard", "Revue de promotion inter-modules"],
      zh: ["审查 Standard 变更", "跨模块晋升审查"],
      de: ["Standard-Änderungen prüfen", "Modulübergreifende Beförderungsprüfung"],
      ru: ["Ревью изменений Standard", "Межмодульная проверка продвижения"],
    },
  },
  CHAIR: {
    level: "admin",
    actions: {
      ja: ["Standard 採用投票", "全モジュール横断の最終承認"],
      en: ["Standard adoption vote", "Cross-module final approval"],
      pt: ["Voto de adoção do Standard", "Aprovação final entre módulos"],
      es: ["Voto de adopción del Standard", "Aprobación final entre módulos"],
      et: ["Standardi kasutuselevõtu hääletus", "Lõplik heakskiit kõigi moodulite ulatuses"],
      fr: ["Vote d'adoption du Standard", "Approbation finale inter-modules"],
      zh: ["Standard 采纳投票", "跨模块最终批准"],
      de: ["Standard-Adoptionsabstimmung", "Modulübergreifende Endfreigabe"],
      ru: ["Голосование за принятие Standard", "Межмодульное финальное одобрение"],
    },
  },
};

export type PermissionInput = {
  locale: Locale;
  moduleRoles: {
    moduleSlug: string;
    moduleName: string;
    role: ModuleRoleType;
    githubRepo: string | null;
  }[];
  committeeMemberships: {
    committeeType: CommitteeType;
    committeeSlug: string;
    committeeName: string;
    role: CommitteeMemberRole;
    moduleSlug: string | null;
    githubRepo: string | null;
  }[];
  agentMemberships?: {
    agentSlug: string;
    githubRepo: string | null;
  }[];
  githubOrg?: string;
};

export function buildEffectiveGitHubPermissions(input: PermissionInput): EffectiveGitHubPermission[] {
  const uiLocale = resolveMessagesLocale(input.locale);
  const permissions: EffectiveGitHubPermission[] = [];
  const org = input.githubOrg ?? "steward-os";

  for (const mr of input.moduleRoles) {
    if (!mr.githubRepo) continue;
    const def = MODULE_ROLE_GITHUB[mr.role];
    permissions.push({
      scope: "repo",
      target: mr.githubRepo,
      level: def.level,
      sourceKey: `module-role:${mr.moduleSlug}:${mr.role}`,
      actions: def.actions[uiLocale],
    });
  }

  for (const cm of input.committeeMemberships) {
    if (cm.committeeType === "STANDARD") {
      const def = STANDARD_COMMITTEE_GITHUB[cm.role];
      permissions.push({
        scope: "org",
        target: org,
        level: def.level,
        sourceKey: `standard-committee:${cm.role}`,
        actions: def.actions[uiLocale],
      });
    } else if (cm.githubRepo) {
      const def = MODULE_COMMITTEE_GITHUB[cm.role];
      permissions.push({
        scope: "repo",
        target: cm.githubRepo,
        level: def.level,
        sourceKey: `module-committee:${cm.moduleSlug ?? cm.committeeSlug}:${cm.role}`,
        actions: def.actions[uiLocale],
      });
    }
  }

  for (const am of input.agentMemberships ?? []) {
    if (!am.githubRepo) continue;
    permissions.push({
      scope: "repo",
      target: am.githubRepo,
      level: "read",
      sourceKey: `agent-member:${am.agentSlug}`,
      actions: MODULE_ROLE_GITHUB.CONTRIBUTOR.actions[uiLocale],
    });
  }

  return permissions;
}

export function mergePermissionLevel(a: GitHubPermissionLevel, b: GitHubPermissionLevel): GitHubPermissionLevel {
  const order: GitHubPermissionLevel[] = ["read", "triage", "write", "maintain", "admin"];
  return order[Math.max(order.indexOf(a), order.indexOf(b))] ?? a;
}
