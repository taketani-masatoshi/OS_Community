import Link from "next/link";
import type { ModuleRoleType, RoleRequestStatus } from "@os-community/db";

type RoleRequestRow = {
  id: string;
  status: RoleRequestStatus;
  role: ModuleRoleType;
  module: { slug: string; name: string };
};

export function MyPageRoleRequestsSection({
  requests,
  labels,
  roleLabels,
  statusLabel,
}: {
  requests: RoleRequestRow[];
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
          <Link href="/modules" className="btn btn-primary btn-sm">
            {labels.applyLink}
          </Link>
        </p>
      ) : (
        <ul className="mypage-status-list">
          {requests.map((req) => (
            <li key={req.id} className="mypage-status-item">
              <div className="mypage-status-main">
                <Link href={`/modules/${req.module.slug}`} className="mypage-status-link">
                  {req.module.name}
                </Link>
                <span className="badge badge-default">{roleLabels[req.role] ?? req.role}</span>
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
