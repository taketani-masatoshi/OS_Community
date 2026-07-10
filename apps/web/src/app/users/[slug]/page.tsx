import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getLabelMessages,
  getPageMessages,
  localeToBcp47,
} from "@os-community/shared";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n";
import {
  resolveUserBySlug,
  getUserPublicProfile,
  isFounderProfile,
  isFounderUser,
  getCanonicalProfileSlug,
} from "@/lib/users";
import {
  getCommitteeDisplayName,
  getCommitteeTypeLabel,
  getCommitteeMemberRoleLabel,
} from "@/lib/committees";

export default async function UserProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale, messages: t } = await getT();
  const u = t.userPages;
  const ui = getPageMessages(locale).ui;
  const a = getPageMessages(locale).academy;
  const labels = getLabelMessages(locale);

  const user = await resolveUserBySlug(slug);
  if (!user) notFound();

  const canonicalSlug = getCanonicalProfileSlug(user);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/users/${canonicalSlug}`);
  }

  const session = await auth();
  const isOwnProfile = session?.user?.id === user.id;
  const s = t.settings;

  const { memberships, moduleRoles, certifications, wildModules, professionalProfile, githubConnections } =
    await getUserPublicProfile(user.id);
  const founder = isFounderProfile(slug) || isFounderUser(user);

  const maintainers = moduleRoles.filter((r) => r.role === "MAINTAINER");
  const contributors = moduleRoles.filter((r) => r.role === "CONTRIBUTOR");

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <div className="user-profile-header">
            {user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="user-profile-avatar" width={72} height={72} />
            )}
            <div>
              <div className="card-badge-row">
                {founder && <span className="badge badge-navy">{u.founderBadge}</span>}
                <span className="badge badge-default">{user.siteRole}</span>
              </div>
              <h1 className="lf-hero-title-sm">{user.name ?? user.githubLogin ?? slug}</h1>
              {user.githubLogin && (
                <p className="lf-hero-lead" style={{ marginBottom: "0.25rem" }}>
                  @{user.githubLogin}
                </p>
              )}
              <p className="page-muted-note" style={{ color: "var(--hero-muted)" }}>
                {u.memberSince}:{" "}
                {user.createdAt.toLocaleDateString(localeToBcp47(locale))}
              </p>
              {(user.specialty || user.region) && (
                <p className="lf-hero-lead" style={{ fontSize: "1rem", marginTop: "0.5rem" }}>
                  {[user.specialty, user.region, user.organization].filter(Boolean).join(" · ")}
                </p>
              )}
              {user.bio && (
                <p className="page-muted-note" style={{ color: "var(--hero-muted)", marginTop: "0.5rem" }}>
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="page-wrap">
        {isOwnProfile && (
          <div className="mypage-alert" style={{ marginBottom: "1.5rem" }}>
            <p>{u.profileOwnBanner}</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Link href="/settings/profile" className="btn btn-primary btn-sm">
                {u.profileEditSettings}
              </Link>
              <Link href="/settings/connections" className="btn btn-primary btn-sm">
                {s.connections}
              </Link>
              <Link href="/mypage" className="btn btn-primary btn-sm">
                {u.profileAccountHome}
              </Link>
            </div>
          </div>
        )}

        <div className="profile-layers-grid" style={{ marginBottom: "2rem" }}>
          {professionalProfile && (
            <section className="lf-card profile-layer-card">
              <h2 className="subsection-title" style={{ marginTop: 0 }}>
                {s.layerProfessionalTitle}
              </h2>
              {professionalProfile.headline && <p>{professionalProfile.headline}</p>}
              {professionalProfile.organization && (
                <p className="page-muted-note">{professionalProfile.organization}</p>
              )}
              {professionalProfile.profileUrl && (
                <p>
                  <a href={professionalProfile.profileUrl} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </p>
              )}
            </section>
          )}

          {(user.githubLogin || githubConnections.length > 0) && (
            <section className="lf-card profile-layer-card">
              <h2 className="subsection-title" style={{ marginTop: 0 }}>
                {s.layerTechnicalTitle}
              </h2>
              {user.githubLogin && (
                <p className="page-muted-note">
                  {s.layerTechnicalLogin}: @{user.githubLogin}
                </p>
              )}
              {githubConnections.length > 0 ? (
                <ul className="mypage-status-list">
                  {githubConnections.map((c) => (
                    <li key={c.id}>
                      <a href={c.repoUrl} target="_blank" rel="noopener noreferrer">
                        {c.repoOwner}/{c.repoName}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="page-muted-note">{s.layerTechnicalEmpty}</p>
              )}
            </section>
          )}
        </div>

        <section className="membership-policy-callout">
          <h2 className="section-title" style={{ marginTop: 0 }}>
            {u.relationshipTitle}
          </h2>
          <p style={{ marginBottom: 0 }}>{u.relationshipBody}</p>
        </section>

        <section className="mypage-section">
          <h2 className="section-title">{u.committeesTitle}</h2>
          <p className="page-desc">{u.committeesDesc}</p>
          {memberships.length === 0 ? (
            <p className="page-muted-note">{u.committeesEmpty}</p>
          ) : (
            <div className="lf-card-grid">
              {memberships.map((m) => (
                <div key={m.id} className="lf-card">
                  <span className="badge badge-success">{getCommitteeMemberRoleLabel(m.role, locale)}</span>
                  <h3>{getCommitteeDisplayName(m.committee, locale)}</h3>
                  <p className="page-muted-note">{getCommitteeTypeLabel(m.committee.type, locale)}</p>
                  {m.committee.module && (
                    <Link href={`/modules/${m.committee.module.slug}`} className="btn btn-primary btn-sm">
                      {u.viewModule}
                    </Link>
                  )}
                  <Link href={`/committees/${m.committee.slug}`} className="btn btn-primary btn-sm">
                    {t.mypage.viewCommittee}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mypage-section">
          <h2 className="section-title">{u.moduleRolesTitle}</h2>
          <p className="page-desc">{u.moduleRolesDesc}</p>
          {moduleRoles.length === 0 ? (
            <p className="page-muted-note">{u.moduleRolesEmpty}</p>
          ) : (
            <>
              {maintainers.length > 0 && (
                <>
                  <h3 className="subsection-title">{u.maintainerRole}</h3>
                  <table className="lf-table" style={{ marginBottom: "1.5rem" }}>
                    <thead>
                      <tr>
                        <th>{t.nav.modules}</th>
                        <th>{ui.role}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintainers.map((mr) => (
                        <tr key={mr.id}>
                          <td>{mr.module.name}</td>
                          <td>
                            <span className="badge badge-navy">{labels.moduleRole.MAINTAINER}</span>
                          </td>
                          <td>
                            <Link href={`/modules/${mr.module.slug}`}>{u.viewModule}</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {contributors.length > 0 && (
                <>
                  <h3 className="subsection-title">{u.contributorRole}</h3>
                  <table className="lf-table">
                    <thead>
                      <tr>
                        <th>{t.nav.modules}</th>
                        <th>{ui.role}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributors.map((mr) => (
                        <tr key={mr.id}>
                          <td>{mr.module.name}</td>
                          <td>
                            <span className="badge badge-default">{labels.moduleRole.CONTRIBUTOR}</span>
                          </td>
                          <td>
                            <Link href={`/modules/${mr.module.slug}`}>{u.viewModule}</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </section>

        <section className="mypage-section">
          <h2 className="section-title">{u.certificationsTitle}</h2>
          <p className="page-desc">{u.certificationsDesc}</p>
          {certifications.length === 0 ? (
            <p className="page-muted-note">{u.certificationsEmpty}</p>
          ) : (
            <table className="lf-table">
              <thead>
                <tr>
                  <th>{t.nav.certification}</th>
                  <th>{a.certNo}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {certifications.map((c) => (
                  <tr key={c.id}>
                    <td>{labels.certification[c.type] ?? c.type}</td>
                    <td>
                      <code>{c.certificateNo}</code>
                    </td>
                    <td>
                      <Link href={`/certifications/verify/${c.certificateNo}`}>{u.verifyCert}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {wildModules.length > 0 && (
          <section className="mypage-section">
            <h2 className="section-title">{u.wildModulesTitle}</h2>
            <p className="page-desc">{u.wildModulesDesc}</p>
            <table className="lf-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Author</th>
                  <th>Repo</th>
                </tr>
              </thead>
              <tbody>
                {wildModules.map((w) => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td>{w.authorName}</td>
                    <td>
                      <a href={w.repoUrl} target="_blank" rel="noopener noreferrer">
                        {w.slug}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </>
  );
}
