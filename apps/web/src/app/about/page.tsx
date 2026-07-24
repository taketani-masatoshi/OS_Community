import Link from "next/link";
import { MarkdownContent } from "@/components/MarkdownContent";
import { getContentById } from "@/lib/content";
import { getT, getLocale } from "@/lib/i18n";
import { getPageMessages } from "@os-community/shared";

export default async function AboutPage() {
  const { messages: t } = await getT();
  const locale = await getLocale();
  const lp = getPageMessages(locale).leadership;
  const mission = getContentById("mission", locale);
  const designPhilosophyDoc = getContentById("design-philosophy", locale);
  const implementationStatusDoc = getContentById("implementation-status", locale);
  const iso37000Doc = getContentById("iso-37000-orgos", locale);
  const a = t.about;

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <Link href="/" className="hero-back-link">
            {t.common.backHome}
          </Link>
          <h1 className="lf-hero-title-sm">{a.title}</h1>
          <p className="lf-hero-lead">{a.lead}</p>
        </div>
      </section>

      <div className="about-page">
        <div className="about-page-inner page-wrap">
          <aside className="about-vision-panel" aria-label={a.visionTitle}>
            <p className="about-vision-kicker">{a.visionTitle}</p>
            <blockquote className="about-vision-quote">{a.visionQuote}</blockquote>
          </aside>

          {mission && (
            <article className="about-prose">
              <MarkdownContent content={mission.content} />
            </article>
          )}

          <section className="about-section" aria-labelledby="about-principles-heading">
            <h2 id="about-principles-heading" className="about-section-title">
              {t.home.principlesTitle}
            </h2>
            <div className="about-principles-grid">
              {t.principles.map((p) => (
                <div key={p.id} className="about-principle-card">
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="about-section" aria-labelledby="about-values-heading">
            <h2 id="about-values-heading" className="about-section-title">
              {t.home.valuesTitle}
            </h2>
            <ul className="about-values">
              {t.values.map((v) => (
                <li key={v.labelEn}>
                  <span className="about-value-label">{v.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <nav className="about-actions" aria-label={a.title}>
            <Link href="/about/leadership" className="btn btn-primary btn-sm">
              {lp.title}
            </Link>
            <Link href="/governance" className="btn btn-ghost btn-sm">
              {a.governanceCta}
            </Link>
            <Link href="/governance/openness" className="btn btn-ghost btn-sm">
              {t.governance.ctaOpenness}
            </Link>
            {designPhilosophyDoc && (
              <Link href={`/content/${designPhilosophyDoc.meta.id}`} className="btn btn-ghost btn-sm">
                {designPhilosophyDoc.meta.title}
              </Link>
            )}
            {implementationStatusDoc && (
              <Link href={`/content/${implementationStatusDoc.meta.id}`} className="btn btn-ghost btn-sm">
                {implementationStatusDoc.meta.title}
              </Link>
            )}
            {iso37000Doc && (
              <Link href={`/content/${iso37000Doc.meta.id}`} className="btn btn-ghost btn-sm">
                {iso37000Doc.meta.title}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
