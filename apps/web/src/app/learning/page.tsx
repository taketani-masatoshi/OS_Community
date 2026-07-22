import Link from "next/link";
import { auth } from "@/auth";
import { getPageMessages } from "@os-community/shared";
import { Badge } from "@/components/ui";
import { LearningGuidesSection } from "@/components/learning/LearningGuidesSection";
import { getAcademyClient, AcademyConfigError } from "@/lib/academy/server-client";
import { getAcademyDashboard } from "@/lib/academy/progress-service";
import { checkAcademyHealth } from "@/lib/academy/health";
import { getContentById } from "@/lib/content";
import { getT } from "@/lib/i18n";

export const revalidate = 3600;

export default async function LearningPage() {
  const session = await auth();
  const { locale, messages: t } = await getT();
  const p = getPageMessages(locale);

  let tracks: Awaited<ReturnType<ReturnType<typeof getAcademyClient>["getTracks"]>> = [];
  let academyError: string | null = null;
  const academyHealth = await checkAcademyHealth();
  const academyDisconnected = !academyHealth.configured || !academyHealth.reachable;

  try {
    tracks = await getAcademyClient().getTracks();
  } catch (error) {
    if (error instanceof AcademyConfigError) {
      academyError = error.message;
    } else if (error && typeof error === "object" && "message" in error) {
      academyError = String((error as { message: string }).message);
    } else {
      academyError = t.learning.academyUnavailable;
    }
  }

  const dashboard =
    session?.user?.id != null
      ? await getAcademyDashboard(session.user.id).catch(() => null)
      : null;

  const moduleAgentDoc = getContentById("module-and-agent", locale);
  const designPhilosophyDoc = getContentById("design-philosophy", locale);
  const implementationStatusDoc = getContentById("implementation-status", locale);
  const iso37000Doc = getContentById("iso-37000-orgos", locale);

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{t.learning.title}</h1>
          <p className="lf-hero-lead">{t.learning.desc}</p>
          {!session?.user && (
            <Link href="/login?callbackUrl=/learning" className="btn btn-outline-light btn-sm">
              {t.nav.signIn}
            </Link>
          )}
        </div>
      </section>

      <div className="page-wrap">
        {dashboard?.continueTrack && (
          <div className="mypage-alert" style={{ marginBottom: "1.5rem" }}>
            <p>
              {t.learning.continueLabel}: <strong>{dashboard.continueTrack.lessonTitle}</strong>
            </p>
            <Link
              href={`/academy/lessons/${dashboard.continueTrack.lessonId}`}
              className="btn btn-primary btn-sm"
            >
              {t.learning.continueCta}
            </Link>
          </div>
        )}

        <section id="about-orgos" className="mypage-section learning-overview">
          <h2 className="section-title">{t.learning.orgosOverviewTitle}</h2>
          <p className="page-desc">{t.learning.orgosOverviewP1}</p>
          <p className="page-desc">{t.learning.orgosOverviewP2}</p>
          <p className="page-desc">{t.learning.orgosOverviewP3}</p>
          <p className="page-desc">{t.learning.orgosOverviewP4}</p>
          {designPhilosophyDoc && (
            <p className="learning-related-links">
              <Link href={`/content/${designPhilosophyDoc.meta.id}`}>{designPhilosophyDoc.meta.title}</Link>
              {designPhilosophyDoc.description ? ` — ${designPhilosophyDoc.description}` : null}
            </p>
          )}
          {moduleAgentDoc && (
            <p className="learning-related-links">
              <Link href={`/content/${moduleAgentDoc.meta.id}`}>{moduleAgentDoc.meta.title}</Link>
              {moduleAgentDoc.description ? ` — ${moduleAgentDoc.description}` : null}
            </p>
          )}
          {implementationStatusDoc && (
            <p className="learning-related-links">
              <Link href={`/content/${implementationStatusDoc.meta.id}`}>{implementationStatusDoc.meta.title}</Link>
              {implementationStatusDoc.description ? ` — ${implementationStatusDoc.description}` : null}
            </p>
          )}
          {iso37000Doc && (
            <p className="learning-related-links">
              <Link href={`/content/${iso37000Doc.meta.id}`}>{iso37000Doc.meta.title}</Link>
              {iso37000Doc.description ? ` — ${iso37000Doc.description}` : null}
            </p>
          )}
        </section>

        <LearningGuidesSection
          locale={locale}
          labels={{
            section: t.learning.guidesSection,
            desc: t.learning.guidesDesc,
            readCta: t.learning.guideReadCta,
          }}
        />

        <section id="curriculum" className="mypage-section">
          <h2 className="section-title">{t.learning.academySection}</h2>
          <p className="page-desc">{t.learning.academyDesc}</p>

          {academyDisconnected && (
            <div className="mypage-alert" role="status" style={{ marginBottom: "var(--space-4)" }}>
              <p>
                {!academyHealth.configured
                  ? t.learning.academyNotConfigured
                  : academyError ?? t.learning.academyUnavailable}
              </p>
            </div>
          )}

          {!academyDisconnected && academyError ? (
            <p className="page-muted-note">{academyError}</p>
          ) : !academyDisconnected && tracks.length === 0 ? (
            <p className="page-muted-note">{t.learning.academyEmpty}</p>
          ) : !academyDisconnected ? (
            <div className="lf-card-grid" style={{ marginTop: "1rem" }}>
              {tracks.map((track) => (
                <Link key={track.id} href={`/academy/tracks/${track.id}`} className="lf-card-link-wrap">
                  <div className="lf-card lf-card-full">
                    <h3>{`${p.academy.levelPrefix} ${track.level}: ${track.name}`}</h3>
                    <p style={{ marginBottom: "0.75rem", color: "var(--muted)" }}>{track.description}</p>
                    <Badge variant="navy">
                      {track.modules.length} {p.ui.module}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        <p className="section-cta">
          <Link href="/governance" className="btn btn-primary btn-sm">
            {t.nav.governance}
          </Link>
          <Link href="/committees" className="btn btn-primary btn-sm">
            {t.nav.committees}
          </Link>
          <Link href="/certifications" className="btn btn-primary btn-sm">
            {t.learn.certification}
          </Link>
        </p>
      </div>
    </>
  );
}
