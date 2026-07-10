import type {
  ComplianceChecklistType,
  ComplianceRegistryCategory,
} from "@prisma/client";
import {
  getComplianceCategoryLabel,
  getComplianceChecklistTypeLabel,
  getGovernanceJurisdictionLabel,
  localizedComplianceField,
  type ComplianceChecklistTypeKey,
  type ComplianceRegistryCategoryKey,
  type Locale,
} from "@os-community/shared";
import { prisma } from "@/lib/prisma";

export async function getComplianceRegistrySummary() {
  const [professionCounts, checklistCounts, professionTotal, checklistTotal] = await Promise.all([
    prisma.complianceProfession.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
    prisma.complianceChecklist.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
    prisma.complianceProfession.count(),
    prisma.complianceChecklist.count(),
  ]);

  return {
    professionTotal,
    checklistTotal,
    professionCounts: Object.fromEntries(
      professionCounts.map((row) => [row.category, row._count._all]),
    ) as Partial<Record<ComplianceRegistryCategory, number>>,
    checklistCounts: Object.fromEntries(
      checklistCounts.map((row) => [row.type, row._count._all]),
    ) as Partial<Record<ComplianceChecklistType, number>>,
  };
}

export async function listComplianceProfessions(filters?: {
  category?: ComplianceRegistryCategory;
  jurisdictionCode?: string;
  q?: string;
}) {
  const q = filters?.q?.trim();
  const jurisdiction = filters?.jurisdictionCode?.toUpperCase();
  const jurisdictionWhere =
    jurisdiction === "INT"
      ? { jurisdictionCode: null }
      : jurisdiction
        ? { jurisdictionCode: jurisdiction }
        : {};

  return prisma.complianceProfession.findMany({
    where: {
      ...(filters?.category ? { category: filters.category } : {}),
      ...jurisdictionWhere,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { nameLocal: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { regulatoryBody: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      credentialTypes: { orderBy: { sortOrder: "asc" } },
      _count: { select: { credentialTypes: true } },
    },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function listComplianceChecklists(filters?: {
  type?: ComplianceChecklistType;
  jurisdictionCode?: string;
}) {
  return prisma.complianceChecklist.findMany({
    where: {
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.jurisdictionCode
        ? { jurisdictionCode: filters.jurisdictionCode.toUpperCase() }
        : {}),
    },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getComplianceChecklistBySlug(slug: string) {
  return prisma.complianceChecklist.findUnique({
    where: { slug },
    include: {
      items: { orderBy: [{ sortOrder: "asc" }, { code: "asc" }] },
    },
  });
}

export function formatProfessionRow(
  locale: Locale,
  row: Awaited<ReturnType<typeof listComplianceProfessions>>[number],
) {
  return {
    ...row,
    displayName: localizedComplianceField(locale, row.name, row.nameLocal),
    categoryLabel: getComplianceCategoryLabel(row.category as ComplianceRegistryCategoryKey, locale),
    jurisdictionLabel: row.jurisdictionCode
      ? getGovernanceJurisdictionLabel(row.jurisdictionCode, locale)
      : null,
  };
}

export function formatChecklistRow(
  locale: Locale,
  row: Awaited<ReturnType<typeof listComplianceChecklists>>[number],
) {
  return {
    ...row,
    displayName: localizedComplianceField(locale, row.name, row.nameLocal),
    typeLabel: getComplianceChecklistTypeLabel(row.type as ComplianceChecklistTypeKey, locale),
    jurisdictionLabel: row.jurisdictionCode
      ? getGovernanceJurisdictionLabel(row.jurisdictionCode, locale)
      : null,
    expertHint: localizedComplianceField(locale, row.expertRoleHint ?? "", row.expertRoleHintLocal),
  };
}

export function formatChecklistItem(
  locale: Locale,
  item: { title: string; titleLocal?: string | null; description?: string | null },
) {
  return {
    displayTitle: localizedComplianceField(locale, item.title, item.titleLocal),
    displayDescription: item.description,
  };
}
