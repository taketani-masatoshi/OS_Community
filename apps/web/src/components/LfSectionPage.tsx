import Link from "next/link";
import { Badge, Card } from "@/components/ui";

export type LfBreadcrumb = { href: string; label: string };

export type LfRelatedLink = { href: string; label: string };

export function LfSectionPage({
  breadcrumbs,
  title,
  lead,
  statusBadge,
  statusNote,
  plannedTitle,
  plannedItems,
  emptyList,
  relatedTitle,
  relatedLinks,
  primaryCta,
  secondaryCta,
  children,
}: {
  breadcrumbs: LfBreadcrumb[];
  title: string;
  lead: string;
  statusBadge?: string;
  statusNote?: string;
  plannedTitle?: string;
  plannedItems?: string[];
  emptyList?: string;
  relatedTitle?: string;
  relatedLinks?: LfRelatedLink[];
  primaryCta?: LfRelatedLink;
  secondaryCta?: LfRelatedLink;
  children?: React.ReactNode;
}) {
  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <nav aria-label="Breadcrumb" className="lf-breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href}>
                {i > 0 && <span className="lf-breadcrumb-sep"> / </span>}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="lf-hero-title-sm">{title}</h1>
          <p className="lf-hero-lead">{lead}</p>
          {statusBadge && (
            <p style={{ marginTop: "0.75rem" }}>
              <Badge variant="warning">{statusBadge}</Badge>
            </p>
          )}
        </div>
      </section>

      <div className="page-wrap">
        {statusNote && (
          <Card>
            <p className="page-muted-note" style={{ margin: 0 }}>
              {statusNote}
            </p>
          </Card>
        )}

        {children}

        {plannedItems && plannedItems.length > 0 && (
          <section style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">{plannedTitle}</h2>
            <ul className="lf-skeleton-list">
              {plannedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {emptyList && (
          <p className="page-muted-note" style={{ marginTop: "1.5rem" }}>
            {emptyList}
          </p>
        )}

        {relatedLinks && relatedLinks.length > 0 && (
          <section style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">{relatedTitle}</h2>
            <div className="lf-card-grid">
              {relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="lf-card-link-wrap">
                  <div className="lf-card lf-card-full">
                    <h3>{link.label}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(primaryCta || secondaryCta) && (
          <p className="section-cta">
            {primaryCta && (
              <Link href={primaryCta.href} className="btn btn-primary">
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="btn btn-primary btn-sm"
                style={{ marginLeft: primaryCta ? "0.75rem" : undefined }}
              >
                {secondaryCta.label}
              </Link>
            )}
          </p>
        )}
      </div>
    </>
  );
}
