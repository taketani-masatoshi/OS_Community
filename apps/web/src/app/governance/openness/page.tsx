import Link from "next/link";
import { getT } from "@/lib/i18n";

export default async function OpennessPolicyPage() {
  const { messages: t } = await getT();
  const p = t.opennessPolicy;

  return (
    <>
      <section className="lf-hero" style={{ padding: "3rem 1.5rem" }}>
        <div className="lf-hero-inner">
          <Link href="/governance" className="hero-back-link">
            ← {t.governance.title}
          </Link>
          <h1 style={{ fontSize: "2rem", marginTop: "0.75rem" }}>{p.title}</h1>
          <p className="lf-hero-lead">{p.subtitle}</p>
        </div>
      </section>

      <div className="page-wrap openness-policy">
        <section className="openness-section">
          <h2 className="section-title">{p.philosophyTitle}</h2>
          <p className="openness-lead">{p.philosophyLead}</p>
          <blockquote className="openness-quote">{p.philosophyGoal}</blockquote>
        </section>

        <div className="openness-domain-grid">
          <section className="openness-domain-card openness-domain-standardize">
            <h2 className="section-title">{p.standardizeTitle}</h2>
            <p className="page-desc">{p.standardizeIntro}</p>
            <ul className="openness-item-list">
              {p.standardizeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="openness-domain-card openness-domain-protected">
            <h2 className="section-title">{p.nonStandardizeTitle}</h2>
            <p className="page-desc">{p.nonStandardizeIntro}</p>
            <ul className="openness-item-list">
              {p.nonStandardizeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="openness-section">
          <h2 className="section-title">{p.privateModuleTitle}</h2>
          <p className="page-desc">{p.privateModuleIntro}</p>
          <div className="lf-card-grid" style={{ maxWidth: 640 }}>
            {p.privateModuleTypes.map((mod) => (
              <div key={mod.label} className="lf-card">
                <span className="badge badge-navy">{mod.label}</span>
                <p style={{ marginTop: "0.75rem", color: "var(--muted)" }}>{mod.desc}</p>
              </div>
            ))}
          </div>
          <p className="page-muted-note" style={{ marginTop: "1rem" }}>
            {p.privateModuleNote}
          </p>
        </section>

        <section className="openness-section">
          <h2 className="section-title">{p.principlesTitle}</h2>
          <div className="openness-principles-compare">
            <p className="openness-principle-not">{p.principlesNot}</p>
            <p className="openness-principle-yes">{p.principlesYes}</p>
          </div>
        </section>

        <section className="openness-section openness-message">
          <h2 className="section-title">{p.messageTitle}</h2>
          <p className="openness-lead">{p.messageLead}</p>
          <p className="page-desc">{p.messageSame}</p>
          <h3 className="openness-subheading">{p.messageProtectedTitle}</h3>
          <div className="openness-protected-tags">
            {p.messageProtectedItems.map((item) => (
              <span key={item} className="badge badge-navy" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                {item}
              </span>
            ))}
          </div>
          <p className="openness-lead" style={{ marginTop: "1.25rem" }}>
            {p.messageBody}
          </p>
          <p className="page-desc">{p.messageClosing}</p>
        </section>

        <section className="openness-tagline-block">
          <p className="openness-tagline-not">{p.taglineNot}</p>
          <p className="openness-tagline-yes">{p.taglineYes}</p>
        </section>

        <p className="section-cta" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/standards" className="btn btn-primary btn-sm">
            {t.nav.standards}
          </Link>
          <Link href="/modules" className="btn btn-primary btn-sm">
            {t.nav.modules}
          </Link>
          <Link href="/content/openness-policy" className="btn btn-primary btn-sm">
            {t.common.learnMore}
          </Link>
        </p>
      </div>
    </>
  );
}
