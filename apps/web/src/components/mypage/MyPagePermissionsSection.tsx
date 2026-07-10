import type { ConsolidatedPermission, PermissionRow } from "@/lib/permissions";

export function MyPagePermissionsSection({
  consolidated,
  permissionRows,
  labels,
}: {
  consolidated: ConsolidatedPermission[];
  permissionRows: PermissionRow[];
  labels: {
    details: string;
    empty: string;
    scope: string;
    target: string;
    level: string;
    source: string;
    actions: string;
    consolidatedTitle: string;
  };
}) {
  if (permissionRows.length === 0) {
    return null;
  }

  return (
    <details className="mypage-details">
      <summary className="mypage-details-summary">{labels.details}</summary>
      <div className="mypage-details-body">
        <h3 className="subsection-title">{labels.consolidatedTitle}</h3>
        <div className="mypage-table-wrap">
          <table className="lf-table">
            <thead>
              <tr>
                <th>{labels.scope}</th>
                <th>{labels.target}</th>
                <th>{labels.level}</th>
                <th>{labels.source}</th>
              </tr>
            </thead>
            <tbody>
              {consolidated.map((row) => (
                <tr key={`${row.scope}-${row.target}`}>
                  <td>{row.scope}</td>
                  <td style={{ fontSize: "0.85rem" }}>{row.target}</td>
                  <td>
                    <span className="badge badge-navy">{row.levelLabel}</span>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    {row.sources.join("; ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="subsection-title">{labels.actions}</h3>
        <div className="mypage-table-wrap">
          <table className="lf-table">
            <thead>
              <tr>
                <th>{labels.source}</th>
                <th>{labels.target}</th>
                <th>{labels.level}</th>
                <th>{labels.actions}</th>
              </tr>
            </thead>
            <tbody>
              {permissionRows.map((row) => (
                <tr key={row.sourceKey}>
                  <td style={{ fontSize: "0.85rem" }}>{row.sourceLabel}</td>
                  <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{row.target}</td>
                  <td>
                    <span className="badge badge-default">{row.levelLabel}</span>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    {row.actions.join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
