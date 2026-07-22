import Link from "next/link";

const STEPS = [
  { id: "apply", title: "Apply", detail: "Wire node registration — /protocol/wire-node/apply (C4-W1)" },
  { id: "pending", title: "Pending", detail: "Steward governance_requests · /api/protocol/wire-node/pending" },
  { id: "review", title: "Review", detail: "Committee CHAIR · /protocol/governance (C4-W2)" },
  { id: "decide", title: "Decide", detail: "Steward wire-node decide via BFF (STEWARD_API_URL or WIRE_NODE_MOCK)" },
  { id: "active", title: "Active", detail: "wire-trust-registry · Wire delivery" },
];

export default function GovernanceLifecyclePage() {
  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">Application lifecycle</h1>
          <p className="lf-hero-lead">Unified C4-W1 flow — Community UI ↔ Steward CLI</p>
        </div>
      </section>
      <div className="page-wrap">
        <ol style={{ lineHeight: 1.8 }}>
          {STEPS.map((step, i) => (
            <li key={step.id} style={{ marginBottom: "1rem" }}>
              <strong>
                {i + 1}. {step.title}
              </strong>
              <div className="page-muted-note">{step.detail}</div>
            </li>
          ))}
        </ol>
        <div className="lf-card-grid" style={{ marginTop: "1.5rem" }}>
          <Link href="/mypage" className="lf-card">
            <strong>My applications</strong>
            <p className="page-muted-note">Role · committee · WILD status</p>
          </Link>
          <Link href="/protocol/wire-node/apply" className="lf-card">
            <strong>Wire node apply</strong>
            <p className="page-muted-note">C4-W1 · pk-DID registration</p>
          </Link>
          <Link href="/protocol/governance" className="lf-card">
            <strong>Wire node governance</strong>
            <p className="page-muted-note">C4-W2 · CHAIR pending queue · audit trail</p>
          </Link>
          <Link href="/protocol/trusted-operators" className="lf-card">
            <strong>Trusted operators</strong>
            <p className="page-muted-note">Active registry mirror</p>
          </Link>
          <Link href="/governance/sla" className="lf-card">
            <strong>SLA dashboard</strong>
            <p className="page-muted-note">Revocation SLA · C4-W4</p>
          </Link>
          <Link href="/committees" className="lf-card">
            <strong>Committees</strong>
            <p className="page-muted-note">CHAIR review queues</p>
          </Link>
        </div>
      </div>
    </>
  );
}
