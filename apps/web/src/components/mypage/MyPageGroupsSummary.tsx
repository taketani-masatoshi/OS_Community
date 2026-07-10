import Link from "next/link";
import { fillTemplate } from "@/lib/i18n";
import type { UserCommunities } from "@/lib/user-communities";

type Props = {
  communities: UserCommunities;
  publicProfileHref: string | null;
  wildModuleCount?: number;
  labels: {
    title: string;
    body: string;
    empty: string;
    browseModules: string;
    viewPublicProfile: string;
    statsCommittees: string;
    statsModuleRoles: string;
    statsWildModules?: string;
  };
};

export function MyPageGroupsSummary({ communities, publicProfileHref, wildModuleCount = 0, labels }: Props) {
  const committeeCount =
    communities.modules.filter((m) => m.committeeRole !== null).length +
    (communities.standard ? 1 : 0);
  const moduleRoleCount = communities.modules.filter((m) => m.moduleRole !== null).length;
  const isEmpty = committeeCount === 0 && moduleRoleCount === 0;

  return (
    <section className="mypage-section">
      <div className="mypage-section-header">
        <h2 className="mypage-section-label">{labels.title}</h2>
        {publicProfileHref && !isEmpty && (
          <Link href={publicProfileHref} className="btn btn-primary btn-sm">
            {labels.viewPublicProfile}
          </Link>
        )}
      </div>
      <p className="page-desc">{labels.body}</p>

      {isEmpty ? (
        <p className="page-muted-note">
          {labels.empty}{" "}
          <Link href="/modules" className="btn btn-primary btn-sm">
            {labels.browseModules}
          </Link>
        </p>
      ) : (
        <div className="mypage-overview-grid">
          {committeeCount > 0 && (
            <div className="lf-card mypage-stat-card">
              <p className="mypage-stat-value">
                {fillTemplate(labels.statsCommittees, { count: String(committeeCount) })}
              </p>
            </div>
          )}
          {moduleRoleCount > 0 && (
            <div className="lf-card mypage-stat-card">
              <p className="mypage-stat-value">
                {fillTemplate(labels.statsModuleRoles, { count: String(moduleRoleCount) })}
              </p>
            </div>
          )}
          {wildModuleCount > 0 && labels.statsWildModules && (
            <div className="lf-card mypage-stat-card">
              <p className="mypage-stat-value">
                {fillTemplate(labels.statsWildModules, { count: String(wildModuleCount) })}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
