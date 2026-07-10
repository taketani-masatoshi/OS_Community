import Link from "next/link";
import type { CertificationStatus, CertificationType } from "@os-community/db";

type CertApplicationRow = {
  id: string;
  status: CertificationStatus;
  type: CertificationType;
  createdAt: Date;
};

export function MyPageCertApplicationsSection({
  applications,
  labels,
  typeLabels,
  statusLabel,
}: {
  applications: CertApplicationRow[];
  labels: {
    title: string;
    empty: string;
    applyLink: string;
  };
  typeLabels: Record<string, string>;
  statusLabel: (status: CertificationStatus) => string;
}) {
  return (
    <section className="mypage-panel">
      <h2 className="mypage-panel-title">{labels.title}</h2>
      {applications.length === 0 ? (
        <p className="mypage-panel-empty">
          {labels.empty}{" "}
          <Link href="/certifications/apply" className="btn btn-primary btn-sm">
            {labels.applyLink}
          </Link>
        </p>
      ) : (
        <ul className="mypage-status-list">
          {applications.map((app) => (
            <li key={app.id} className="mypage-status-item">
              <div className="mypage-status-main">
                <span className="mypage-status-link">{typeLabels[app.type] ?? app.type}</span>
              </div>
              <span
                className={`badge ${
                  app.status === "PENDING" || app.status === "UNDER_REVIEW"
                    ? "badge-warning"
                    : app.status === "APPROVED"
                      ? "badge-success"
                      : "badge-default"
                }`}
              >
                {statusLabel(app.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
