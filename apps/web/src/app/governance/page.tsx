import Link from "next/link";
import { getLabelMessages } from "@os-community/shared";
import { getContentById } from "@/lib/content";
import { getT } from "@/lib/i18n";
import { getAuthSession } from "@/lib/session";
import { listReviewableCommitteeSlugs } from "@/lib/review-authorization";
import { getPendingReviewCountForCommittee } from "@/lib/committee-review-counts";
import { prisma } from "@/lib/prisma";

export default async function GovernancePage() {
  const { locale, messages: t } = await getT();
  const g = t.governance;
  const cp = t.committeesPage;
  const labels = getLabelMessages(locale);
  const implementationStatusDoc = getContentById("implementation-status", locale);
  const iso37000Doc = getContentById("iso-37000-orgos", locale);
  const session = await getAuthSession();
  const reviewableCommittees =
    session?.user?.id != null
      ? await listReviewableCommitteeSlugs(session.user.id, session.user.siteRole)
      : [];

  const reviewableWithCounts = await Promise.all(
    reviewableCommittees.map(async (committee) => {
      const full = await prisma.committee.findUnique({
        where: { slug: committee.slug },
        select: { id: true, slug: true, moduleId: true, type: true },
      });
      const count =
        full && session?.user?.id
          ? await getPendingReviewCountForCommittee(session.user.id, session.user.siteRole, full)
          : 0;
      return { ...committee, pendingCount: count };
    }),
  );

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{g.title}</h1>
          <p className="lf-hero-lead">{g.lead}</p>
        </div>
      </section>

      <div className="page-wrap">
        <h2 className="section-title">{g.membershipTitle}</h2>

        <div className="lf-card-grid" style={{ marginBottom: "1.5rem" }}>
          <div className="lf-card">
            <span className="badge badge-success">{g.membershipOpenTitle}</span>
            <p style={{ marginTop: "0.75rem", color: "var(--muted)" }}>{g.membershipOpenBody}</p>
          </div>
          <div className="lf-card">
            <span className="badge badge-navy">{g.membershipCrossTitle}</span>
            <p style={{ marginTop: "0.75rem", color: "var(--muted)" }}>{g.membershipCrossBody}</p>
          </div>
        </div>

        <ul className="membership-criteria-list">
          {g.membershipCriteria.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="page-muted-note" style={{ marginTop: "1rem" }}>
          {g.membershipExample}
        </p>

        <h2 className="section-title">{g.rolesTitle}</h2>
        <p className="page-desc">{g.rolesDesc}</p>
        <table className="lf-table">
          <thead>
            <tr>
              <th>{g.tableRole}</th>
              <th>{g.tableResponsibility}</th>
            </tr>
          </thead>
          <tbody>
            {labels.communityRoles.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{locale === "en" ? r.title : r.titleLocal}</strong>
                </td>
                <td style={{ color: "var(--muted)" }}>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="section-title">{g.promotionTitle}</h2>
        <p className="page-desc">{g.promotionDesc}</p>
        <div className="lf-card-grid">
          {labels.promotionFlow.map((step, i) => {
            const hrefs = [
              "/modules#apply",
              "/modules#registry",
              "/committees",
              "/certifications/apply",
            ] as const;
            return (
              <Link key={i} href={hrefs[i] ?? "/modules"} className="lf-card-link-wrap">
                <div className="lf-card lf-card-full">
                  <span className="badge badge-default">{step.from}</span>
                  <span style={{ margin: "0 0.5rem", color: "var(--muted)" }}>→</span>
                  <span className="badge badge-navy">{step.to}</span>
                  <p style={{ marginTop: "0.75rem", marginBottom: 0 }}>{step.criteria}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <h2 className="section-title">{g.ecosystemTitle}</h2>
        <div className="lf-card" style={{ marginBottom: "var(--space-6)" }}>
          <p className="page-desc" style={{ marginBottom: "var(--space-4)" }}>
            {g.ecosystemBody}
          </p>
          <Link href="/content/module-ecosystem" className="btn btn-primary btn-sm">
            {g.ctaEcosystem}
          </Link>
        </div>

        {implementationStatusDoc && (
          <>
            <h2 className="section-title">{implementationStatusDoc.meta.title}</h2>
            <div className="lf-card" style={{ marginBottom: "var(--space-6)" }}>
              <p className="page-desc" style={{ marginBottom: "var(--space-4)" }}>
                {implementationStatusDoc.description}
              </p>
              <Link href={`/content/${implementationStatusDoc.meta.id}`} className="btn btn-primary btn-sm">
                {implementationStatusDoc.meta.title}
              </Link>
            </div>
          </>
        )}

        <h2 className="section-title">{g.permissionTitle}</h2>
        <table className="lf-table">
          <thead>
            <tr>
              <th>{g.permissionHeaders.action}</th>
              <th>{g.permissionHeaders.user}</th>
              <th>{g.permissionHeaders.contributor}</th>
              <th>{g.permissionHeaders.reviewer}</th>
              <th>{g.permissionHeaders.maintainer}</th>
              <th>{g.permissionHeaders.committee}</th>
            </tr>
          </thead>
          <tbody>
            {g.permissionRows.map((row) => (
              <tr key={row.action}>
                <td>{row.action}</td>
                {row.values.map((p, i) => (
                  <td key={i} style={{ textAlign: "center", color: p === "—" ? "var(--border)" : "var(--success)" }}>
                    {p}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="section-title">{g.longTermTitle}</h2>
        <div className="principles-band">
          {t.principles.map((p) => (
            <div key={p.id} className="principle-item">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>

        <p className="section-cta">
          <Link href="/content/module-ecosystem" className="btn btn-primary btn-sm">
            {g.ctaEcosystem}
          </Link>
          {implementationStatusDoc && (
            <Link href={`/content/${implementationStatusDoc.meta.id}`} className="btn btn-primary btn-sm">
              {implementationStatusDoc.meta.title}
            </Link>
          )}
          <Link href="/governance/openness" className="btn btn-primary btn-sm">
            {g.ctaOpenness}
          </Link>
          {iso37000Doc && (
            <Link href={`/content/${iso37000Doc.meta.id}`} className="btn btn-primary btn-sm">
              {iso37000Doc.meta.title}
            </Link>
          )}
          <Link href="/committees" className="btn btn-primary btn-sm">
            {g.ctaCommittees}
          </Link>
          <Link href="/experts" className="btn btn-primary btn-sm">
            {g.ctaExperts}
          </Link>
          <Link href="/compliance" className="btn btn-primary btn-sm">
            {g.ctaCompliance}
          </Link>
          <Link href="/governance/sla" className="btn btn-primary btn-sm">
            Protocol SLA
          </Link>
          <Link href="/governance/lifecycle" className="btn btn-primary btn-sm">
            Application lifecycle
          </Link>
          <Link href="/protocol/trusted-operators" className="btn btn-primary btn-sm">
            Trusted operators
          </Link>
          <Link href="/protocol/wire-node/apply" className="btn btn-primary btn-sm">
            Wire node apply
          </Link>
          <Link href="/protocol/wire-node/review" className="btn btn-primary btn-sm">
            Wire node review
          </Link>
        </p>

        {reviewableWithCounts.length > 0 && (
          <section id="review-queues" style={{ marginTop: "2rem" }}>
            <h2 className="section-title">{cp.reviewQueueTitle}</h2>
            <p className="page-desc">{g.reviewQueueDesc}</p>
            <ul className="list-muted">
              {reviewableWithCounts.map((committee) => (
                <li key={committee.slug}>
                  <Link href={`/committees/${committee.slug}/review`}>
                    {committee.name} — {cp.reviewQueueCta}
                    {committee.pendingCount > 0 ? ` (${committee.pendingCount})` : ""}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
