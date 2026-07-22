import Link from "next/link";
import { getCommunityStats } from "@/lib/community-stats";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n";
import { isSignedInSession } from "@/lib/session-display";

/** Stats are DB-backed; never bake a stale homepage shell. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const isSignedIn = isSignedInSession(session);
  const { messages: t } = await getT();
  const h = t.home;
  let stats = {
    moduleCount: 0,
    maintainerCount: 0,
    contributorCount: 0,
    certCount: 0,
    committeeCount: 0,
    agentCount: 0,
  };

  try {
    stats = await getCommunityStats();
  } catch {
    /* DB unavailable */
  }

  const { moduleCount, maintainerCount, contributorCount, certCount, committeeCount, agentCount } =
    stats;
  const whyPoints = h.ehrMetaphorPoints.slice(0, 3);

  const statItems = [
    { value: moduleCount, label: h.statModules, desc: h.statModulesDesc },
    { value: maintainerCount, label: h.statMaintainers, desc: h.statMaintainersDesc },
    { value: contributorCount, label: h.statContributors, desc: h.statContributorsDesc },
    { value: committeeCount, label: h.statCommittees, desc: h.statCommitteesDesc },
    { value: agentCount, label: h.statAgents, desc: h.statAgentsDesc },
    { value: certCount, label: h.statCertified, desc: h.statCertifiedDesc },
  ];

  const exploreLinks = [
    { href: "/about", title: h.linkAbout },
    { href: "/standards", title: h.linkStandards },
    { href: "/committees", title: h.linkCommittees },
    { href: "/agents", title: h.linkAgents },
    { href: "/governance", title: h.linkGovernance },
  ];

  const startCards = [
    { href: "/modules#registry", title: h.cardContributorTitle, body: h.cardContributorBody },
    { href: "/github", title: h.cardGithubTitle, body: h.cardGithubBody },
    { href: "/learning", title: h.cardLearnTitle, body: h.cardLearnBody },
  ];

  return (
    <>
      <section className="lf-hero lf-hero-decorated">
        <div className="lf-hero-inner">
          <h1>
            {t.brand.tagline}
            <em>{t.brand.taglineSub}</em>
          </h1>
          <p className="lf-hero-lead">{t.brand.mission}</p>
          <div className="lf-hero-actions lf-hero-actions-primary">
            <Link href="/getting-started" className="btn btn-primary btn-lg btn-block-mobile">
              {h.primaryCta}
            </Link>
          </div>
          {!isSignedIn && (
            <p className="lf-hero-subcta">
              {h.primaryCtaSub}{" "}
              <Link href="/login?callbackUrl=/getting-started" className="hero-inline-link">
                {t.nav.signIn}
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="lf-stats">
        <div className="lf-stats-inner">
          {statItems.map((item) => (
            <div key={item.label} className="lf-stat-item">
              <div className="lf-stat-value">{item.value || "—"}</div>
              <div className="lf-stat-label">{item.label}</div>
              <div className="lf-stat-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="lf-section lf-section-ehr">
        <div className="lf-section-inner">
          <h2 className="lf-section-title">{h.whyTitle}</h2>
          <p className="lf-section-sub">{h.ehrMetaphorLead}</p>
          <div className="ehr-metaphor-grid">
            {whyPoints.map((point) => (
              <div key={point.id} className="ehr-metaphor-card">
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </div>
            ))}
          </div>
          <p className="section-cta">
            <Link href="/about" className="btn btn-primary btn-sm">
              {h.ehrMetaphorCta}
            </Link>
          </p>
        </div>
      </section>

      <section className="lf-section">
        <div className="lf-section-inner">
          <h2 className="lf-section-title">{h.startTitle}</h2>
          <p className="lf-section-sub">{h.gettingStartedSub}</p>
          <p className="section-cta" style={{ marginBottom: "1.5rem" }}>
            <Link href="/getting-started" className="btn btn-primary btn-sm">
              {t.nav.gettingStarted}
            </Link>
          </p>
          <div className="lf-card-grid">
            {startCards.map((card) => (
              <Link key={card.href} href={card.href} className="lf-card-link-wrap">
                <div className="lf-card module-card-accent lf-card-full">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="lf-section lf-section-alt">
        <div className="lf-section-inner">
          <h2 className="lf-section-title">{h.exploreTitle}</h2>
          <div className="lf-card-grid">
            {exploreLinks.map((link) => (
              <Link key={link.href} href={link.href} className="lf-card-link-wrap">
                <div className="lf-card lf-card-full">
                  <h3>{link.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
