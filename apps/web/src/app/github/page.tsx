import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getFormMessages, getPageMessages } from "@os-community/shared";
import { getT, getLocale } from "@/lib/i18n";
import { GitHubConnectForm } from "@/components/GitHubConnectForm";
import { GitHubProvisionButton } from "@/components/GitHubProvisionButton";
import { isGitHubAppConfigured } from "@/lib/github-app";

export default async function GitHubPage() {
  const session = await auth();
  const locale = await getLocale();
  const { messages: t } = await getT();
  const forms = getFormMessages(locale);
  const ui = getPageMessages(locale).ui;
  const phaseBEnabled = isGitHubAppConfigured();
  const connections = session?.user
    ? await prisma.gitHubConnection.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{t.github.title}</h1>
          <p className="lf-hero-lead">{t.github.publicLead}</p>
          {session?.user ? (
            <a href="#connect" className="btn btn-primary btn-sm">
              {t.github.connectRepo}
            </a>
          ) : (
            <Link href="/login/start?callbackUrl=/github" className="btn btn-primary btn-sm">
              {t.github.signInButton}
            </Link>
          )}
        </div>
      </section>

      <div className="page-wrap">
        <div className="lf-card" style={{ marginBottom: "1.5rem" }}>
          <p className="page-desc">{t.github.desc}</p>
          <ul className="list-muted">
            {t.github.publicBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {session?.user ? (
          <>
            <div id="connect" className="lf-card">
              <h3 className="section-title" style={{ marginTop: 0 }}>
                {t.github.connectRepo}
              </h3>
              <GitHubConnectForm labels={forms.githubConnect} />
            </div>
            {connections.length > 0 && (
              <section style={{ marginTop: "1.5rem" }}>
                <h2 className="section-title">{t.github.connected}</h2>
                {connections.map((c) => (
                  <div key={c.id} className="lf-card">
                    <a href={c.repoUrl} target="_blank" rel="noopener noreferrer">
                      {c.repoOwner}/{c.repoName}
                    </a>
                    {c.isDefault && (
                      <span className="badge badge-success" style={{ marginLeft: "0.5rem" }}>
                        {ui.default}
                      </span>
                    )}
                  </div>
                ))}
              </section>
            )}
            <div className="lf-card" style={{ marginTop: "1.5rem" }}>
              <h3 className="section-title" style={{ marginTop: 0 }}>
                {t.github.proposeWildModule}
              </h3>
              <p className="page-muted-note">{t.github.proposeWildModuleDesc}</p>
              <Link href="/wild-modules/register" className="btn btn-primary btn-sm">
                {t.github.proposeWildModule}
              </Link>
            </div>
          </>
        ) : (
          <div className="lf-card github-cta-box">
            <p style={{ margin: "0 0 1rem", fontSize: "1rem" }}>{t.github.signInCta}</p>
            <Link href="/login/start?callbackUrl=/github" className="btn btn-primary btn-sm">
              {t.github.signInButton}
            </Link>
          </div>
        )}

        <details className="mypage-details github-developer-details" style={{ marginTop: "1.5rem" }}>
          <summary className="mypage-details-summary">{t.github.developerSectionTitle}</summary>
          <div className="mypage-details-body">
            <p className="page-muted-note">{t.github.developerSectionHint}</p>
            <h3>{t.github.modelTitle}</h3>
            <ul className="list-muted">
              {t.github.modelItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {phaseBEnabled && <p className="page-muted-note">{t.github.phaseBActive}</p>}
            {phaseBEnabled && session?.user && (
              <>
                <p style={{ marginTop: "1rem" }}>
                  <Link href="/api/github/install" className="btn btn-primary btn-sm">
                    {t.github.installApp}
                  </Link>
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <p className="page-muted-note">{t.github.provisionDesc}</p>
                  <GitHubProvisionButton label={t.github.provisionCta} />
                </div>
              </>
            )}
            <p className="page-muted-note" style={{ marginTop: "1rem" }}>
              manifest sync: <code>npm run sync:modules</code>
              <br />
              {t.github.syncAgentsHint} <code>npm run sync:agents</code>
            </p>
          </div>
        </details>

        <p className="section-cta">
          <Link href="/modules" className="btn btn-primary btn-sm">
            {t.github.moduleRegistry}
          </Link>
        </p>
      </div>
    </>
  );
}
