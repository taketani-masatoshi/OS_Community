import type { PrismaClient } from "@prisma/client";

type ProfessionSeed = {
  slug: string;
  category: "REGULATED_PROFESSION" | "ISO_AUDIT_QUALIFICATION" | "COMPLIANCE_SPECIALIST";
  jurisdictionCode?: string;
  name: string;
  nameLocal?: string;
  description?: string;
  regulatoryBody?: string;
  relatedExpertDomainKey?: string;
  sortOrder?: number;
  credentials?: Array<{
    slug: string;
    name: string;
    nameLocal?: string;
    issuingBody?: string;
    standardCode?: string;
    description?: string;
    validityYears?: number;
    sortOrder?: number;
  }>;
};

const PROFESSIONS: ProfessionSeed[] = [
  {
    slug: "jp-bengoshi",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "JP",
    name: "Attorney (Bengoshi)",
    nameLocal: "弁護士",
    description: "Licensed to represent clients in court and provide legal advice under the Attorney Act (Japan).",
    regulatoryBody: "Japan Federation of Bar Associations",
    relatedExpertDomainKey: "legal",
    sortOrder: 10,
    credentials: [{ slug: "jp-bengoshi-license", name: "Bengoshi License", nameLocal: "弁護士資格", issuingBody: "Ministry of Justice / JFBA" }],
  },
  {
    slug: "jp-zeirishi",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "JP",
    name: "Tax Accountant (Zeirishi)",
    nameLocal: "税理士",
    description: "Licensed to prepare tax returns, represent clients before tax authorities, and provide tax advisory.",
    regulatoryBody: "Japan Federation of Certified Public Tax Accountants",
    relatedExpertDomainKey: "accounting",
    sortOrder: 20,
    credentials: [{ slug: "jp-zeirishi-license", name: "Zeirishi License", nameLocal: "税理士資格", issuingBody: "National Tax Agency" }],
  },
  {
    slug: "jp-cpa",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "JP",
    name: "Certified Public Accountant (Japan)",
    nameLocal: "公認会計士",
    description: "Licensed for statutory audits, accounting advisory, and corporate financial reporting.",
    regulatoryBody: "Japanese Institute of Certified Public Accountants (JICPA)",
    relatedExpertDomainKey: "accounting",
    sortOrder: 30,
    credentials: [{ slug: "jp-cpa-license", name: "CPA License (Japan)", nameLocal: "公認会計士資格", issuingBody: "JICPA" }],
  },
  {
    slug: "jp-gyoseishoshi",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "JP",
    name: "Administrative Scrivener (Gyōsei Shoshi)",
    nameLocal: "行政書士",
    description: "Licensed to prepare documents submitted to administrative agencies and provide related legal guidance.",
    regulatoryBody: "Japan Federation of Certified Administrative Procedures Legal Specialists",
    relatedExpertDomainKey: "legal",
    sortOrder: 40,
  },
  {
    slug: "jp-shihoshoshi",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "JP",
    name: "Judicial Scrivener (Shihō Shoshi)",
    nameLocal: "司法書士",
    description: "Licensed for real estate registration, corporate registry filings, and court document preparation.",
    regulatoryBody: "Japan Federation of Shiho-shoshi Associations",
    relatedExpertDomainKey: "legal",
    sortOrder: 50,
  },
  {
    slug: "jp-sharoshi",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "JP",
    name: "Social Insurance and Labor Consultant (Sharōshi)",
    nameLocal: "社会保険労務士",
    description: "Licensed for labor law, social insurance procedures, and workplace compliance advisory.",
    regulatoryBody: "Japan Federation of Certified Social Insurance and Labor Consultants",
    relatedExpertDomainKey: "legal",
    sortOrder: 60,
  },
  {
    slug: "us-attorney",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "US",
    name: "Licensed Attorney",
    nameLocal: "弁護士（米国）",
    description: "State-bar licensed attorney authorized to practice law and represent clients.",
    regulatoryBody: "State bar associations (ABA coordination)",
    relatedExpertDomainKey: "legal",
    sortOrder: 10,
  },
  {
    slug: "us-cpa",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "US",
    name: "Certified Public Accountant (US)",
    nameLocal: "公認会計士（米国 CPA）",
    description: "Licensed for audits, tax, and attestation services under state board regulation.",
    regulatoryBody: "AICPA / State boards of accountancy",
    relatedExpertDomainKey: "accounting",
    sortOrder: 20,
  },
  {
    slug: "us-enrolled-agent",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "US",
    name: "Enrolled Agent",
    nameLocal: "EA（米国税務代理人）",
    description: "Federally authorized tax practitioner representing taxpayers before the IRS.",
    regulatoryBody: "Internal Revenue Service",
    relatedExpertDomainKey: "accounting",
    sortOrder: 30,
  },
  {
    slug: "sg-advocate-solicitor",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "SG",
    name: "Advocate & Solicitor (Singapore)",
    nameLocal: "弁護士（シンガポール）",
    description: "Licensed legal practitioner under the Legal Profession Act (Singapore).",
    regulatoryBody: "Law Society of Singapore",
    relatedExpertDomainKey: "legal",
    sortOrder: 10,
  },
  {
    slug: "sg-chartered-accountant",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "SG",
    name: "Chartered Accountant (Singapore)",
    nameLocal: "公認会計士（シンガポール）",
    description: "ISCA member with audit and assurance qualifications.",
    regulatoryBody: "Institute of Singapore Chartered Accountants",
    relatedExpertDomainKey: "accounting",
    sortOrder: 20,
  },
  {
    slug: "eu-rechtsanwalt",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "EU",
    name: "Rechtsanwalt / Avocat / Abogado",
    nameLocal: "欧州弁護士",
    description: "EU-member-state regulated legal profession; national bar registration required.",
    regulatoryBody: "National bar associations (CCBE coordination)",
    relatedExpertDomainKey: "legal",
    sortOrder: 10,
  },
  {
    slug: "eu-wirtschaftspruefer",
    category: "REGULATED_PROFESSION",
    jurisdictionCode: "EU",
    name: "Wirtschaftsprüfer / Statutory Auditor (EU)",
    nameLocal: "欧州監査法人・公認会計士",
    description: "EU statutory audit qualification under Directive 2006/43/EC.",
    regulatoryBody: "National audit oversight bodies",
    relatedExpertDomainKey: "accounting",
    sortOrder: 20,
  },
  {
    slug: "iso-9001-lead-auditor",
    category: "ISO_AUDIT_QUALIFICATION",
    name: "ISO 9001 Lead Auditor",
    nameLocal: "ISO 9001 リード監査員",
    description: "Lead auditor competence for quality management systems (ISO 9001).",
    regulatoryBody: "Certification bodies (ISO 17021-1 accredited)",
    relatedExpertDomainKey: "certification",
    sortOrder: 10,
    credentials: [{ slug: "iso-9001-la", name: "ISO 9001 Lead Auditor", nameLocal: "ISO 9001 リード監査員", standardCode: "ISO 9001:2015", validityYears: 3 }],
  },
  {
    slug: "iso-14001-lead-auditor",
    category: "ISO_AUDIT_QUALIFICATION",
    name: "ISO 14001 Lead Auditor",
    nameLocal: "ISO 14001 リード監査員",
    description: "Lead auditor competence for environmental management systems.",
    regulatoryBody: "Certification bodies (ISO 17021-1 accredited)",
    relatedExpertDomainKey: "certification",
    sortOrder: 20,
    credentials: [{ slug: "iso-14001-la", name: "ISO 14001 Lead Auditor", nameLocal: "ISO 14001 リード監査員", standardCode: "ISO 14001:2015", validityYears: 3 }],
  },
  {
    slug: "iso-27001-lead-auditor",
    category: "ISO_AUDIT_QUALIFICATION",
    name: "ISO 27001 Lead Auditor",
    nameLocal: "ISO 27001 リード監査員",
    description: "Lead auditor competence for information security management systems.",
    regulatoryBody: "Certification bodies (ISO 17021-1 accredited)",
    relatedExpertDomainKey: "certification",
    sortOrder: 30,
    credentials: [{ slug: "iso-27001-la", name: "ISO 27001 Lead Auditor", nameLocal: "ISO 27001 リード監査員", standardCode: "ISO/IEC 27001:2022", validityYears: 3 }],
  },
  {
    slug: "iso-13485-lead-auditor",
    category: "ISO_AUDIT_QUALIFICATION",
    name: "ISO 13485 Lead Auditor",
    nameLocal: "ISO 13485 リード監査員",
    description: "Lead auditor competence for medical device quality management systems.",
    regulatoryBody: "Certification bodies (MDSAP / ISO 17021-1)",
    relatedExpertDomainKey: "medical-qms",
    sortOrder: 40,
    credentials: [{ slug: "iso-13485-la", name: "ISO 13485 Lead Auditor", nameLocal: "ISO 13485 リード監査員", standardCode: "ISO 13485:2016", validityYears: 3 }],
  },
  {
    slug: "iso-45001-lead-auditor",
    category: "ISO_AUDIT_QUALIFICATION",
    name: "ISO 45001 Lead Auditor",
    nameLocal: "ISO 45001 リード監査員",
    description: "Lead auditor competence for occupational health and safety management systems.",
    regulatoryBody: "Certification bodies (ISO 17021-1 accredited)",
    relatedExpertDomainKey: "certification",
    sortOrder: 50,
    credentials: [{ slug: "iso-45001-la", name: "ISO 45001 Lead Auditor", nameLocal: "ISO 45001 リード監査員", standardCode: "ISO 45001:2018", validityYears: 3 }],
  },
  {
    slug: "iso-19011-auditor",
    category: "ISO_AUDIT_QUALIFICATION",
    name: "ISO 19011 Auditing Guidelines Competence",
    nameLocal: "ISO 19011 監査ガイドライン修得者",
    description: "Competence framework for management system auditing per ISO 19011.",
    regulatoryBody: "Training providers / certification bodies",
    relatedExpertDomainKey: "certification",
    sortOrder: 60,
    credentials: [{ slug: "iso-19011", name: "ISO 19011 Auditor Training", nameLocal: "ISO 19011 監査員研修", standardCode: "ISO 19011:2018" }],
  },
  {
    slug: "jp-customs-broker",
    category: "COMPLIANCE_SPECIALIST",
    jurisdictionCode: "JP",
    name: "Licensed Customs Broker (Japan)",
    nameLocal: "通関士",
    description: "Licensed to handle import/export customs clearance and trade compliance filings in Japan.",
    regulatoryBody: "Japan Customs / Japan Federation of Customs Brokers' Associations",
    relatedExpertDomainKey: "legal",
    sortOrder: 10,
    credentials: [{ slug: "jp-tsukanshi", name: "Customs Broker License", nameLocal: "通関士資格", issuingBody: "Ministry of Finance" }],
  },
  {
    slug: "us-customs-broker",
    category: "COMPLIANCE_SPECIALIST",
    jurisdictionCode: "US",
    name: "Licensed Customs Broker (US)",
    nameLocal: "通関士（米国）",
    description: "Licensed by CBP to conduct customs business on behalf of importers.",
    regulatoryBody: "U.S. Customs and Border Protection",
    relatedExpertDomainKey: "legal",
    sortOrder: 20,
  },
  {
    slug: "trade-compliance-officer",
    category: "COMPLIANCE_SPECIALIST",
    name: "Trade Compliance Officer",
    nameLocal: "貿易コンプライアンス担当",
    description: "Specialist in export controls, import regulations, and cross-border trade screening.",
    regulatoryBody: "Corporate compliance / national export control authorities",
    sortOrder: 30,
  },
  {
    slug: "sanctions-screening-specialist",
    category: "COMPLIANCE_SPECIALIST",
    name: "Sanctions Screening Specialist",
    nameLocal: "制裁スクリーニング専門家",
    description: "Expert in OFAC, EU, UN, and national sanctions list screening and escalation.",
    regulatoryBody: "Compliance departments / financial institutions",
    sortOrder: 40,
  },
  {
    slug: "anti-social-forces-check",
    category: "COMPLIANCE_SPECIALIST",
    jurisdictionCode: "JP",
    name: "Anti-Social Forces Screening Specialist",
    nameLocal: "反社会的勢力チェック担当",
    description: "Conducts counterparty screening against anti-social forces (反社) databases and public records.",
    regulatoryBody: "Corporate compliance / Japan Federation of Bar Associations guidance",
    sortOrder: 50,
  },
  {
    slug: "conflict-of-interest-officer",
    category: "COMPLIANCE_SPECIALIST",
    name: "Conflict of Interest Review Officer",
    nameLocal: "利益相反審査担当",
    description: "Reviews declarations and mitigates conflicts for committees, procurement, and partnerships.",
    regulatoryBody: "Governance / compliance function",
    sortOrder: 60,
  },
];

