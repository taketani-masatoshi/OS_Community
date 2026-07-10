import Link from "next/link";
import {
  COMPLIANCE_CHECKLIST_TYPES,
  COMPLIANCE_REGISTRY_CATEGORIES,
  getLocalized,
} from "@os-community/shared";
import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import { getComplianceRegistrySummary } from "@/lib/compliance-registry";

export default async function CompliancePage() {
  const { locale } = await getT();
  const c = getPageMessages(locale).compliance;
  const summary = await getComplianceRegistrySummary();

  const professionCategories = COMPLIANCE_REGISTRY_CATEGORIES.filter(
    (row) => row.key !== "ISO_AUDIT_QUALIFICATION",
  );
  const isoCategory = COMPLIANCE_REGISTRY_CATEGORIES.find(
    (row) => row.key === "ISO_AUDIT_QUALIFICATION",
  );

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{c.title}</h1>
          <p className="lf-hero-lead">{c.lead}</p>
          <p className="page-muted-note" style={{ marginTop: "0.75rem" }}>
            {c.summaryProfessions.replace("{count}", String(summary.professionTotal))} ·{" "}
            {c.summaryChecklists.replace("{count}", String(summary.checklistTotal))}
          </p>
        </div>
      </section>

      <div className="page-wrap">
        <div className="lf-card-grid" style={{ marginBottom: "2rem" }}>
          <div className="lf-card">
            <h2 className="section-title" style={{ fontSize: "1.1rem" }}>
              {c.sectionProfessionsTitle}
            </h2>
            <p style={{ color: "var(--muted)" }}>{c.sectionProfessionsDesc}</p>
            <p className="section-cta">
              <Link href="/compliance/professions" className="btn btn-primary btn-sm">
                {c.viewProfessions}
              </Link>
            </p>
          </div>

          {isoCategory && (
            <div className="lf-card">
              <h2 className="section-title" style={{ fontSize: "1.1rem" }}>
                {getLocalized(isoCategory.name, locale)}
              </h2>
              <p style={{ color: "var(--muted)" }}>{getLocalized(isoCategory.desc, locale)}</p>
              <p className="section-cta">
                <Link
                  href="/compliance/professions?category=ISO_AUDIT_QUALIFICATION"
                  className="btn btn-primary btn-sm"
                >
                  {c.viewIso}
                </Link>
              </p>
            </div>
          )}

          <div className="lf-card">
            <h2 className="section-title" style={{ fontSize: "1.1rem" }}>
              {c.sectionChecklistsTitle}
            </h2>
            <p style={{ color: "var(--muted)" }}>{c.sectionChecklistsDesc}</p>
            <p className="section-cta">
              <Link href="/compliance/checklists" className="btn btn-primary btn-sm">
                {c.viewChecklists}
              </Link>
            </p>
          </div>
        </div>

        <h2 className="section-title">{c.sectionChecklistsTitle}</h2>
        <div className="lf-card-grid">
          {COMPLIANCE_CHECKLIST_TYPES.map((row) => (
            <Link
              key={row.key}
              href={`/compliance/checklists?type=${row.key}`}
              className="lf-card-link-wrap"
            >
              <div className="lf-card lf-card-full">
                <span className="badge badge-navy">{getLocalized(row.name, locale)}</span>
                <p style={{ marginTop: "0.75rem", marginBottom: 0, color: "var(--muted)" }}>
                  {getLocalized(row.desc, locale)}
                </p>
                {summary.checklistCounts[row.key] != null && (
                  <p style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                    {summary.checklistCounts[row.key]} checklist(s)
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <h2 className="section-title">{c.sectionProfessionsTitle}</h2>
        <div className="lf-card-grid">
          {professionCategories.map((row) => (
            <Link
              key={row.key}
              href={`/compliance/professions?category=${row.key}`}
              className="lf-card-link-wrap"
            >
              <div className="lf-card lf-card-full">
                <span className="badge badge-default">{getLocalized(row.name, locale)}</span>
                <p style={{ marginTop: "0.75rem", marginBottom: 0, color: "var(--muted)" }}>
                  {getLocalized(row.desc, locale)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="section-cta" style={{ marginTop: "2rem" }}>
          <Link href="/experts" className="btn btn-ghost btn-sm">
            {c.expertsLink}
          </Link>
        </p>
      </div>
    </>
  );
}
