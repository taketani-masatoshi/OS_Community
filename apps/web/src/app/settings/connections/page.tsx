import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { getT } from "@/lib/i18n";
import { getUserLayerStatus } from "@/lib/identity/layers";
import { getLinkedIdentity, formatEmailProvider } from "@/lib/identity/accounts";
import { getProfessionalProfile } from "@/lib/identity/professional-profile";
import { prisma } from "@/lib/prisma";
import { isGithubAuthConfigured, resolveLinkedInOAuthCredentials } from "@/lib/auth-env";
import { localizeSettingsCopy } from "@/lib/identity/login-copy";
import { IdentityLayerCard, IdentityLayerLink } from "@/components/settings/IdentityLayerCard";
import { LinkedInConnectButton } from "@/components/settings/LinkedInConnectButton";
import { LinkedInDisconnectButton } from "@/components/settings/LinkedInDisconnectButton";
import { GitHubConnectAccountButton } from "@/components/settings/GitHubConnectAccountButton";
import { ConnectionLinkRefresh } from "@/components/settings/ConnectionLinkRefresh";
import { connectGithubAccount, connectLinkedInAccount } from "@/app/settings/connections/actions";

export default async function SettingsConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string }>;
}) {
  const session = await requireAuth("/settings/connections");
  const { locale, messages: t } = await getT();
  const s = localizeSettingsCopy(t.settings, locale);
  const params = await searchParams;

  const [layers, identity, professional, githubConnections] = await Promise.all([
    getUserLayerStatus(session.user.id),
    getLinkedIdentity(session.user.id),
    getProfessionalProfile(session.user.id),
    prisma.gitHubConnection.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const linkedIn = resolveLinkedInOAuthCredentials();
  const linkedInConfigured = linkedIn.configured;
  const githubConfigured = isGithubAuthConfigured();

  return (
    <>
      <ConnectionLinkRefresh linked={params.linked} />
      <h2 className="section-title" style={{ marginTop: 0 }}>
        {s.connectionsTitle}
      </h2>
      <p className="page-desc">{s.connectionsDesc}</p>

      {params.linked === "1" && (
        <p className="membership-policy-callout" style={{ marginBottom: "1rem" }}>
          {s.linkedinLinkedNotice}
        </p>
      )}
      {params.linked === "github" && (
        <p className="membership-policy-callout" style={{ marginBottom: "1rem" }}>
          {s.githubLinkedNotice}
        </p>
      )}

      <div className="identity-layers-stack">
        <IdentityLayerCard
          title={s.layerCommunityTitle}
          status={
            layers.profileComplete && layers.emailLoginConnected
              ? s.layerStatusComplete
              : layers.emailLoginConnected
                ? s.layerStatusPartial
                : s.layerStatusIncomplete
          }
          complete={layers.profileComplete && layers.emailLoginConnected}
          action={
            <IdentityLayerLink href="/settings/profile" label={s.layerCommunityAction} />
          }
        >
          <p className="page-muted-note">{s.layerCommunityBody}</p>
          <p>
            <strong>{s.openOrgIdLabel}:</strong> {identity.email ?? "—"}
          </p>
          {identity.emailProvider && (
            <p className="page-muted-note">
              {s.loginVia}: {formatEmailProvider(identity.emailProvider)}
            </p>
          )}
          {!layers.emailLoginConnected && (
            <p className="page-muted-note">{s.emailLoginHint}</p>
          )}
          {session.user.publicSlug && (
            <p className="page-muted-note">
              {s.publicProfileLabel}:{" "}
              <Link href={`/users/${session.user.publicSlug}`} className="btn btn-primary btn-sm">
                /users/{session.user.publicSlug}
              </Link>
            </p>
          )}
        </IdentityLayerCard>

        <IdentityLayerCard
          title={s.layerProfessionalTitle}
          status={layers.linkedinConnected ? s.layerStatusComplete : s.layerStatusIncomplete}
          complete={layers.linkedinConnected}
          action={
            layers.linkedinConnected ? (
              <LinkedInDisconnectButton
                label={s.linkedinDisconnect}
                confirmLabel={s.linkedinDisconnectConfirm}
                errorLabel={s.linkedinDisconnectError}
              />
            ) : linkedInConfigured ? (
              <LinkedInConnectButton
                label={s.linkedinConnect}
                action={connectLinkedInAccount.bind(null, "/settings/connections?linked=1")}
              />
            ) : undefined
          }
        >
          {!linkedInConfigured ? (
            <p className="page-muted-note">{s.linkedinNotConfigured}</p>
          ) : professional ? (
            <>
              {professional.headline && (
                <p>
                  <strong>{s.linkedinHeadline}:</strong> {professional.headline}
                </p>
              )}
              {professional.organization && (
                <p className="page-muted-note">
                  <strong>{s.linkedinOrganization}:</strong> {professional.organization}
                </p>
              )}
              <p className="page-muted-note">
                <strong>{s.linkedinMemberId}:</strong> {professional.linkedinId}
              </p>
              {professional.profileUrl && (
                <p>
                  <a href={professional.profileUrl} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </p>
              )}
            </>
          ) : (
            <p className="page-muted-note">{s.layerProfessionalBody}</p>
          )}
        </IdentityLayerCard>

        <IdentityLayerCard
          title={s.layerTechnicalTitle}
          status={
            layers.githubAccountLinked
              ? layers.githubReposConnected
                ? s.layerStatusComplete
                : s.layerStatusPartial
              : s.layerStatusIncomplete
          }
          complete={Boolean(layers.githubAccountLinked && layers.githubReposConnected)}
          action={
            layers.githubAccountLinked ? (
              <IdentityLayerLink href="/github" label={s.layerTechnicalAction} />
            ) : githubConfigured ? (
              <GitHubConnectAccountButton
                label={s.githubConnect}
                action={connectGithubAccount.bind(null, "/settings/connections?linked=github")}
              />
            ) : undefined
          }
        >
          <p className="page-muted-note">{s.layerTechnicalBody}</p>
          <p className="page-muted-note">
            {s.layerTechnicalLogin}: @{identity.githubLogin ?? "—"}
          </p>
          {githubConnections.length === 0 ? (
            <p className="page-muted-note">{s.layerTechnicalEmpty}</p>
          ) : (
            <ul className="mypage-status-list">
              {githubConnections.map((c) => (
                <li key={c.id} className="mypage-status-item">
                  <a href={c.repoUrl} target="_blank" rel="noopener noreferrer">
                    {c.repoOwner}/{c.repoName}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </IdentityLayerCard>
      </div>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/mypage" className="btn btn-primary btn-sm">
          ← {t.nav.myPage}
        </Link>
      </p>
    </>
  );
}
