import Link from "next/link";
import { LinkedInConnectButton } from "@/components/settings/LinkedInConnectButton";
import { LinkedInDisconnectButton } from "@/components/settings/LinkedInDisconnectButton";
import { GitHubConnectAccountButton } from "@/components/settings/GitHubConnectAccountButton";
import type { LinkedIdentity } from "@/lib/identity/accounts";
import { formatEmailProvider } from "@/lib/identity/accounts";
import type { CommunityPersonaResult } from "@/lib/identity/persona";
import type { UserLayerStatus } from "@/lib/identity/layers";

type Labels = {
  title: string;
  openOrgId: string;
  openOrgIdHint: string;
  personaTitle: string;
  personaCoder: string;
  personaCoderDesc: string;
  personaProfessional: string;
  personaProfessionalDesc: string;
  personaHybrid: string;
  personaHybridDesc: string;
  personaExploring: string;
  personaExploringDesc: string;
  layerCommunity: string;
  layerProfessional: string;
  layerProfessionalBody: string;
  layerTechnical: string;
  layerTechnicalBody: string;
  connected: string;
  notConnected: string;
  partial: string;
  manageConnections: string;
  manageRepositories: string;
  githubRepos: string;
  linkedinConnect: string;
  linkedinConnectError: string;
  linkedinDisconnect: string;
  linkedinDisconnectConfirm: string;
  linkedinDisconnectError: string;
  linkedinNotConfigured: string;
  linkedinMemberId: string;
  linkedinHeadline: string;
  linkedinOrganization: string;
  linkedinViewProfile: string;
  githubConnect: string;
  githubConnectError: string;
  githubNotConfigured: string;
  editProfile: string;
};

