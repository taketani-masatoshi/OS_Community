import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { getT } from "@/lib/i18n";
import { getUserProfilePath } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import { getCommitteeMemberRoleLabel } from "@/lib/committees";
import {
  getUserPermissionRows,
  consolidatePermissions,
} from "@/lib/permissions";
import { getUserCommunities } from "@/lib/user-communities";
import { getLinkedIdentity } from "@/lib/identity/accounts";
import { getUserLayerStatus } from "@/lib/identity/layers";
import { MyPageIdentityHub } from "@/components/mypage/MyPageIdentityHub";
import { MyPagePrivateVideosSection } from "@/components/mypage/MyPagePrivateVideosSection";
import { MyPageGroupsSummary } from "@/components/mypage/MyPageGroupsSummary";
import { MyPageQuickActions } from "@/components/mypage/MyPageQuickActions";
import { MyPageRoleRequestsSection } from "@/components/mypage/MyPageRoleRequestsSection";
import { MyPageCommitteeRequestsSection } from "@/components/mypage/MyPageCommitteeRequestsSection";
import { MyPageWildModulesSection } from "@/components/mypage/MyPageWildModulesSection";
import { MyPageCertApplicationsSection } from "@/components/mypage/MyPageCertApplicationsSection";
import { MyPagePermissionsSection } from "@/components/mypage/MyPagePermissionsSection";
import { MyPageOnboardingChecklist } from "@/components/mypage/MyPageOnboardingChecklist";
import { MyPageAdminSection } from "@/components/mypage/MyPageAdminSection";
import { MyPageOpsHub } from "@/components/mypage/MyPageOpsHub";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { buildOnboardingSteps, isNewParticipant, needsSetupChecklist } from "@/lib/onboarding";
import { getLabelMessages, getFormMessages, localeToBcp47 } from "@os-community/shared";
import { getUserPendingReviewCount } from "@/lib/committee-review-counts";
import { isCommitteeMembershipRequestAvailable } from "@/lib/prisma-committee-models";
import { listOperatorOrgCertifications, listUserAffiliations, formatCorporateNumberDisplay } from "@/lib/org-affiliation";
import { localizeMypageCopy, localizeSettingsCopy } from "@/lib/identity/login-copy";
import { isOperatorConsoleReachable } from "@/lib/operator-console-health";

function consoleHandoffMessage(code: string | undefined): string | null {
  switch (code) {
    case "misconfigured":
      return "Operator Console SSO is not configured (COMMUNITY_CONSOLE_OIDC_*).";
    case "forbidden":
      return "Operator certification is required to open Wire / 予実.";
    case "no_email":
      return "Google email is missing on your Community account.";
    default:
      return null;
  }
}

