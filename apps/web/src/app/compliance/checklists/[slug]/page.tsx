import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import {
  formatChecklistItem,
  formatChecklistRow,
  getComplianceChecklistBySlug,
} from "@/lib/compliance-registry";

export default async function ComplianceChecklistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale } = await getT();
  const c = getPageMessages(locale).compliance;

  const checklist = await getComplianceChecklistBySlug(slug);
  if (!checklist) notFound();

  const meta = formatChecklistRow(locale, checklist);

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{meta.displayName}</h1>
          <p className="lf-hero-lead">{checklist.description}</p>
          <p className="page-muted-note" style={{ marginTop: "0.75rem" }}>
            {meta.typeLabel}
            {meta.jurisdictionLabel ? ` · ${meta.jurisdictionLabel}` : ` · ${c.international}`} ·{" "}
            {c.checklistVersion.replace("{version}", checklist.version)}
          </p>
          {meta.expertHint && (
            <p className="page-muted-note">
              {c.tableExpert}: {meta.expertHint}
            </p>
          )}
        </div>
      </section>

      <div className="page-wrap">
        <table className="lf-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{c.tableName}</th>
              <th>{c.filterType}</th>
              <th>{c.itemReference}</th>
            </tr>
          </thead>
          <tbody>
            {checklist.items.map((item) => {
              const formatted = formatChecklistItem(locale, item);
              return (
                <tr key={item.id}>
                  <td>
                    <code>{item.code}</code>
                  </td>
                  <td>
                    <strong>{formatted.displayTitle}</strong>
                    {formatted.displayDescription && (
                      <p style={{ margin: "0.25rem 0 0", color: "var(--muted)" }}>
                        {formatted.displayDescription}
                      </p>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${item.required ? "badge-navy" : "badge-default"}`}>
                      {item.required ? c.itemRequired : c.itemOptional}
                    </span>
                  </td>
                  <td>
                    {item.referenceUrl ? (
                      <a href={item.referenceUrl} target="_blank" rel="noopener noreferrer">
                        {c.itemReference}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="section-cta" style={{ marginTop: "2rem" }}>
          <Link href="/compliance/checklists" className="btn btn-ghost btn-sm">
            {c.backToRegistry}
          </Link>
        </p>
      </div>
    </>
  );
}