type ChecklistSeed = {
  slug: string;
  type: "CONFLICT_OF_INTEREST" | "SANCTIONS_SCREENING" | "ANTI_SOCIAL_FORCES" | "IMPORT_EXPORT_CONTROLS";
  jurisdictionCode?: string;
  name: string;
  nameLocal?: string;
  description?: string;
  expertRoleHint?: string;
  expertRoleHintLocal?: string;
  sortOrder?: number;
  items: Array<{
    code: string;
    title: string;
    titleLocal?: string;
    description?: string;
    required?: boolean;
    referenceUrl?: string;
    sortOrder?: number;
  }>;
};

const CHECKLISTS: ChecklistSeed[] = [
  {
    slug: "coi-general",
    type: "CONFLICT_OF_INTEREST",
    name: "General Conflict of Interest Declaration",
    nameLocal: "利益相反申告チェックリスト（一般）",
    description: "Standard COI review for committee members, maintainers, and vendor relationships.",
    expertRoleHint: "Conflict of Interest Review Officer / Governance lead",
    expertRoleHintLocal: "利益相反審査担当 / ガバナンス責任者",
    sortOrder: 10,
    items: [
      { code: "COI-001", title: "Disclose financial interests in related vendors or competitors", titleLocal: "関連ベンダー・競合への金銭的利害関係を申告", sortOrder: 10 },
      { code: "COI-002", title: "Disclose employment or advisory roles with affected organizations", titleLocal: "影響を受ける組織との雇用・顧問関係を申告", sortOrder: 20 },
      { code: "COI-003", title: "Disclose family relationships with decision-makers or applicants", titleLocal: "意思決定者・申請者との親族関係を申告", sortOrder: 30 },
      { code: "COI-004", title: "Confirm recusal from decisions where conflict exists", titleLocal: "利益相反がある案件では審議・決定から辞退", sortOrder: 40 },
      { code: "COI-005", title: "Document mitigation plan (wall-off, independent review)", titleLocal: "緩和策（情報遮断・独立レビュー）を文書化", sortOrder: 50 },
    ],
  },
  {
    slug: "coi-committee",
    type: "CONFLICT_OF_INTEREST",
    jurisdictionCode: "JP",
    name: "Committee Member COI (Japan)",
    nameLocal: "委員会メンバー利益相反チェック（日本）",
    description: "Extended COI checklist aligned with Japanese corporate governance and committee operations.",
    expertRoleHint: "Committee chair / Compliance officer",
    expertRoleHintLocal: "委員長 / コンプライアンス担当",
    sortOrder: 20,
    items: [
      { code: "COI-JP-001", title: "Confirm no undisclosed related-party transactions", titleLocal: "未開示の関連当事者取引がないことを確認", sortOrder: 10 },
      { code: "COI-JP-002", title: "Review anti-social forces (反社) declaration status", titleLocal: "反社会的勢力に関する申告状況を確認", sortOrder: 20 },
      { code: "COI-JP-003", title: "Verify independence from module maintainers under review", titleLocal: "審査対象モジュール Maintainer との独立性を確認", sortOrder: 30 },
    ],
  },
  {
    slug: "sanctions-global",
    type: "SANCTIONS_SCREENING",
    name: "Global Sanctions Screening Checklist",
    nameLocal: "制裁国・制裁リストスクリーニング",
    description: "Screen counterparties against major sanctions programs before engagement.",
    expertRoleHint: "Sanctions Screening Specialist / Legal counsel",
    expertRoleHintLocal: "制裁スクリーニング専門家 / 法務",
    sortOrder: 10,
    items: [
      { code: "SAN-001", title: "Screen against OFAC SDN and sectoral sanctions lists", titleLocal: "OFAC SDN・セクター制裁リストでスクリーニング", referenceUrl: "https://ofac.treasury.gov/", sortOrder: 10 },
      { code: "SAN-002", title: "Screen against EU consolidated sanctions list", titleLocal: "EU 統合制裁リストでスクリーニング", referenceUrl: "https://www.sanctionsmap.eu/", sortOrder: 20 },
      { code: "SAN-003", title: "Screen against UN Security Council consolidated list", titleLocal: "UN 安保理統合リストでスクリーニング", referenceUrl: "https://www.un.org/securitycouncil/sanctions/information", sortOrder: 30 },
      { code: "SAN-004", title: "Screen against Japan METI / MOF export control and sanctions lists", titleLocal: "経産省・財務省の輸出管理・制裁リストでスクリーニング", sortOrder: 40 },
      { code: "SAN-005", title: "Document false-positive resolution and escalation path", titleLocal: "誤検知の解消とエスカレーション経路を記録", sortOrder: 50 },
      { code: "SAN-006", title: "Re-screen on material ownership or jurisdiction changes", titleLocal: "所有権・法域の重要変更時に再スクリーニング", sortOrder: 60 },
    ],
  },
  {
    slug: "anti-social-jp",
    type: "ANTI_SOCIAL_FORCES",
    jurisdictionCode: "JP",
    name: "Anti-Social Forces Counterparty Check (Japan)",
    nameLocal: "反社会的勢力チェックリスト（日本）",
    description: "Standard 反社チェック for vendors, partners, and committee nominees in Japan.",
    expertRoleHint: "Compliance officer / Legal (Bengoshi)",
    expertRoleHintLocal: "コンプライアンス担当 / 弁護士",
    sortOrder: 10,
    items: [
      { code: "AS-001", title: "Obtain signed anti-social forces exclusion pledge (覚書)", titleLocal: "反社会的勢力排除に関する覚書・誓約書を取得", sortOrder: 10 },
      { code: "AS-002", title: "Search newspaper databases and public enforcement records", titleLocal: "新聞データベース・公開処分記録を検索", sortOrder: 20 },
      { code: "AS-003", title: "Verify representative directors and beneficial owners", titleLocal: "代表者・実質的支配者を確認", sortOrder: 30 },
      { code: "AS-004", title: "Check industry association expulsion records where available", titleLocal: "業界団体の除名記録を確認（取得可能な範囲）", sortOrder: 40 },
      { code: "AS-005", title: "Escalate ambiguous hits to legal counsel before contract execution", titleLocal: "疑義あるヒットは契約前に法務へエスカレーション", sortOrder: 50 },
    ],
  },
  {
    slug: "trade-import-export-jp",
    type: "IMPORT_EXPORT_CONTROLS",
    jurisdictionCode: "JP",
    name: "Import / Export Compliance Checklist (Japan)",
    nameLocal: "輸出入コンプライアンスチェックリスト（日本）",
    description: "Trade compliance review for cross-border shipments involving Japan.",
    expertRoleHint: "Licensed Customs Broker (通関士) / Trade compliance officer",
    expertRoleHintLocal: "通関士 / 貿易コンプライアンス担当",
    sortOrder: 10,
    items: [
      { code: "TR-JP-001", title: "Classify goods under HS code and confirm import/export permits", titleLocal: "HS コード分類と輸出入許可の要否を確認", sortOrder: 10 },
      { code: "TR-JP-002", title: "Check Foreign Exchange and Foreign Trade Act (FEFTA) controlled items", titleLocal: "外為法・輸出貿易管理令の該非判定", sortOrder: 20 },
      { code: "TR-JP-003", title: "Verify end-user and end-use statements for controlled technology", titleLocal: "規制対象技術の需要者・用途確認書を検証", sortOrder: 30 },
      { code: "TR-JP-004", title: "Confirm customs valuation and origin documentation", titleLocal: "関税評価・原産地証明書類を確認", sortOrder: 40 },
      { code: "TR-JP-005", title: "Screen destination country against export restrictions", titleLocal: "仕向国が輸出規制対象でないか確認", sortOrder: 50 },
    ],
  },
  {
    slug: "trade-import-export-us",
    type: "IMPORT_EXPORT_CONTROLS",
    jurisdictionCode: "US",
    name: "Import / Export Compliance Checklist (US)",
    nameLocal: "輸出入コンプライアンスチェックリスト（米国）",
    description: "EAR / ITAR / CBP compliance review for US trade.",
    expertRoleHint: "Licensed Customs Broker (US) / Export compliance counsel",
    expertRoleHintLocal: "米国通関士 / 輸出管理担当",
    sortOrder: 20,
    items: [
      { code: "TR-US-001", title: "Determine EAR / ITAR jurisdiction and ECCN / USML category", titleLocal: "EAR / ITAR 管轄と ECCN / USML 区分を判定", sortOrder: 10 },
      { code: "TR-US-002", title: "Verify BIS license or license exception eligibility", titleLocal: "BIS ライセンスまたは許容例外の適用可否を確認", sortOrder: 20 },
      { code: "TR-US-003", title: "Complete denied party screening (BIS Entity List, etc.)", titleLocal: "Denied Party スクリーニング（Entity List 等）", sortOrder: 30 },
      { code: "TR-US-004", title: "File CBP entry / AES export filing via licensed broker", titleLocal: "CBP 申告 / AES 輸出申告（通関士経由）", sortOrder: 40 },
    ],
  },
  {
    slug: "trade-import-export-eu",
    type: "IMPORT_EXPORT_CONTROLS",
    jurisdictionCode: "EU",
    name: "Import / Export Compliance Checklist (EU)",
    nameLocal: "輸出入コンプライアンスチェックリスト（EU）",
    description: "Dual-use export controls and customs compliance under EU regulations.",
    expertRoleHint: "Customs agent / Export control officer",
    expertRoleHintLocal: "通関業者 / 輸出管理担当",
    sortOrder: 30,
    items: [
      { code: "TR-EU-001", title: "Check EU Dual-Use Regulation Annex classification", titleLocal: "EU デュアルユース規則 Annex 分類を確認", sortOrder: 10 },
      { code: "TR-EU-002", title: "Verify national export license from member state authority", titleLocal: "加盟国当局の輸出許可を確認", sortOrder: 20 },
      { code: "TR-EU-003", title: "Screen against EU consolidated sanctions and embargoes", titleLocal: "EU 統合制裁・禁輸措置でスクリーニング", sortOrder: 30 },
    ],
  },
];

