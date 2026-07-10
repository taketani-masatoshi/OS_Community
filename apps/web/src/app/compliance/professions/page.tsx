import Link from "next/link";
import type { ComplianceRegistryCategory } from "@prisma/client";
import {
  COMPLIANCE_REGISTRY_CATEGORIES,
  GOVERNANCE_JURISDICTIONS,
  getLocalized,
} from "@os-community/shared";
import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import {
  formatProfessionRow,
  listComplianceProfessions,
} from "@/lib/compliance-registry";

export default async function ComplianceProfessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; jurisdiction?: string; q?: string }>;
}) {
  const { category, jurisdiction, q } = await searchParams;
  const { locale, messages: t } = await getT();
  const c = getPageMessages(locale).compliance;

  const categoryFilter =
    category && COMPLIANCE_REGISTRY_CATEGORIES.some((row) => row.key === category)
      ? (category as ComplianceRegistryCategory)
      : undefined;

  const rows = await listComplianceProfessions({
    category: categoryFilter,
    jurisdictionCode: jurisdiction,
    q,
  });
  const formatted = rows.map((row) => formatProfessionRow(locale, row));

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{c.professionsTitle}</h1>
          <p className="lf-hero-lead">{c.professionsLead}</p>
        </div>
      </section>

      <div className="page-wrap">
        <form method="get" className="admin-filter-bar" style={{ marginBottom: "1.5rem" }}>
          <label>
            <span className="experts-filter-label">{c.filterCategory}</span>
            <select name="category" defaultValue={category ?? ""} className="lf-input">
              <option value="">{c.filterAll}</option>
              {COMPLIANCE_REGISTRY_CATEGORIES.map((row) => (
                <option key={row.key} value={row.key}>
                  {getLocalized(row.name, locale)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="experts-filter-label">{c.filterJurisdiction}</span>
            <select name="jurisdiction" defaultValue={jurisdiction ?? ""} className="lf-input">
              <option value="">{c.filterAll}</option>
              <option value="INT">{c.international}</option>
              {GOVERNANCE_JURISDICTIONS.map((row) => (
                <option key={row.code} value={row.code}>
                  {getLocalized(row.name, locale)}
                </option>
              ))}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            <span className="experts-filter-label">{c.searchPlaceholder}</span>
            <input name="q" defaultValue={q ?? ""} className="lf-input" />
          </label>
          <button type="submit" className="btn btn-primary btn-sm">
            {t.admin?.committeesApplyFilters ?? "Apply"}
          </button>
        </form>

        {formatted.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{c.emptyProfessions}</p>
        ) : (
          <table className="lf-table">
            <thead>
              <tr>
                <th>{c.tableName}</th>
                <th>{c.tableCategory}</th>
                <th>{c.tableJurisdiction}</th>
                <th>{c.tableRegulator}</th>
                <th>{c.tableCredentials}</th>
              </tr>
            </thead>
            <tbody>
              {formatted.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.displayName}</strong>
                    {row.description && (
                      <p style={{ margin: "0.25rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
                        {row.description}
                      </p>
                    )}
                  </td>
                  <td>{row.categoryLabel}</td>
                  <td>{row.jurisdictionLabel ?? c.international}</td>
                  <td style={{ color: "var(--muted)" }}>{row.regulatoryBody ?? "—"}</td>
                  <td>{row._count.credentialTypes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="section-cta" style={{ marginTop: "2rem" }}>
          <Link href="/compliance" className="btn btn-ghost btn-sm">
            {c.backToRegistry}
          </Link>
        </p>
      </div>
    </>
  );
}
