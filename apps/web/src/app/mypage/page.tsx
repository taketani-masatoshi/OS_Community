import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { getT } from "@/lib/i18n";
import { getUserProfilePath } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import { getUserDashboardData, getCommitteeMemberRoleLabel } from "@/lib/committees";
import {
  getUserPermissionRows,
  consolidatePermissions,
} from "@/lib/permissions";
import { getUserCommunities } from "@/lib/user-communities";
import { getLinkedIdentity } from "@/lib/identity/accounts";
import { getUserLayerStatus } from "@/lib/identity/layers";
import { getUserCommunityPersona } from "@/lib/identity/persona";
import { MyPageIdentityHub } from "@/components/mypage/MyPageIdentityHub";
import { MyPagePrivateVideosSection } from "@/components/mypage/MyPagePrivateVideosSection";
import { MyPageGroupsSummary } from "@/components/mypage/MyPageGroupsSummary";
import { MyPageQuickActions } from "@/components/mypage/MyPageQuickActions";
import { MyPageRoleRequestsSection } from "@/components/mypage/MyPageRoleRequestsSection";
import { MyPageCommitteeRequestsSection } from "@/components/mypage/MyPageCommitteeRequestsSection";
import { MyPageGitHubSection } from "@/components/mypage/MyPageGitHubSection";
import { MyPageWildModulesSection } from "@/components/mypage/MyPageWildModulesSection";
import { MyPageCertApplicationsSection } from "@/components/mypage/MyPageCertApplicationsSection";
import { MyPagePermissionsSection } from "@/components/mypage/MyPagePermissionsSection";
import { MyPageOnboardingChecklist } from "@/components/mypage/MyPageOnboardingChecklist";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { buildOnboardingSteps, isNewParticipant } from "@/lib/onboarding";
import { getPageMessages, getLabelMessages, getFormMessages } from "@os-community/shared";
import { getUserPendingReviewCount } from "@/lib/committee-review-counts";
import { isCommitteeMembershipRequestAvailable } from "@/lib/prisma-committee-models";
import { isLinkedInAuthConfigured, isGithubAuthConfigured } from "@/lib/auth-env";
import { localizeMypageCopy, localizeSettingsCopy } from "@/lib/identity/login-copy";
import { connectGithubAccount, connectLinkedInAccount } from "@/app/settings/connections/actions";
import { MyPageOpsHub } from "@/components/mypage/MyPageOpsHub";
import { getConsoleHandoffConfig } from "@/lib/console-handoff";
import { isOperatorConsoleReachable } from "@/lib/operator-console-health";
import { getOperatorOrgRows } from "@/lib/operator-org-rows";

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string }>;
}) {
  const session = await requireAuth();
  const params = await searchParams;
  const { locale, messages: t } = await getT();
  const ui = getPageMessages(locale).ui;
  const forms = getFormMessages(locale);
  const certLabels = getLabelMessages(locale).certification;
  const siteRoleLabels = getLabelMessages(locale).siteRole;
  const userId = session.user.id;

  const communities = await getUserCommunities(userId);

  const siteRole = String(session.user.siteRole ?? "");
  const isSiteAdmin = siteRole === "ADMIN" || siteRole === "CERT_REVIEWER";

  const [
    { githubConnections },
    permissionRows,
    dbUser,
    moduleRoleRequests,
    committeeMembershipRequests,
    wildModuleRegistrations,
    certApplications,
    identity,
    layers,
    persona,
    oooCert,
  ] = await Promise.all([
    getUserDashboardData(userId),
    getUserPermissionRows(userId, locale),
    prisma.user.findUnique({
      where: { id: userId },
      select: { githubLogin: true, name: true, publicSlug: true, email: true },
    }),
    prisma.moduleRoleRequest.findMany({
      where: { userId },
      include: { module: { select: { slug: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.committeeMembershipRequest.findMany({
      where: { userId },
      include: { committee: { select: { slug: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.wildModuleRegistration.findMany({
      where: { userId },
      select: { slug: true, name: true, repoUrl: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.certificationApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getLinkedIdentity(userId),
    getUserLayerStatus(userId),
    getUserCommunityPersona(userId),
    prisma.certification.findFirst({
      where: {
        userId,
        type: "STEWARD_OPERATOR",
        status: "APPROVED",
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    }),
  ]);

  const consolidated = consolidatePermissions(permissionRows, locale);
  const profilePath = dbUser ? getUserProfilePath({ ...dbUser, id: userId }) : null;
  const profileIncomplete = !session.user.profileComplete;
  const displayName =
    dbUser?.name ?? session.user.name ?? session.user.githubLogin ?? session.user.primaryEmail ?? "—";

  const roleLabels = getLabelMessages(locale).moduleRole;

  const certStatusLabel = (status: (typeof certApplications)[number]["status"]) => {
    if (status === "PENDING" || status === "UNDER_REVIEW") return forms.moduleRole.pendingReview;
    if (status === "APPROVED") return forms.moduleRole.success;
    if (status === "REJECTED") return forms.admin.reject;
    return status;
  };

  const requestStatusLabel = (status: (typeof moduleRoleRequests)[number]["status"]) => {
    if (status === "PENDING") return forms.moduleRole.pendingReview;
    if (status === "APPROVED") return forms.moduleRole.success;
    if (status === "REJECTED") return forms.admin.reject;
    return status;
  };

  const committeeRoleLabels = {
    MEMBER: getCommitteeMemberRoleLabel("MEMBER", locale),
    REVIEWER: getCommitteeMemberRoleLabel("REVIEWER", locale),
  };

  const committeeRequestStatusLabel = (status: (typeof committeeMembershipRequests)[number]["status"]) =>
    requestStatusLabel(status);

  const mp = localizeMypageCopy(t.mypage, locale);
  const s = localizeSettingsCopy(t.settings, locale);
  const consoleCfg = getConsoleHandoffConfig();
  const consoleReachable = await isOperatorConsoleReachable(consoleCfg.consoleBaseUrl);
  const operatorOrgs = await getOperatorOrgRows(userId);
  const canOpenConsole = Boolean(oooCert || isSiteAdmin);
  const showOperatorAdminLink = Boolean(oooCert || isSiteAdmin);
  const linkedInConfigured = isLinkedInAuthConfigured();
  const githubConfigured = isGithubAuthConfigured();

  const pendingReviewCount =
    isCommitteeMembershipRequestAvailable()
      ? await getUserPendingReviewCount(userId, session.user.siteRole)
      : 0;

  const hasParticipation =
    communities.modules.length > 0 ||
    Boolean(communities.standard) ||
    communities.domain.length > 0 ||
    wildModuleRegistrations.length > 0 ||
    moduleRoleRequests.some((r) => r.status === "APPROVED" || r.status === "PENDING");

  const showOnboarding = isNewParticipant({
    communities,
    wildModuleCount: wildModuleRegistrations.length,
    pendingOrApprovedRequests: moduleRoleRequests.filter(
      (r) => r.status === "APPROVED" || r.status === "PENDING",
    ).length,
  });

  const onboardingSteps = buildOnboardingSteps({
    mp,
    profileComplete: !profileIncomplete,
    hasParticipation,
  });

  const quickActions = [
    ...(!layers.linkedinConnected && linkedInConfigured
      ? [{ href: "/mypage#professional-linkedin", label: s.linkedinConnect }]
      : []),
    ...(!layers.githubAccountLinked && githubConfigured
      ? [{ href: "/mypage#technical-github", label: s.githubConnect }]
      : []),
    { href: "/settings/connections", label: s.connections },
    { href: "/settings/profile?edit=1", label: t.mypage.actionSettings },
    ...(profilePath ? [{ href: profilePath, label: t.mypage.actionPublicProfile }] : []),
    { href: "/learning", label: t.mypage.actionLearning },
    { href: "/mypage#learning-videos", label: t.mypage.privateVideosTitle },
    { href: "/modules", label: t.mypage.actionModules },
    { href: "/wild-modules/register", label: t.mypage.actionProposeModule },
    ...(pendingReviewCount > 0
      ? [
          {
            href: "/governance#review-queues",
            label: t.mypage.reviewPendingBadge.replace("{count}", String(pendingReviewCount)),
          },
        ]
      : []),
  ];

  const detailSections = (
    <>
        <MyPageIdentityHub
          identity={identity}
          layers={layers}
          persona={persona}
          linkedInConfigured={linkedInConfigured}
          githubConfigured={githubConfigured}
          connectLinkedInAction={connectLinkedInAccount.bind(null, "/mypage?linked=linkedin")}
          connectGithubAction={connectGithubAccount.bind(null, "/mypage?linked=github")}
          labels={{
            title: mp.identityTitle,
            openOrgId: mp.openOrgIdLabel,
            openOrgIdHint: mp.openOrgIdHint,
            personaTitle: mp.personaTitle,
            personaCoder: mp.personaCoder,
            personaCoderDesc: mp.personaCoderDesc,
            personaProfessional: mp.personaProfessional,
            personaProfessionalDesc: mp.personaProfessionalDesc,
            personaHybrid: mp.personaHybrid,
            personaHybridDesc: mp.personaHybridDesc,
            personaExploring: mp.personaExploring,
            personaExploringDesc: mp.personaExploringDesc,
            layerCommunity: s.layerCommunityTitle,
            layerProfessional: s.layerProfessionalTitle,
            layerProfessionalBody: s.layerProfessionalBody,
            layerTechnical: s.layerTechnicalTitle,
            layerTechnicalBody: s.layerTechnicalBody,
            connected: s.layerStatusComplete,
            notConnected: s.layerStatusIncomplete,
            partial: s.layerStatusPartial,
            manageConnections: s.connections,
            manageRepositories: s.layerTechnicalAction,
            githubRepos: mp.githubReposLinked,
            linkedinConnect: s.linkedinConnect,
            linkedinConnectError: s.linkedinConnectError,
            linkedinDisconnect: s.linkedinDisconnect,
            linkedinDisconnectConfirm: s.linkedinDisconnectConfirm,
            linkedinDisconnectError: s.linkedinDisconnectError,
            linkedinNotConfigured: s.linkedinNotConfigured,
            linkedinMemberId: s.linkedinMemberId,
            linkedinHeadline: s.linkedinHeadline,
            linkedinOrganization: s.linkedinOrganization,
            linkedinViewProfile: mp.linkedinViewProfile,
            githubConnect: s.githubConnect,
            githubConnectError: s.githubConnectError,
            githubNotConfigured: t.login.githubNotConfigured,
            editProfile: mp.editProfile,
          }}
        />

        <MyPageQuickActions title={mp.actionsTitle} actions={quickActions} />

        <MyPagePrivateVideosSection
          locale={locale}
          labels={{
            title: mp.privateVideosTitle,
            desc: mp.privateVideosDesc,
            empty: mp.privateVideosEmpty,
            episode: t.learn.episode,
            keyLabel: mp.privateVideosKeyLabel,
            watchExternal: mp.privateVideosWatchExternal,
          }}
        />

        <div className="mypage-grid">
          <div className="mypage-grid-main">
            <MyPageRoleRequestsSection
              requests={moduleRoleRequests}
              labels={{
                title: mp.pendingTasksTitle,
                empty: mp.requestsEmpty,
                applyLink: mp.requestsApplyLink,
              }}
              roleLabels={roleLabels}
              statusLabel={requestStatusLabel}
            />

            <MyPageCommitteeRequestsSection
              requests={committeeMembershipRequests}
              labels={{
                title: mp.committeeRequestsTitle,
                empty: mp.committeeRequestsEmpty,
                applyLink: mp.committeeRequestsApplyLink,
              }}
              roleLabels={committeeRoleLabels}
              statusLabel={committeeRequestStatusLabel}
            />

            <MyPageWildModulesSection modules={wildModuleRegistrations} />

            <MyPageCertApplicationsSection
              applications={certApplications}
              labels={{
                title: mp.certApplicationsTitle,
                empty: mp.certApplicationsEmpty,
                applyLink: mp.certApplicationsApplyLink,
              }}
              typeLabels={certLabels}
              statusLabel={certStatusLabel}
            />

            <MyPageGroupsSummary
              communities={communities}
              publicProfileHref={profilePath}
              wildModuleCount={wildModuleRegistrations.length}
              labels={{
                title: mp.groupsSummaryTitle,
                body: mp.groupsSummaryBody,
                empty: mp.communitiesEmpty,
                browseModules: mp.browseModules,
                viewPublicProfile: mp.viewPublicProfile,
                statsCommittees: mp.statsCommittees,
                statsModuleRoles: mp.statsModuleRoles,
                statsWildModules: mp.statsWildModules,
              }}
            />
          </div>

          <aside className="mypage-grid-aside">
            <MyPageGitHubSection
              connections={githubConnections}
              labels={{
                title: mp.githubTitle,
                empty: mp.githubEmpty,
                connectLink: t.settings.layerTechnicalAction,
              }}
              defaultLabel={ui.default}
            />
          </aside>
        </div>

        <MyPagePermissionsSection
          consolidated={consolidated}
          permissionRows={permissionRows}
          labels={{
            details: mp.permissionsDetails,
            empty: mp.permissionsEmpty,
            scope: mp.scope,
            target: mp.target,
            level: mp.level,
            source: mp.source,
            actions: mp.actions,
            consolidatedTitle: mp.consolidatedTitle,
          }}
        />
    </>
  );

  return (
    <>
      <section className="mypage-hero">
        <div className="mypage-hero-inner page-wrap">
          <div className="mypage-hero-row">
            <div>
              <p className="mypage-hero-kicker">{mp.title}</p>
              <h1 className="mypage-hero-name">{displayName}</h1>
              <p className="mypage-hero-meta">
                {mp.openOrgIdLabel}: {identity.email ?? session.user.primaryEmail ?? "—"}
              </p>
              {identity.githubLogin && (
                <p className="mypage-hero-meta">GitHub @{identity.githubLogin}</p>
              )}
            </div>
            <span className="badge badge-navy mypage-hero-role">
              {siteRoleLabels[session.user.siteRole]}
            </span>
          </div>
          <p className="mypage-hero-desc">{mp.desc}</p>
          <div className="mypage-hero-actions">
            {!layers.linkedinConnected && linkedInConfigured ? (
              <Link
                href="/mypage#professional-linkedin"
                className="btn btn-primary btn-sm"
              >
                {s.linkedinConnect}
              </Link>
            ) : !layers.githubAccountLinked && githubConfigured ? (
              <Link href="/mypage#technical-github" className="btn btn-primary btn-sm">
                {s.githubConnect}
              </Link>
            ) : (
              <Link href="/settings/connections" className="btn btn-primary btn-sm">
                {s.connections}
              </Link>
            )}
            {profilePath && (
              <Link href={profilePath} className="btn btn-primary btn-sm">
                {mp.viewPublicProfile}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="page-wrap mypage-body">
        {params.linked === "linkedin" && (
          <div className="mypage-alert" style={{ borderColor: "var(--accent)" }}>
            <p>{s.linkedinLinkedNotice}</p>
          </div>
        )}
        {params.linked === "github" && (
          <div className="mypage-alert" style={{ borderColor: "var(--accent)" }}>
            <p>{s.githubLinkedNotice}</p>
          </div>
        )}

        <MyPageOpsHub
          operatorOrgs={operatorOrgs}
          consoleBaseUrl={consoleCfg.consoleBaseUrl}
          consoleReachable={consoleReachable}
          canOpenConsole={canOpenConsole}
          showOperatorAdminLink={showOperatorAdminLink}
          labels={{
            title: mp.opsTitle,
            desc: mp.opsDesc,
            empty: mp.opsEmpty,
            claimOrg: mp.opsClaimOrg,
            applyOoo: mp.opsApplyOoo,
            openConsole: mp.opsOpenConsole,
            openConsoleDesc: mp.opsOpenConsoleDesc,
            orgLabel: mp.opsOrgLabel,
            certLabel: mp.opsCertLabel,
            expiresLabel: mp.opsExpiresLabel,
            wireTitle: mp.opsWireTitle,
            wireDesc: mp.opsWireDesc,
            wireConsole: mp.opsWireConsole,
            wireProtocol: mp.opsWireProtocol,
            wireGovernance: mp.opsWireGovernance,
            yojitsuTitle: mp.opsYojitsuTitle,
            yojitsuDesc: mp.opsYojitsuDesc,
            yojitsuConsole: mp.opsYojitsuConsole,
            yojitsuGuide: mp.opsYojitsuGuide,
            yojitsuInstall: mp.opsYojitsuInstall,
            secretaryTitle: mp.opsSecretaryTitle,
            secretaryDesc: mp.opsSecretaryDesc,
            secretaryConsole: mp.opsSecretaryConsole,
            stewardTitle: mp.opsStewardTitle,
            stewardDesc: mp.opsStewardDesc,
            stewardConsole: mp.opsStewardConsole,
            runsTitle: mp.opsRunsTitle,
            runsDesc: mp.opsRunsDesc,
            runsConsole: mp.opsRunsConsole,
            consoleOffline: mp.opsConsoleOffline,
            operatorAdminTitle: mp.opsOperatorAdminTitle,
            operatorAdminDesc: mp.opsOperatorAdminDesc,
            operatorAdminLink: mp.opsOperatorAdminLink,
          }}
        />

        {profileIncomplete && (
          <div className="mypage-alert">
            <p>{t.userPages.registerIncompleteBanner}</p>
            <Link href="/settings/profile" className="btn btn-primary btn-sm">
              {t.userPages.registerGoToForm}
            </Link>
          </div>
        )}

        {(showOnboarding || profileIncomplete) && (
          <>
            {showOnboarding && (
              <WelcomeBanner
                userName={displayName}
                title={mp.welcomeTitle}
                body={mp.welcomeBody}
                cta={mp.welcomeCta}
                href="/modules#registry"
              />
            )}
            <MyPageOnboardingChecklist
              steps={onboardingSteps}
              title={mp.onboardingTitle}
              subtitle={mp.onboardingSub}
              progressLabel={mp.onboardingProgress}
            />
          </>
        )}

        {showOnboarding ? (
          <details className="mypage-details">
            <summary className="mypage-details-summary">{mp.onboardingShowDetails}</summary>
            <div className="mypage-details-body">{detailSections}</div>
          </details>
        ) : (
          detailSections
        )}
      </div>
    </>
  );
}
