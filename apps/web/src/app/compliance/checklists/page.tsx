import Link from "next/link";
import type { ComplianceChecklistType } from "@prisma/client";
import {
  COMPLIANCE_CHECKLIST_TYPES,
  GOVERNANCE_JURISDICTIONS,
  getLocalized,
} from "@os-community/shared";
import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import {
  formatChecklistRow,
  listComplianceChecklists,
} from "@/lib/compliance-registry";

export default async function ComplianceChecklistsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; jurisdiction?: string }>;
}) {
  const { type, jurisdiction } = await searchParams;
  const { locale, messages: t } = await getT();
  const c = getPageMessages(locale).compliance;

  const typeFilter =
    type && COMPLIANCE_CHECKLIST_TYPES.some((row) => row.key === type)
      ? (type as ComplianceChecklistType)
      : undefined;

  const rows = await listComplianceChecklists({
    type: typeFilter,
    jurisdictionCode: jurisdiction,
  });
  const formatted = rows.map((row) => formatChecklistRow(locale, row));

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{c.checklistsTitle}</h1>
          <p className="lf-hero-lead">{c.checklistsLead}</p>
        </div>
      </section>

      <div className="page-wrap">
        <form method="get" className="admin-filter-bar" style={{ marginBottom: "1.5rem" }}>
          <label>
            <span className="experts-filter-label">{c.filterType}</span>
            <select name="type" defaultValue={type ?? ""} className="lf-input">
              <option value="">{c.filterAll}</option>
              {COMPLIANCE_CHECKLIST_TYPES.map((row) => (
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
              {GOVERNANCE_JURISDICTIONS.map((row) => (
                <option key={row.code} value={row.code}>
                  {getLocalized(row.name, locale)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary btn-sm">
            {t.admin?.committeesApplyFilters ?? "Apply"}
          </button>
        </form>

        {formatted.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{c.emptyChecklists}</p>
        ) : (
          <table className="lf-table">
            <thead>
              <tr>
                <th>{c.tableName}</th>
                <th>{c.tableType}</th>
                <th>{c.tableJurisdiction}</th>
                <th>{c.tableItems}</th>
                <th>{c.tableExpert}</th>
                <th>{c.viewChecklist}</th>
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
                  <td>{row.typeLabel}</td>
                  <td>{row.jurisdictionLabel ?? c.international}</td>
                  <td>{row._count.items}</td>
                  <td style={{ color: "var(--muted)" }}>{row.expertHint || "—"}</td>
                  <td>
                    <Link href={`/compliance/checklists/${row.slug}`}>{c.viewChecklist}</Link>
                  </td>
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
