import Link from "next/link";

const STEPS = [
  { id: "apply", title: "Apply", detail: "Module role · WILD · operator certification (Steward governance submit)" },
  { id: "pending", title: "Pending", detail: "mypage + /api/protocol/governance pending list" },
  { id: "review", title: "Review", detail: "Committee CHAIR · /committees/[slug]/review" },
  { id: "decide", title: "Decide", detail: "Steward protocol community governance decide (BFF when STEWARD_ORGOS_ROOT set)" },
  { id: "active", title: "Active", detail: "trusted-operators registry · Wire delivery" },
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