export default async function MyPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAuth();
  const params = searchParams ? await searchParams : {};
  const handoffRaw = params.console_handoff;
  const handoffCode = Array.isArray(handoffRaw) ? handoffRaw[0] : handoffRaw;
  const handoffMsg = consoleHandoffMessage(handoffCode);
  const { locale, messages: t } = await getT();
  const forms = getFormMessages(locale);
  const certLabels = getLabelMessages(locale).certification;
  const siteRoleLabels = getLabelMessages(locale).siteRole;
  const userId = session.user.id;
  const consoleBaseUrl = process.env.NEXT_PUBLIC_OPERATOR_CONSOLE_URL ?? null;

  const communities = await getUserCommunities(userId);

  const [
    permissionRows,
    dbUser,
    moduleRoleRequests,
    committeeMembershipRequests,
    wildModuleRegistrations,
    certApplications,
    identity,
    layers,
    operatorCerts,
    affiliations,
    consoleReachable,
  ] = await Promise.all([
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
    listOperatorOrgCertifications(userId),
    listUserAffiliations(userId),
    isOperatorConsoleReachable(consoleBaseUrl),
  ]);

  const dateLocale = localeToBcp47(locale);
  const operatorOrgs = operatorCerts
    .filter((c) => c.organization)
    .map((c) => ({
      organizationId: c.organization!.id,
      legalName: c.organization!.legalName,
      corporateNumber: c.organization!.corporateNumber,
      certificateNo: c.certificateNo,
      expiresAt: c.expiresAt.toLocaleDateString(dateLocale),
    }));

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
  const isSiteAdmin = session.user.siteRole === "ADMIN";

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

  const hasOrgAffiliation = affiliations.some(
    (a) => a.status === "PENDING" || a.status === "VERIFIED",
  );
  const hasOooCert = operatorOrgs.length > 0;

  const showOnboarding =
    needsSetupChecklist({
      profileComplete: !profileIncomplete,
      hasOrgAffiliation,
      hasOooCert,
    }) ||
    isNewParticipant({
      communities,
      wildModuleCount: wildModuleRegistrations.length,
      pendingOrApprovedRequests: moduleRoleRequests.filter(
        (r) => r.status === "APPROVED" || r.status === "PENDING",
      ).length,
    });

  const onboardingSteps = buildOnboardingSteps({
    mp,
    profileComplete: !profileIncomplete,
    hasOrgAffiliation,
    hasOooCert,
    hasParticipation,
  });

  const affiliationSummaries = affiliations.map((a) => ({
    legalName: a.organization.legalName,
    corporateNumberDisplay: formatCorporateNumberDisplay(a.organization.corporateNumber),
    status: a.status as "PENDING" | "VERIFIED" | "REJECTED",
  }));

  const quickActions = [
    { href: "/committees", label: mp.actionCommittees },
    { href: "/modules", label: mp.actionModules },
    { href: "/wild-modules/register", label: mp.actionProposeModule },
    { href: "/certifications", label: mp.actionCertifications },
    { href: "/learning", label: mp.actionLearning },
    { href: "/settings/organization", label: s.organization },
    { href: "/settings/profile?edit=1", label: mp.actionSettings },
    ...(profilePath ? [{ href: profilePath, label: mp.actionPublicProfile }] : []),
    ...(pendingReviewCount > 0
      ? [
          {
            href: "/governance#review-queues",
            label: mp.reviewPendingBadge.replace("{count}", String(pendingReviewCount)),
          },
        ]
      : []),
    ...(isSiteAdmin
      ? [
          { href: "/admin/users", label: mp.adminManageUsers },
          { href: "/admin", label: mp.adminDashboard },
        ]
      : []),
  ];

  const detailSections = (
    <>
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

  const identitySection = (
    <MyPageIdentityHub
      identity={identity}
      layers={layers}
      affiliations={affiliationSummaries}
      labels={{
        title: mp.identityTitle,
        openOrgId: mp.openOrgIdLabel,
        openOrgIdHint: mp.openOrgIdHint,
        layerCommunity: s.layerCommunityTitle,
        organization: s.organization,
        organizationHint: s.organizationDesc,
        organizationEmpty: s.orgEmpty,
        claimOrg: mp.opsClaimOrg,
        orgPending: forms.certification.orgPendingBadge,
        orgVerified: forms.certification.orgVerifiedBadge,
        connected: s.layerStatusComplete,
        notConnected: s.layerStatusIncomplete,
        partial: s.layerStatusPartial,
        editProfile: mp.editProfile,
      }}
    />
  );

  return (
    <>
      <section className="mypage-hero">
        <div className="mypage-hero-inner page-wrap">
          <div className="mypage-hero-row">
            <div>
              <h1 className="mypage-hero-name">{displayName}</h1>
              <p className="mypage-hero-meta">
                {mp.openOrgIdLabel}: {identity.email ?? session.user.primaryEmail ?? "—"}
              </p>
            </div>
            <span className="badge badge-navy mypage-hero-role">
              {siteRoleLabels[session.user.siteRole]}
            </span>
          </div>
          <div className="mypage-hero-actions">
            {!hasOrgAffiliation ? (
              <Link href="/settings/organization" className="btn btn-primary btn-sm">
                {mp.opsClaimOrg}
              </Link>
            ) : !hasOooCert ? (
              <Link href="/certifications/apply" className="btn btn-primary btn-sm">
                {mp.opsApplyOoo}
              </Link>
            ) : (
              <Link href="/committees" className="btn btn-primary btn-sm">
                {mp.actionCommittees}
              </Link>
            )}
            <Link href="/wild-modules/register" className="btn btn-ghost btn-sm">
              {mp.actionProposeModule}
            </Link>
            {profilePath && (
              <Link href={profilePath} className="btn btn-ghost btn-sm">
                {mp.viewPublicProfile}
              </Link>
            )}
            {isSiteAdmin && (
              <Link href="/admin" className="btn btn-ghost btn-sm">
                {mp.adminDashboard}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="page-wrap mypage-body">
        {handoffMsg && (
          <div className="mypage-alert" role="alert">
            <p>{handoffMsg}</p>
          </div>
        )}
        {profileIncomplete && (
          <div className="mypage-alert">
            <p>{t.userPages.registerIncompleteBanner}</p>
            <Link href="/settings/profile" className="btn btn-primary btn-sm">
              {t.userPages.registerGoToForm}
            </Link>
          </div>
        )}

        {isSiteAdmin && (
          <MyPageAdminSection
            labels={{
              title: mp.adminTitle,
              desc: mp.adminDesc,
              manageUsers: mp.adminManageUsers,
              dashboard: mp.adminDashboard,
            }}
          />
        )}

        {showOnboarding && (
          <>
            <WelcomeBanner
              userName={displayName}
              title={mp.welcomeTitle}
              body={mp.welcomeBody}
              cta={!hasOrgAffiliation ? mp.opsClaimOrg : mp.welcomeCta}
              href={!hasOrgAffiliation ? "/settings/organization" : "/modules#registry"}
            />
            <MyPageOnboardingChecklist
              steps={onboardingSteps}
              title={mp.onboardingTitle}
              subtitle={mp.onboardingSub}
              progressLabel={mp.onboardingProgress}
            />
          </>
        )}

        {identitySection}

        <MyPageOpsHub
          operatorOrgs={operatorOrgs}
          consoleBaseUrl={consoleBaseUrl}
          consoleReachable={consoleReachable}
          labels={{
            title: mp.opsTitle,
            desc: mp.opsDesc,
            empty: mp.opsEmpty,
            claimOrg: mp.opsClaimOrg,
            applyOoo: mp.opsApplyOoo,
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
            consoleOffline: mp.opsConsoleOffline,
          }}
        />

        <MyPageQuickActions title={mp.actionsTitle} actions={quickActions} />

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
