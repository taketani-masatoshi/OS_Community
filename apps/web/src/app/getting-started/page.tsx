import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n";
import { GettingStartedWizard } from "@/components/GettingStartedWizard";
import { getContentById } from "@/lib/content";

export default async function GettingStartedPage() {
  const session = await auth();
  const { locale, messages: t } = await getT();
  const g = t.gettingStartedPage;
  const implementationStatusDoc = getContentById("implementation-status", locale);

  const steps = [
    {
      id: "browse",
      title: g.stepBrowseTitle,
      body: g.stepBrowseBody,
      href: "/modules#registry",
      cta: g.stepBrowseCta,
      intent: "browse",
    },
    {
      id: "learn",
      title: g.stepLearnTitle,
      body: g.stepLearnBody,
      href: "/learning",
      cta: g.stepLearnCta,
      intent: "learn",
    },
    {
      id: "propose",
      title: g.stepProposeTitle,
      body: g.stepProposeBody,
      href: session?.user ? "/wild-modules/register" : "/login?callbackUrl=/wild-modules/register",
      cta: g.stepProposeCta,
      intent: "propose",
    },
  ];

  return (
    <>
      <section className="lf-hero lf-hero-compact lf-hero-decorated">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{g.title}</h1>
          <p className="lf-hero-lead">{g.lead}</p>
          {!session?.user && (
            <Link href="/login?callbackUrl=/getting-started" className="btn btn-outline-light btn-sm">
              {t.nav.signIn}
            </Link>
          )}
        </div>
      </section>

      <div className="page-wrap">
        <section id="getting-started-community" className="page-section-block">
          <h2 className="lf-section-title">{g.flowTitle}</h2>
          <Suspense fallback={null}>
            <GettingStartedWizard
              steps={steps}
              isSignedIn={!!session?.user}
              labels={{
                flowTitle: g.flowTitle,
                flowBrowse: g.flowBrowse,
                flowSignIn: g.flowSignIn,
                flowApply: g.flowApply,
                progressLabel: g.progressLabel,
                back: g.back,
                next: g.next,
                finish: g.finish,
                caseStudiesTitle: g.caseStudiesTitle,
                caseStudies: g.caseStudies,
              }}
            />
          </Suspense>

          {!session?.user && (
            <p className="page-muted-note section-cta">{g.signInNote}</p>
          )}
        </section>

        <section className="page-section-block">
          <h2 className="lf-section-title">{g.ecosystemSectionTitle}</h2>
          <p className="lf-section-sub">{g.ecosystemSectionLead}</p>
          <p className="section-cta">
            <Link href="/content/module-ecosystem" className="btn btn-primary btn-sm">
              {g.ecosystemSectionCta}
            </Link>
            {implementationStatusDoc && (
              <Link href={`/content/${implementationStatusDoc.meta.id}`} className="btn btn-primary btn-sm">
                {implementationStatusDoc.meta.title}
              </Link>
            )}
          </p>
        </section>

        <section className="page-section-block">
          <h2 className="lf-section-title">{t.nav.governance}</h2>
          <p className="lf-section-sub">{t.governance.lead}</p>
          <p className="section-cta">
            <Link href="/governance" className="btn btn-primary btn-sm">
              {t.nav.governance}
            </Link>
            <Link href="/committees" className="btn btn-primary btn-sm">
              {t.nav.committees}
            </Link>
          </p>
        </section>

        <section
          id="getting-started-orgos"
          className="getting-started-orgos page-section-block"
          aria-labelledby="getting-started-orgos-heading"
        >
          <h2 id="getting-started-orgos-heading" className="lf-section-title">
            {g.orgosInstallSectionTitle}
          </h2>
          <p className="lf-section-sub">{g.orgosInstallSectionLead}</p>

          <div className="getting-started-orgos-grid">
            <article className="getting-started-orgos-block">
              <h3>{g.orgosHardwareTitle}</h3>
              <p>{g.orgosHardwareLead}</p>
              <div className="prose-table-wrap">
                <table className="lf-table">
                  <thead>
                    <tr>
                      <th scope="col">{g.orgosHardwareColComponent}</th>
                      <th scope="col">{g.orgosHardwareColPurpose}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.orgosHardwareRows.map((row) => (
                      <tr key={row.component}>
                        <td>{row.component}</td>
                        <td>{row.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="getting-started-orgos-block">
              <h3>{g.orgosSoftwareTitle}</h3>
              <p>{g.orgosSoftwareLead}</p>
              <ul className="getting-started-orgos-list">
                {g.orgosSoftwareBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="getting-started-orgos-block">
              <h3>{g.orgosInstallTitle}</h3>
              <ol className="getting-started-orgos-steps">
                {g.orgosInstallSteps.map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </li>
                ))}
              </ol>
              <p className="getting-started-orgos-guide">
                <Link href="/content/orgos-install-setup" className="btn btn-primary btn-sm">
                  {g.orgosInstallGuideCta}
                </Link>
                <span className="page-muted-note">{g.orgosInstallGuideDesc}</span>
              </p>
            </article>
          </div>

          <div style={{ marginTop: "var(--space-6)" }}>
            <h3 className="section-title">{g.iso37000SectionTitle}</h3>
            <p className="page-desc">{g.iso37000SectionLead}</p>
            <p className="section-cta">
              <Link href="/content/iso-37000-orgos" className="btn btn-primary btn-sm">
                {g.iso37000SectionCta}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
