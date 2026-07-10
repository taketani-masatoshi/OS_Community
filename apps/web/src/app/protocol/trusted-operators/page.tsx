import Link from "next/link";
import { loadStewardOperators, stewardMirrorAvailable } from "@/lib/steward-protocol";

export default async function TrustedOperatorsPage() {
  const registry = loadStewardOperators();
  const mirror = stewardMirrorAvailable();

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">Trusted Wire operators</h1>
          <p className="lf-hero-lead">Witness Hub operators · C4-W5 · Steward mirror</p>
        </div>
      </section>
      <div className="page-wrap">
        {!mirror || !registry ? (
          <p className="page-muted-note">
            Steward mirror not loaded. Run <code>scripts/sync-steward-protocol.sh</code> from OS_Community.
          </p>
        ) : (
          <>
            <p className="page-muted-note">
              Committee: {registry.committee_id} · SLA max {registry.revocation_sla.max_hours}h
            </p>
            <table className="lf-table">
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Org</th>
                  <th>Jurisdiction</th>
                  <th>Hubs</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registry.operators.map((op) => (
                  <tr key={op.operator_id}>
                    <td>{op.operator_id}</td>
                    <td>{op.org_name}</td>
                    <td>{op.jurisdiction}</td>
                    <td>{op.hub_ids.join(", ")}</td>
                    <td>{op.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {registry.governance_requests.filter((r) => r.status === "pending").length > 0 && (
              <>
                <h2 className="section-title" style={{ marginTop: "2rem" }}>
                  Pending certification
                </h2>
                <ul>
                  {registry.governance_requests
                    .filter((r) => r.status === "pending")
                    .map((r) => (
                      <li key={r.request_id}>
                        {r.operator_id} — {r.org_name} ({r.jurisdiction})
                      </li>
                    ))}
                </ul>
              </>
            )}
          </>
        )}
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/governance">← Governance</Link>
        </p>
      </div>
    </>
  );
}
