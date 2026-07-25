import Link from "next/link";
import type { LinkedIdentity } from "@/lib/identity/accounts";
import { formatEmailProvider } from "@/lib/identity/accounts";
import type { UserLayerStatus } from "@/lib/identity/layers";

export type OrgAffiliationSummary = {
  legalName: string;
  corporateNumberDisplay: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
};

type Labels = {
  title: string;
  openOrgId: string;
  openOrgIdHint: string;
  layerCommunity: string;
  organization: string;
  organizationHint: string;
  organizationEmpty: string;
  claimOrg: string;
  orgPending: string;
  orgVerified: string;
  connected: string;
  notConnected: string;
  partial: string;
  editProfile: string;
};

/** Google / OpenOrg ID + organization (corporate number) claim status. */
export function MyPageIdentityHub({
  identity,
  layers,
  affiliations,
  labels,
}: {
  identity: LinkedIdentity;
  layers: UserLayerStatus;
  affiliations: OrgAffiliationSummary[];
  labels: Labels;
}) {
  const primaryOrg = affiliations[0] ?? null;

  return (
    <section className="mypage-section" aria-labelledby="mypage-identity-heading">
      <div className="mypage-section-header">
        <h2 id="mypage-identity-heading" className="mypage-section-label">
          {labels.title}
        </h2>
        <Link href="/settings/profile?edit=1" className="btn btn-ghost btn-sm">
          {labels.editProfile}
        </Link>
      </div>

      <div className="mypage-identity-card lf-card">
        <div className="mypage-identity-primary">
          <p className="mypage-identity-kicker">{labels.openOrgId}</p>
          <p className="mypage-identity-email">{identity.email ?? "—"}</p>
          <p className="page-muted-note">{labels.openOrgIdHint}</p>
          {identity.emailProvider && (
            <p className="page-muted-note">{formatEmailProvider(identity.emailProvider)}</p>
          )}
          {!layers.profileComplete && (
            <p style={{ marginTop: "var(--space-3)" }}>
              <Link href="/settings/profile?edit=1" className="btn btn-primary btn-sm">
                {labels.editProfile}
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="mypage-identity-layers">
        <div className="mypage-identity-layer-row">
          <div>
            <strong>{labels.layerCommunity}</strong>
            <p className="page-muted-note" style={{ margin: "0.15rem 0 0" }}>
              {identity.email ?? "—"}
            </p>
          </div>
          <div className="mypage-identity-layer-actions">
            <span
              className={`badge ${
                layers.profileComplete && layers.emailLoginConnected
                  ? "badge-success"
                  : layers.emailLoginConnected
                    ? "badge-navy"
                    : "badge-warning"
              }`}
            >
              {layers.profileComplete && layers.emailLoginConnected
                ? labels.connected
                : layers.emailLoginConnected
                  ? labels.partial
                  : labels.notConnected}
            </span>
          </div>
        </div>

        <div className="mypage-identity-layer-row">
          <div>
            <strong>{labels.organization}</strong>
            {primaryOrg ? (
              <>
                <p className="page-muted-note" style={{ margin: "0.15rem 0 0" }}>
                  {primaryOrg.legalName}
                </p>
                <p className="page-muted-note" style={{ margin: 0 }}>
                  {primaryOrg.corporateNumberDisplay}
                </p>
              </>
            ) : (
              <p className="page-muted-note" style={{ margin: "0.15rem 0 0" }}>
                {labels.organizationEmpty}
              </p>
            )}
            <p className="page-muted-note" style={{ margin: "0.15rem 0 0" }}>
              {labels.organizationHint}
            </p>
          </div>
          <div className="mypage-identity-layer-actions">
            {primaryOrg ? (
              <span
                className={`badge ${
                  primaryOrg.status === "VERIFIED"
                    ? "badge-success"
                    : primaryOrg.status === "PENDING"
                      ? "badge-navy"
                      : "badge-warning"
                }`}
              >
                {primaryOrg.status === "VERIFIED"
                  ? labels.orgVerified
                  : primaryOrg.status === "PENDING"
                    ? labels.orgPending
                    : labels.notConnected}
              </span>
            ) : (
              <Link href="/settings/organization" className="btn btn-primary btn-sm">
                {labels.claimOrg}
              </Link>
            )}
            {primaryOrg && primaryOrg.status !== "VERIFIED" && (
              <Link href="/settings/organization" className="btn btn-ghost btn-sm">
                {labels.claimOrg}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
