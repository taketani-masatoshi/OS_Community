import Link from "next/link";
import { StewardSlaDashboard } from "@/components/protocol/StewardSlaDashboard";
import { loadStewardReadiness } from "@/lib/steward-protocol";

export default async function GovernanceSlaPage() {
  const readiness = loadStewardReadiness();

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">Protocol SLA dashboard</h1>
          <p className="lf-hero-lead">
            Steward <code>protocol community check-sla</code> mirror · C4-W4
          </p>
        </div>
      </section>
      <div className="page-wrap">
        {readiness && (
          <p className="page-muted-note" style={{ marginBottom: "1rem" }}>
            Community readiness score: {readiness.score}% (Steward-side)
          </p>
        )}
        <StewardSlaDashboard />
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/governance">← Governance</Link>
          {" · "}
          <Link href="/governance/lifecycle">Application lifecycle</Link>
        </p>
      </div>
    </>
  );
}
