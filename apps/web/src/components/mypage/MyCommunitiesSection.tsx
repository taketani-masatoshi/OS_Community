import Link from "next/link";
import {
  getCommitteeMemberRoleLabel,
  getCommitteeDisplayName,
  getCommitteeTypeLabel,
} from "@/lib/committees";
import type { UserCommunities } from "@/lib/user-communities";
import { getLabelMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";

type Props = {
  communities: UserCommunities;
  standardCommittee: {
    slug: string;
    name: string;
    type: "STANDARD" | "MODULE";
    domainKey: string | null;
  } | null;
};

export async function MyCommunitiesSection({ communities, standardCommittee }: Props) {
  const { locale, messages: t } = await getT();
  const roleLabels = getLabelMessages(locale).moduleRole;
  const { modules, standard } = communities;

  const isEmpty = modules.length === 0 && !standard;

  return (
    <section className="mypage-section">
      <h2 className="mypage-section-label">{t.mypage.participationTitle}</h2>

      {isEmpty ? (
        <>
          <p className="page-muted-note">{t.mypage.communitiesEmpty}</p>
          <p className="section-cta">
            <Link href="/modules" className="btn btn-primary btn-sm">
              {t.mypage.browseModules}
            </Link>
          </p>
        </>
      ) : (
        <div className="lf-card-grid">
          {standardCommittee && standard && (
            <Link href={`/committees/${standardCommittee.slug}`} className="lf-card-link-wrap">
              <div className="lf-card lf-card-full">
                <div className="card-badge-row">
                  <span className="badge badge-navy">{t.mypage.standardBadge}</span>
                  <span className="badge badge-success">
                    {getCommitteeMemberRoleLabel(standard.committeeRole, locale)}
                  </span>
                </div>
                <h3>{getCommitteeDisplayName(standardCommittee, locale)}</h3>
                <p className="page-muted-note">
                  {getCommitteeTypeLabel(standardCommittee.type, locale)}
                </p>
              </div>
            </Link>
          )}

          {modules.map((entry) => (
            <div key={entry.moduleSlug} className="lf-card lf-card-full">
              <div className="card-badge-row">
                <span className="badge badge-default">{t.mypage.moduleBadge}</span>
                {entry.moduleRole && (
                  <span className="badge badge-navy">
                    {roleLabels[entry.moduleRole] ?? entry.moduleRole}
                  </span>
                )}
                {entry.committeeRole && (
                  <span className="badge badge-success">
                    {getCommitteeMemberRoleLabel(entry.committeeRole, locale)}
                  </span>
                )}
              </div>
              <h3>
                <Link href={`/modules/${entry.moduleSlug}`}>{entry.moduleName}</Link>
              </h3>
              <p className="page-muted-note">
                {entry.moduleRole && (
                  <>
                    {t.mypage.moduleRoleLabel}: {roleLabels[entry.moduleRole]}
                  </>
                )}
                {entry.moduleRole && entry.committeeRole && " · "}
                {entry.committeeRole && (
                  <>
                    {t.mypage.committeeRoleLabel}:{" "}
                    {getCommitteeMemberRoleLabel(entry.committeeRole, locale)}
                  </>
                )}
              </p>
              {entry.committeeSlug && (
                <p className="page-muted-note" style={{ marginTop: "0.5rem" }}>
                  <Link href={`/committees/${entry.committeeSlug}`}>{t.nav.committees}</Link>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
