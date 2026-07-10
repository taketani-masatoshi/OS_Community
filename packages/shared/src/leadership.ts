import { localized, type LocalizedStrings } from "./i18n/localized";
import {
  FOUNDER_NAME,
  FOUNDER_PROFILE_SLUG,
  FOUNDER_LINKEDIN_URL,
  LEADERSHIP_MEMBER_KAORU,
  LEADERSHIP_MEMBER_LISA,
} from "./founder";

export type LeadershipCategoryId =
  | "founder"
  | "board"
  | "leadership"
  | "fellows"
  | "standard-committee"
  | "module-leads";

export type LeadershipMember = {
  id: string;
  category: LeadershipCategoryId;
  name: string;
  role: LocalizedStrings;
  organization: LocalizedStrings;
  profileSlug?: string;
  linkedinUrl?: string;
  bio: LocalizedStrings;
};

/** Linux Foundation /about/leadership に倣ったカテゴリ順 */
export const LEADERSHIP_CATEGORY_ORDER: LeadershipCategoryId[] = [
  "founder",
  "board",
  "leadership",
  "fellows",
  "standard-committee",
  "module-leads",
];

export const LEADERSHIP_MEMBERS: LeadershipMember[] = [
  {
    id: "founder-taketani",
    category: "founder",
    name: FOUNDER_NAME,
    role: localized({
      en: "Founder",
      ja: "創設者",
      pt: "Fundador",
      es: "Fundador",
      et: "Asutaja",
      fr: "Fondateur",
      zh: "创始人",
      de: "Gründer",
      ru: "Основатель",
    }),
    organization: localized({
      en: "OpenOrgOS Community",
      ja: "OpenOrgOS Community",
      pt: "OpenOrgOS Community",
      es: "OpenOrgOS Community",
      et: "OpenOrgOS Community",
      fr: "OpenOrgOS Community",
      zh: "OpenOrgOS Community",
      de: "OpenOrgOS Community",
      ru: "OpenOrgOS Community",
    }),
    profileSlug: FOUNDER_PROFILE_SLUG,
    linkedinUrl: FOUNDER_LINKEDIN_URL,
    bio: localized({
      en: "Founder of OpenOrgOS Community. Leads the open-source ecosystem for the global inter-organizational protocol and OrgOS governance model.",
      ja: "OpenOrgOS Community 創設者。組織間通信のグローバルプロトコルと OrgOS ガバナンスモデルを牽引するオープンソースエコシステムを率います。",
      pt: "Fundador da OpenOrgOS Community. Lidera o ecossistema open source do protocolo interorganizacional global.",
      es: "Fundador de OpenOrgOS Community. Lidera el ecosistema open source del protocolo interorganizacional global.",
      et: "OpenOrgOS Community asutaja.",
      fr: "Fondateur d'OpenOrgOS Community.",
      zh: "OpenOrgOS Community 创始人。",
      de: "Gründer der OpenOrgOS Community.",
      ru: "Основатель OpenOrgOS Community.",
    }),
  },
  {
    id: "member-kaoru",
    category: "leadership",
    name: LEADERSHIP_MEMBER_KAORU.name,
    role: localized({
      en: "Member",
      ja: "メンバー",
      pt: "Membro",
      es: "Miembro",
      et: "Liige",
      fr: "Membre",
      zh: "成员",
      de: "Mitglied",
      ru: "Участник",
    }),
    organization: localized({
      en: "OpenOrgOS Community",
      ja: "OpenOrgOS Community",
      pt: "OpenOrgOS Community",
      es: "OpenOrgOS Community",
      et: "OpenOrgOS Community",
      fr: "OpenOrgOS Community",
      zh: "OpenOrgOS Community",
      de: "OpenOrgOS Community",
      ru: "OpenOrgOS Community",
    }),
    profileSlug: LEADERSHIP_MEMBER_KAORU.profileSlug,
    bio: localized({
      en: "Community member supporting OpenOrgOS governance and outreach.",
      ja: "OpenOrgOS のガバナンスとコミュニティ活動を支援するメンバー。",
      pt: "Membro da comunidade OpenOrgOS.",
      es: "Miembro de la comunidad OpenOrgOS.",
      et: "OpenOrgOS kogukonna liige.",
      fr: "Membre de la communauté OpenOrgOS.",
      zh: "OpenOrgOS 社区成员。",
      de: "Mitglied der OpenOrgOS Community.",
      ru: "Участник сообщества OpenOrgOS.",
    }),
  },
  {
    id: "member-lisa",
    category: "leadership",
    name: LEADERSHIP_MEMBER_LISA.name,
    role: localized({
      en: "Member",
      ja: "メンバー",
      pt: "Membro",
      es: "Miembro",
      et: "Liige",
      fr: "Membre",
      zh: "成员",
      de: "Mitglied",
      ru: "Участник",
    }),
    organization: localized({
      en: "OpenOrgOS Community",
      ja: "OpenOrgOS Community",
      pt: "OpenOrgOS Community",
      es: "OpenOrgOS Community",
      et: "OpenOrgOS Community",
      fr: "OpenOrgOS Community",
      zh: "OpenOrgOS Community",
      de: "OpenOrgOS Community",
      ru: "OpenOrgOS Community",
    }),
    profileSlug: LEADERSHIP_MEMBER_LISA.profileSlug,
    bio: localized({
      en: "Community member supporting OpenOrgOS governance and outreach.",
      ja: "OpenOrgOS のガバナンスとコミュニティ活動を支援するメンバー。",
      pt: "Membro da comunidade OpenOrgOS.",
      es: "Miembro de la comunidad OpenOrgOS.",
      et: "OpenOrgOS kogukonna liige.",
      fr: "Membre de la communauté OpenOrgOS.",
      zh: "OpenOrgOS 社区成员。",
      de: "Mitglied der OpenOrgOS Community.",
      ru: "Участник сообщества OpenOrgOS.",
    }),
  },
];