export async function seedComplianceRegistry(prisma: PrismaClient) {
  console.log("Seeding compliance registry…");

  for (const profession of PROFESSIONS) {
    const { credentials, ...data } = profession;
    const row = await prisma.complianceProfession.upsert({
      where: { slug: profession.slug },
      create: data,
      update: {
        category: data.category,
        jurisdictionCode: data.jurisdictionCode,
        name: data.name,
        nameLocal: data.nameLocal,
        description: data.description,
        regulatoryBody: data.regulatoryBody,
        relatedExpertDomainKey: data.relatedExpertDomainKey,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    for (const cred of credentials ?? []) {
      await prisma.complianceCredentialType.upsert({
        where: { slug: cred.slug },
        create: { ...cred, professionId: row.id },
        update: {
          name: cred.name,
          nameLocal: cred.nameLocal,
          issuingBody: cred.issuingBody,
          standardCode: cred.standardCode,
          description: cred.description,
          validityYears: cred.validityYears,
          sortOrder: cred.sortOrder ?? 0,
          professionId: row.id,
        },
      });
    }
  }

  for (const checklist of CHECKLISTS) {
    const { items, ...data } = checklist;
    const row = await prisma.complianceChecklist.upsert({
      where: { slug: checklist.slug },
      create: data,
      update: {
        type: data.type,
        jurisdictionCode: data.jurisdictionCode,
        name: data.name,
        nameLocal: data.nameLocal,
        description: data.description,
        expertRoleHint: data.expertRoleHint,
        expertRoleHintLocal: data.expertRoleHintLocal,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    for (const item of items) {
      await prisma.complianceChecklistItem.upsert({
        where: {
          checklistId_code: { checklistId: row.id, code: item.code },
        },
        create: {
          checklistId: row.id,
          code: item.code,
          title: item.title,
          titleLocal: item.titleLocal,
          description: item.description,
          required: item.required ?? true,
          referenceUrl: item.referenceUrl,
          sortOrder: item.sortOrder ?? 0,
        },
        update: {
          title: item.title,
          titleLocal: item.titleLocal,
          description: item.description,
          required: item.required ?? true,
          referenceUrl: item.referenceUrl,
          sortOrder: item.sortOrder ?? 0,
        },
      });
    }
  }

  console.log(
    `Compliance registry seeded: ${PROFESSIONS.length} professions, ${CHECKLISTS.length} checklists`,
  );
}
