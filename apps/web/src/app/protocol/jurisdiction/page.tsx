import Link from "next/link";
import { WireJurisdictionRegistry } from "@/components/protocol/WireJurisdictionRegistry";
import { loadWireTrustRegistry, stewardMirrorAvailable } from "@/lib/steward-protocol";

export default async function JurisdictionRegistryPage() {
  const registry = loadWireTrustRegistry();
  const mirror = stewardMirrorAvailable();

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">Committee jurisdiction registry</h1>
          <p className="lf-hero-lead">
            Wire Trust Registry · witness jurisdiction · C4-W6 · Steward mirror
          </p>
        </div>
      </section>
      <div className="page-wrap">
        {!mirror || !registry?.nodes?.length ? (
          <p className="page-muted-note">
            Steward mirror not loaded. Run <code>scripts/sync-steward-protocol.sh</code> from OS_Community.
          </p>
        ) : (
          <>
            <p className="page-muted-note">
              Registry v{registry.version} · {registry.nodes.length} node(s) · discover via Wire Gateway
            </p>
            <WireJurisdictionRegistry
              nodes={registry.nodes}
              labels={{
                filterAll: "All jurisdictions",
                nodeId: "Node ID",
                displayName: "Organization",
                jurisdiction: "Jurisdiction",
                wireUrl: "Wire URL",
                resultCount: "{count} node(s)",
              }}
            />
          </>
        )}
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/protocol/trusted-operators">Trusted operators</Link>
          {" · "}
          <Link href="/governance">Governance</Link>
        </p>
      </div>
    </>
  );
}
