"use client";

import Link from "next/link";
import { useState } from "react";
import { ModuleRoleRequestForm } from "@/components/ModuleRoleRequestForm";
import { ModulePromotionRequestForm } from "@/components/ModulePromotionRequestForm";
import { LifecyclePipeline } from "@/components/LifecyclePipeline";
import type { FormMessages } from "@os-community/shared";
import type { Locale } from "@os-community/shared";

type TabId = "overview" | "participate" | "developer";

export type ModuleDetailLabels = {
  backToRegistry: string;
  badgeUnreviewed: string;
  wildWarningTitle: string;
  wildWarningBody: string;
  tabOverview: string;
  tabParticipate: string;
  tabDeveloper: string;
  stickyApplyCta: string;
  signInToApply: string;
  lifecycleTitle: string;
  committeeTitle: string;
  committeeDesc: string;
  committeeCta: string;
  githubTitle: string;
  githubMissing: string;
  githubConnectCta: string;
  rolesTitle: string;
  maintainerOpen: string;
  applyTitle: string;
  applySignInHint: string;
  wildContributorHint: string;
  githubRequiredHint: string;
  mypageLink: string;
  promotionTitle: string;
  promotionPending: string;
  promotionRejected: string;
  promotionApproved: string;
  promotionStandardsLink: string;
  roleHelpTitle: string;
  roleHelpContributor: string;
  roleHelpDeputy: string;
  roleHelpMaintainer: string;
  overviewDescFallback: string;
  slugLabel: string;
  uiRole: string;
  uiMembers: string;
  uiNone: string;
  moduleRoles: FormMessages["moduleRole"]["roles"];
};

