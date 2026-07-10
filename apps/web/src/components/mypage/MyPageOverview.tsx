import { fillTemplate } from "@/lib/i18n";
import type { AcademyDashboardSummary } from "@/lib/academy/progress-service";
import type { UserCommunities } from "@/lib/user-communities";

type Props = {
  communities: UserCommunities;
  academySummary: AcademyDashboardSummary | null;
  labels: {
    overviewTitle: string;
    statsCommittees: string;
    statsModuleRoles: string;
    statsAcademyLessons: string;
    statsCertificates: string;
  };
};

export function MyPageOverview({ communities, academySummary, labels }: Props) {
  const committeeCount =
    communities.modules.filter((m) => m.committeeRole !== null).length +
    (communities.standard ? 1 : 0);
  const moduleRoleCount = communities.modules.filter((m) => m.moduleRole !== null).length;

  const stats = [
    {
      key: "committees",
      value: fillTemplate(labels.statsCommittees, { count: String(committeeCount) }),
    },
    {
      key: "roles",
      value: fillTemplate(labels.statsModuleRoles, { count: String(moduleRoleCount) }),
    },
  ];

  if (academySummary && academySummary.totalLessons > 0) {
    stats.push({
      key: "academy",
      value: fillTemplate(labels.statsAcademyLessons, {
        completed: String(academySummary.completedLessons),
        total: String(academySummary.totalLessons),
      }),
    });
  }

  if (academySummary && academySummary.certificateCount > 0) {
    stats.push({
      key: "certs",
      value: fillTemplate(labels.statsCertificates, {
        count: String(academySummary.certificateCount),
      }),
    });
  }

  if (
    committeeCount === 0 &&
    moduleRoleCount === 0 &&
    (!academySummary || (academySummary.completedLessons === 0 && academySummary.certificateCount === 0))
  ) {
    return null;
  }

  return (
    <section className="mypage-section">
      <h2 className="section-title">{labels.overviewTitle}</h2>
      <div className="mypage-overview-grid">
        {stats.map((stat) => (
          <div key={stat.key} className="lf-card mypage-stat-card">
            <p className="mypage-stat-value">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
