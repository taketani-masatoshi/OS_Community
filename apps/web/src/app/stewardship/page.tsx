import Link from "next/link";
import { getT } from "@/lib/i18n";

export default async function StewardshipPage() {
  const { messages: t } = await getT();
  const mp = t.mypage;

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{t.nav.modules}</h1>
          <p className="lf-hero-lead">{mp.personaCoderDesc}</p>
        </div>
      </section>

      <div className="page-wrap">
        <div className="lf-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            {t.purposes.find((p) => p.id === "stewardship")?.title ?? "Stewardship"}
          </h2>
          <p className="page-desc">
            {t.purposes.find((p) => p.id === "stewardship")?.body ??
              "Module maintainers steward human-readable rules per module."}
          </p>
          <p className="page-muted-note">
            <Link href="/content/stewardship-model" className="btn btn-primary btn-sm">
              {t.common.learnMore}
            </Link>
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/modules" className="btn btn-primary btn-sm">
            {mp.actionModules}
          </Link>
          <Link href="/certifications" className="btn btn-primary btn-sm">
            {t.nav.certification}
          </Link>
          <Link href="/wild-modules/register" className="btn btn-primary btn-sm">
            {mp.actionProposeModule}
          </Link>
        </div>
      </div>
    </>
  );
}
