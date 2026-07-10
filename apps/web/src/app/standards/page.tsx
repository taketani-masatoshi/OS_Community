import Link from "next/link";
import { LifecyclePipeline } from "@/components/LifecyclePipeline";
import {
  MODULE_LIFECYCLE,
  READINESS_TO_LIFECYCLE,
  getLocalized,
  getPageMessages,
  type LifecycleStage,
  type Locale,
} from "@os-community/shared";
import { getT } from "@/lib/i18n";
import { readinessTierLabel } from "@/lib/readiness-tier-label";

function lifecycleStageLabel(stage: string, locale: Locale): string {
  const match = MODULE_LIFECYCLE.find((s) => s.stage === stage);
  return match ? getLocalized(match.name, locale) : stage;
}

export default async function StandardsPage() {
  const { locale, messages: t } = await getT();
  const p = getPageMessages(locale);
  const s = p.standards;
  const protocolPurpose = t.purposes.find((purpose) => purpose.id === "protocol");

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{t.home.lifecycleCta}</h1>
          <p className="lf-hero-lead">{t.home.lifecycleSub}</p>
        </div>
      </section>

      <div className="page-wrap">
        <h2 id="lifecycle" className="section-title">
          {t.home.lifecycleTitle}
        </h2>
        <p className="page-desc">{t.home.lifecycleSub}</p>
        <LifecyclePipeline locale={locale} />

        <table className="lf-table" style={{ marginTop: "2rem" }}>
          <thead>
            <tr>
              <th>{s.stageHeader}</th>
              <th>{t.nav.standards}</th>
              <th>{t.common.learnMore}</th>
            </tr>
          </thead>
          <tbody>
            {MODULE_LIFECYCLE.map((stage) => (
              <tr key={stage.stage}>
                <td>
                  <span className="badge badge-default">{getLocalized(stage.name, locale)}</span>
                </td>
                <td>{getLocalized(stage.name, locale)}</td>
                <td>{getLocalized(stage.desc, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {protocolPurpose && (
          <>
            <h2 className="section-title">{protocolPurpose.title}</h2>
            <p className="page-desc">{protocolPurpose.body}</p>
          </>
        )}

        <div className="membership-policy-callout">
          <h3 className="membership-policy-callout-title">{t.opennessPolicy.standardizeTitle}</h3>
          <p>{t.opennessPolicy.philosophyLead}</p>
          <p style={{ marginBottom: 0 }}>{t.opennessPolicy.taglineYes}</p>
          <p className="section-cta" style={{ marginTop: "0.75rem" }}>
            <Link href="/governance/openness" className="btn btn-primary btn-sm">
              {t.governance.ctaOpenness}
            </Link>
          </p>
        </div>

        <h2 className="section-title">{s.readinessTitle}</h2>
        <table className="lf-table">
          <thead>
            <tr>
              <th>{s.stewardTierHeader}</th>
              <th>{s.lifecycleStageHeader}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(READINESS_TO_LIFECYCLE).map(([tier, stage]) => (
              <tr key={tier}>
                <td>{readinessTierLabel(s.readinessTiers, tier)}</td>
                <td>{lifecycleStageLabel(stage as LifecycleStage, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="section-cta">
          <Link href="/committees/openorgos-standard" className="btn btn-primary btn-sm">
            {t.committeesPage.standardSection}
          </Link>
          <Link href="/modules" className="btn btn-primary btn-sm" style={{ marginLeft: "0.5rem" }}>
            {t.nav.modules}
          </Link>
        </p>
      </div>
    </>
  );
}