export function ModuleDetailView({
  mod,
  locale,
  labels,
  forms,
  lifecycle,
  lifecycleLabel,
  isWild,
  latestTag,
  committeeHref,
  rolesByType,
  sessionUser,
  userPendingRequest,
  promotion,
  canRequestPromotion,
  showApplySection,
  applyMaintainerHidden,
  registeredNotice,
  registeredNextSteps,
  description,
}: {
  mod: {
    id: string;
    slug: string;
    name: string;
    githubRepo: string | null;
  };
  locale: Locale;
  labels: ModuleDetailLabels;
  forms: FormMessages;
  lifecycle: string;
  lifecycleLabel: string;
  isWild: boolean;
  latestTag: string | null;
  committeeHref: string;
  rolesByType: Record<"MAINTAINER" | "DEPUTY" | "CONTRIBUTOR", string[]>;
  sessionUser: { id: string; githubLogin?: string | null } | null;
  userPendingRequest: boolean | undefined;
  promotion: { status: string } | null | undefined;
  canRequestPromotion: boolean;
  showApplySection: boolean;
  applyMaintainerHidden: boolean;
  registeredNotice?: string;
  registeredNextSteps?: string;
  description: string;
}) {
  const [tab, setTab] = useState<TabId>("overview");

  const applyHref = sessionUser
    ? `#apply`
    : `/login/start?callbackUrl=${encodeURIComponent(`/modules/${mod.slug}#apply`)}`;

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: labels.tabOverview },
    { id: "participate", label: labels.tabParticipate },
    { id: "developer", label: labels.tabDeveloper },
  ];

  return (
    <>
      <div className="module-detail-sticky-bar">
        <Link href={applyHref} className="btn btn-primary btn-sm module-detail-sticky-cta">
          {sessionUser ? labels.stickyApplyCta : labels.signInToApply}
        </Link>
      </div>

      <section className="lf-hero module-detail-hero" style={{ padding: "2.5rem 1.5rem" }}>
        <div className="lf-hero-inner">
          <Link href="/modules" style={{ color: "var(--hero-muted)", fontSize: "0.85rem" }}>
            {labels.backToRegistry}
          </Link>
          <h1 style={{ fontSize: "2rem", marginTop: "0.75rem" }}>{mod.name}</h1>
          {description ? (
            <p className="lf-hero-lead">{description}</p>
          ) : (
            <p className="lf-hero-lead">{labels.overviewDescFallback}</p>
          )}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <span className="badge badge-navy">{lifecycleLabel}</span>
            {isWild && <span className="badge badge-danger">{labels.badgeUnreviewed}</span>}
            {latestTag && <span className="badge badge-default">{latestTag}</span>}
          </div>
          <div className="module-detail-tabs" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`module-detail-tab ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="page-wrap">
        {registeredNotice && (
          <div className="lf-card success-card" style={{ marginBottom: "1.5rem" }}>
            <p style={{ margin: 0, color: "var(--success)" }}>{registeredNotice}</p>
            {registeredNextSteps && (
              <p className="page-muted-note" style={{ marginBottom: 0 }}>
                {registeredNextSteps}
              </p>
            )}
          </div>
        )}

        {isWild && tab !== "developer" && (
          <div className="lf-card" style={{ borderColor: "var(--warning)", marginBottom: "1.5rem" }}>
            <strong style={{ color: "var(--warning)" }}>{labels.wildWarningTitle}</strong>
            <p style={{ margin: "0.5rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
              {labels.wildWarningBody}
            </p>
          </div>
        )}

        {tab === "overview" && (
          <>
            <h2 className="section-title">{labels.rolesTitle}</h2>
            <table className="lf-table">
              <thead>
                <tr>
                  <th>{labels.uiRole}</th>
                  <th>{labels.uiMembers}</th>
                </tr>
              </thead>
              <tbody>
                {(["MAINTAINER", "DEPUTY", "CONTRIBUTOR"] as const).map((roleType) => (
                  <tr key={roleType}>
                    <td>
                      <strong>{labels.moduleRoles[roleType]}</strong>
                    </td>
                    <td>
                      {rolesByType[roleType].length === 0 ? (
                        <span style={{ color: "var(--muted)" }}>
                          {roleType === "MAINTAINER" ? labels.maintainerOpen : labels.uiNone}
                        </span>
                      ) : (
                        rolesByType[roleType].join(", ")
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="page-desc">{labels.committeeDesc}</p>
            <Link href={committeeHref} className="btn btn-primary btn-sm">
              {labels.committeeCta}
            </Link>
          </>
        )}

        {tab === "participate" && (
          <>
            <div className="lf-card role-help-card" style={{ marginBottom: "1.5rem" }}>
              <h3 className="section-title" style={{ marginTop: 0, fontSize: "1rem" }}>
                {labels.roleHelpTitle}
              </h3>
              <ul className="role-help-list">
                <li>
                  <strong>{labels.moduleRoles.CONTRIBUTOR}</strong> — {labels.roleHelpContributor}
                </li>
                <li>
                  <strong>{labels.moduleRoles.DEPUTY}</strong> — {labels.roleHelpDeputy}
                </li>
                <li>
                  <strong>{labels.moduleRoles.MAINTAINER}</strong> — {labels.roleHelpMaintainer}
                </li>
              </ul>
            </div>

            {isWild && canRequestPromotion && (
              <section id="promotion" className="lf-card" style={{ marginBottom: "1.5rem" }}>
                <h2 className="section-title" style={{ marginTop: 0 }}>
                  {labels.promotionTitle}
                </h2>
                {promotion?.status === "PENDING" ? (
                  <p style={{ color: "var(--success)", margin: 0 }}>{labels.promotionPending}</p>
                ) : promotion?.status === "REJECTED" ? (
                  <>
                    <p className="form-error">{labels.promotionRejected}</p>
                    <ModulePromotionRequestForm moduleSlug={mod.slug} labels={forms.modulePromotion} />
                  </>
                ) : promotion?.status === "APPROVED" ? (
                  <p style={{ color: "var(--success)", margin: 0 }}>{labels.promotionApproved}</p>
                ) : (
                  <ModulePromotionRequestForm moduleSlug={mod.slug} labels={forms.modulePromotion} />
                )}
                <p className="page-muted-note" style={{ marginTop: "1rem", marginBottom: 0 }}>
                  <Link href="/standards" className="btn btn-primary btn-sm">
                    {labels.promotionStandardsLink}
                  </Link>
                </p>
              </section>
            )}

            <section id="apply">
              <h2 className="section-title">{labels.applyTitle}</h2>
              {!sessionUser ? (
                <div className="lf-card">
                  <p className="page-muted-note">{labels.applySignInHint}</p>
                  <Link
                    href={`/login/start?callbackUrl=${encodeURIComponent(`/modules/${mod.slug}#apply`)}`}
                    className="btn btn-primary btn-sm"
                  >
                    {labels.signInToApply}
                  </Link>
                </div>
              ) : userPendingRequest ? (
                <div className="lf-card success-card">
                  <p style={{ margin: 0, color: "var(--success)" }}>{forms.moduleRole.pendingReview}</p>
                  <p className="page-muted-note" style={{ marginBottom: 0 }}>
                    <Link href="/mypage" className="btn btn-primary btn-sm">
                      {labels.mypageLink}
                    </Link>
                  </p>
                </div>
              ) : showApplySection ? (
                <div className="lf-card">
                  {isWild && <p className="page-muted-note">{labels.wildContributorHint}</p>}
                  {!sessionUser.githubLogin && (
                    <p className="page-muted-note">
                      {labels.githubRequiredHint}{" "}
                      <Link href="/settings/connections" className="btn btn-primary btn-sm">
                        {labels.githubConnectCta}
                      </Link>
                    </p>
                  )}
                  <ModuleRoleRequestForm
                    moduleId={mod.id}
                    moduleSlug={mod.slug}
                    labels={forms.moduleRole}
                    hideMaintainer={applyMaintainerHidden}
                  />
                </div>
              ) : null}
            </section>
          </>
        )}

        {tab === "developer" && (
          <>
            <p className="page-muted-note">
              {labels.slugLabel}: <code>{mod.slug}</code>
            </p>
            <h2 className="section-title">{labels.lifecycleTitle}</h2>
            <LifecyclePipeline locale={locale} highlight={lifecycle} />
            <h2 className="section-title">{labels.committeeTitle}</h2>
            <p className="page-desc">{labels.committeeDesc}</p>
            <Link href={committeeHref} className="btn btn-primary btn-sm">
              {labels.committeeCta}
            </Link>
            <h2 className="section-title">{labels.githubTitle}</h2>
            {mod.githubRepo ? (
              <p>
                <a href={mod.githubRepo} target="_blank" rel="noopener noreferrer">
                  {mod.githubRepo}
                </a>
              </p>
            ) : (
              <>
                <p className="page-muted-note">{labels.githubMissing}</p>
                <Link href="/github" className="btn btn-primary btn-sm">
                  {labels.githubConnectCta}
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