export function MyPageIdentityHub({
  identity,
  layers,
  persona,
  linkedInConfigured,
  githubConfigured,
  connectLinkedInAction,
  connectGithubAction,
  labels,
}: {
  identity: LinkedIdentity;
  layers: UserLayerStatus;
  persona: CommunityPersonaResult;
  linkedInConfigured: boolean;
  githubConfigured: boolean;
  connectLinkedInAction: () => Promise<void>;
  connectGithubAction: () => Promise<void>;
  labels: Labels;
}) {
  const personaBlock = personaContent(persona.persona, labels);

  return (
    <section className="mypage-section">
      <div className="mypage-section-header">
        <h2 className="mypage-section-label">{labels.title}</h2>
        <Link href="/settings/connections" className="btn btn-primary btn-sm">
          {labels.manageConnections}
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
            <p style={{ marginTop: "0.75rem" }}>
              <Link href="/settings/profile?edit=1" className="btn btn-primary btn-sm">
                {labels.editProfile}
              </Link>
            </p>
          )}
        </div>

        <div className="mypage-identity-persona">
          <p className="mypage-identity-kicker">{labels.personaTitle}</p>
          <span className="badge badge-navy">{personaBlock.title}</span>
          <p className="page-muted-note" style={{ marginTop: "0.5rem" }}>
            {personaBlock.desc}
          </p>
        </div>
      </div>

      <div className="mypage-professional-card lf-card" id="professional-linkedin">
        <div className="mypage-professional-card-header">
          <div>
            <p className="mypage-identity-kicker">{labels.layerProfessional}</p>
            <span
              className={`badge ${layers.linkedinConnected ? "badge-success" : "badge-warning"}`}
            >
              {layers.linkedinConnected ? labels.connected : labels.notConnected}
            </span>
          </div>
          {layers.linkedinConnected && (
            <div className="mypage-professional-actions">
              {identity.linkedin?.profileUrl && (
                <a
                  href={identity.linkedin.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  {labels.linkedinViewProfile}
                </a>
              )}
              <LinkedInDisconnectButton
                label={labels.linkedinDisconnect}
                confirmLabel={labels.linkedinDisconnectConfirm}
                errorLabel={labels.linkedinDisconnectError}
              />
            </div>
          )}
        </div>

        {layers.linkedinConnected ? (
          <>
            {identity.linkedin?.headline && (
              <p style={{ margin: "0.5rem 0 0" }}>
                <strong>{labels.linkedinHeadline}:</strong> {identity.linkedin.headline}
              </p>
            )}
            {identity.linkedin?.organization && (
              <p className="page-muted-note">
                <strong>{labels.linkedinOrganization}:</strong> {identity.linkedin.organization}
              </p>
            )}
            {identity.linkedin?.vanityName && (
              <p className="page-muted-note">linkedin.com/in/{identity.linkedin.vanityName}</p>
            )}
            {identity.linkedin?.linkedinId && (
              <p className="page-muted-note">
                <strong>{labels.linkedinMemberId}:</strong> {identity.linkedin.linkedinId}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="page-muted-note" style={{ marginTop: "0.75rem" }}>
              {labels.layerProfessionalBody}
            </p>
            {!linkedInConfigured && (
              <p className="page-muted-note">{labels.linkedinNotConfigured}</p>
            )}
            {linkedInConfigured && (
              <div style={{ marginTop: "0.75rem" }}>
                <LinkedInConnectButton
                  label={labels.linkedinConnect}
                  action={connectLinkedInAction}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="mypage-professional-card lf-card" id="technical-github">
        <div className="mypage-professional-card-header">
          <div>
            <p className="mypage-identity-kicker">{labels.layerTechnical}</p>
            <span
              className={`badge ${
                layers.githubAccountLinked && layers.githubReposConnected
                  ? "badge-success"
                  : layers.githubAccountLinked
                    ? "badge-navy"
                    : "badge-warning"
              }`}
            >
              {layers.githubAccountLinked && layers.githubReposConnected
                ? labels.connected
                : layers.githubAccountLinked
                  ? labels.partial
                  : labels.notConnected}
            </span>
          </div>
          {layers.githubAccountLinked && (
            <Link href="/github" className="btn btn-primary btn-sm">
              {labels.manageRepositories}
            </Link>
          )}
        </div>

        {layers.githubAccountLinked ? (
          <>
            <p style={{ margin: "0.5rem 0 0" }}>@{identity.githubLogin}</p>
            {layers.githubReposConnected ? (
              <p className="page-muted-note">{labels.githubRepos}</p>
            ) : (
              <p className="page-muted-note">{labels.layerTechnicalBody}</p>
            )}
          </>
        ) : (
          <>
            <p className="page-muted-note" style={{ marginTop: "0.75rem" }}>
              {labels.layerTechnicalBody}
            </p>
            {!githubConfigured && (
              <p className="page-muted-note">{labels.githubNotConfigured}</p>
            )}
            {githubConfigured && (
              <div style={{ marginTop: "0.75rem" }}>
                <GitHubConnectAccountButton
                  label={labels.githubConnect}
                  action={connectGithubAction}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="mypage-identity-layers">
        <IdentityLayerRow
          label={labels.layerCommunity}
          status={
            layers.profileComplete && layers.emailLoginConnected
              ? labels.connected
              : layers.emailLoginConnected
                ? labels.partial
                : labels.notConnected
          }
          detail={identity.email ?? "—"}
          ok={layers.profileComplete && layers.emailLoginConnected}
          partial={layers.emailLoginConnected && !layers.profileComplete}
          action={
            !layers.profileComplete ? (
              <Link href="/settings/profile?edit=1" className="btn btn-primary btn-sm">
                {labels.editProfile}
              </Link>
            ) : undefined
          }
        />
      </div>
    </section>
  );
}

function IdentityLayerRow({
  label,
  status,
  detail,
  ok,
  partial,
  action,
}: {
  label: string;
  status: string;
  detail: string;
  ok: boolean;
  partial?: boolean;
  action?: React.ReactNode;
}) {
  const variant = ok ? "badge-success" : partial ? "badge-navy" : "badge-warning";
  return (
    <div className="mypage-identity-layer-row">
      <div>
        <strong>{label}</strong>
        <p className="page-muted-note" style={{ margin: "0.15rem 0 0" }}>
          {detail}
        </p>
      </div>
      <div className="mypage-identity-layer-actions">
        <span className={`badge ${variant}`}>{status}</span>
        {action}
      </div>
    </div>
  );
}

function personaContent(
  persona: CommunityPersonaResult["persona"],
  labels: Labels
): { title: string; desc: string } {
  switch (persona) {
    case "coder":
      return { title: labels.personaCoder, desc: labels.personaCoderDesc };
    case "professional":
      return { title: labels.personaProfessional, desc: labels.personaProfessionalDesc };
    case "hybrid":
      return { title: labels.personaHybrid, desc: labels.personaHybridDesc };
    default:
      return { title: labels.personaExploring, desc: labels.personaExploringDesc };
  }
}
