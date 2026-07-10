import Link from "next/link";
import type { CommitteeMembershipDesiredRole, RoleRequestStatus } from "@os-community/db";

type CommitteeRequestRow = {
  id: string;
  desiredRole: CommitteeMembershipDesiredRole;
  status: RoleRequestStatus;
  committee: { slug: string; name: string };
};

export function MyPageCommitteeRequestsSection({
  requests,
  labels,
  roleLabels,
  statusLabel,
}: {
  requests: CommitteeRequestRow[];
  labels: {
    title: string;
    empty: string;
    applyLink: string;
  };
  roleLabels: Record<string, string>;
  statusLabel: (status: RoleRequestStatus) => string;
}) {
  return (
    <section className="mypage-panel">
      <h2 className="mypage-panel-title">{labels.title}</h2>
      {requests.length === 0 ? (
        <p className="mypage-panel-empty">
          {labels.empty}{" "}
          <Link href="/committees" className="btn btn-primary btn-sm">
            {labels.applyLink}
          </Link>
        </p>
      ) : (
        <ul className="mypage-status-list">
          {requests.map((req) => (
            <li key={req.id} className="mypage-status-item">
              <div className="mypage-status-main">
                <Link href={`/committees/${req.committee.slug}`} className="mypage-status-link">
                  {req.committee.name}
                </Link>
                <span className="badge badge-default">
                  {roleLabels[req.desiredRole] ?? req.desiredRole}
                </span>
              </div>
              <span
                className={`badge ${
                  req.status === "PENDING"
                    ? "badge-warning"
                    : req.status === "APPROVED"
                      ? "badge-success"
                      : "badge-default"
                }`}
              >
                {statusLabel(req.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
