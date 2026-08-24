import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageMessages } from "@os-community/shared";
import { getAuthSession } from "@/lib/session";
import { getT } from "@/lib/i18n";
import { getUserProfilePath } from "@/lib/users";
import {
  getCommitteeBySlug,
  getCommitteeDisplayName,
  getCommitteeTypeLabel,
  getCommitteeMemberRoleLabel,
  getCommitteeDescription,
  getCommitteeDomainLabel,
  getRelatedModuleCommitteesForDomain,
} from "@/lib/committees";
import { canAccessCommitteeReviewPage } from "@/lib/review-authorization";
import { getPendingReviewCountForCommittee } from "@/lib/committee-review-counts";
import { CommitteeMembershipRequestForm } from "@/components/CommitteeMembershipRequestForm";
import { CommitteeChairNominationForm } from "@/components/CommitteeChairNominationForm";
import { getFormMessages } from "@os-community/shared";
import { prisma } from "@/lib/prisma";
import {
  isCommitteeChairNominationAvailable,
  isCommitteeMembershipRequestAvailable,
} from "@/lib/prisma-committee-models";
import { listPendingChairNominations } from "@/lib/committee-chair";
import {
  getCommitteeGovernanceLabels,
  getActiveCommitteeChair,
} from "@/lib/committees";

export default async function CommitteeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale, messages: t } = await getT();
  const ui = getPageMessages(locale).ui;
  const cp = t.committeesPage;
  const session = await getAuthSession();
  const committee = await getCommitteeBySlug(slug);
  if (!committee) notFound();

  const forms = getFormMessages(locale);
  const supportsDirectApply = committee.type === "DOMAIN";
  const membershipModelsReady = isCommitteeMembershipRequestAvailable();
  const chairNominationModelsReady = isCommitteeChairNominationAvailable();
  let userPendingMembershipRequest = false;
  let userIsMember = false;
  let canReview = false;
  let pendingReviewCount = 0;

  if (session?.user?.id) {
    const [pending, member, reviewAccess] = await Promise.all([
      supportsDirectApply && membershipModelsReady
        ? prisma.committeeMembershipRequest.findFirst({
            where: { committeeId: committee.id, userId: session.user.id, status: "PENDING" },
          })
        : Promise.resolve(null),
      prisma.committeeMember.findUnique({
        where: {
          committeeId_userId: { committeeId: committee.id, userId: session.user.id },
        },
      }),
      canAccessCommitteeReviewPage(session.user.id, session.user.siteRole, committee),
    ]);
    userPendingMembershipRequest = Boolean(pending);
    userIsMember = Boolean(member);
    canReview = reviewAccess;
    pendingReviewCount = reviewAccess
      ? await getPendingReviewCountForCommittee(session.user.id, session.user.siteRole, committee)
      : 0;
  }

  const isStandard = committee.type === "STANDARD";
  const isDomain = committee.type === "DOMAIN";
  const isModule = committee.type === "MODULE";
  const moduleSlug = committee.module?.slug;
  const applyHref = moduleSlug ? `/modules/${moduleSlug}#apply` : null;
  const applyLoginHref = moduleSlug
    ? `/login?callbackUrl=${encodeURIComponent(`/modules/${moduleSlug}#apply`)}`
    : null;

  const description = getCommitteeDescription(committee, locale);
  const domainLabel = getCommitteeDomainLabel(committee, locale);
  const relatedModuleCommittees = isDomain
    ? await getRelatedModuleCommitteesForDomain(committee.id)
    : [];
  const activeChair = getActiveCommitteeChair(committee.members);
  const governanceLabels = getCommitteeGovernanceLabels(committee, locale);
  const pendingChairNominations =
    canReview && chairNominationModelsReady && (isDomain || isModule)
      ? await listPendingChairNominations(committee.id)
      : [];
  const chairNominationCandidates = committee.members
    .filter((member) => member.role !== "CHAIR" && !member.termEnd)
    .map((member) => ({
      userId: member.userId,
      label: member.user.githubLogin ?? member.user.name ?? member.userId,
    }));

  const reviewCtaLabel =
    pendingReviewCount > 0
      ? `${cp.reviewQueueCta} (${pendingReviewCount})`
      : cp.reviewQueueCta;

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <Link href="/committees" className="hero-back-link">
            ← {t.nav.committees}
          </Link>
          <div className="card-badge-row" style={{ marginTop: "0.75rem" }}>
            <span className={`badge ${isStandard || isDomain ? "badge-navy" : "badge-default"}`}>
              {isStandard
                ? t.mypage.standardBadge
                : isDomain
                  ? cp.domainBadge
                  : t.mypage.moduleBadge}
            </span>
            <span className="badge badge-default">{getCommitteeTypeLabel(committee.type, locale)}</span>
          </div>
          <h1 className="lf-hero-title-sm">{getCommitteeDisplayName(committee, locale)}</h1>
          <p className="lf-hero-lead">{description}</p>
          {domainLabel && (
            <p className="page-muted-note" style={{ color: "var(--ink-soft)" }}>
              {domainLabel}
            </p>
          )}
          <div className="lf-hero-actions">
            {committee.module && (
              <Link href={`/modules/${committee.module.slug}`} className="btn btn-primary btn-sm">
                {committee.module.name}
              </Link>
            )}
            {canReview && (
              <Link href={`/committees/${slug}/review`} className="btn btn-ghost btn-sm">
                {reviewCtaLabel}
              </Link>
            )}
            {isStandard && (
              <Link href="/standards" className="btn btn-ghost btn-sm">
                {t.home.lifecycleCta}
              </Link>
            )}
            {isDomain && (
              <Link href="/governance" className="btn btn-ghost btn-sm">
                {t.about.governanceCta}
              </Link>
            )}
          </div>
          {isStandard && (
            <p className="page-muted-note" style={{ color: "var(--ink-soft)", marginTop: "1rem" }}>
              {cp.hierarchyNote}
            </p>
          )}
        </div>
      </section>

      <div className="page-wrap">
        {(isDomain || isModule) && (
          <div className="lf-card governance-chair-card">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              {cp.chairSectionTitle}
            </h2>
            {governanceLabels.jurisdiction && governanceLabels.expertDomain && (
              <p className="page-muted-note">
                {cp.chairScopeLabel}: {governanceLabels.jurisdiction} · {governanceLabels.expertDomain}
              </p>
            )}
            {activeChair ? (
              <>
                <p>
                  <span className="badge badge-success">{cp.chairBadge}</span>{" "}
                  <Link href={getUserProfilePath(activeChair.user)}>
                    {activeChair.user.githubLogin ?? activeChair.user.name ?? "—"}
                  </Link>
                </p>
                <p className="page-muted-note">
                  {cp.chairTermLabel}: {activeChair.termStart.toLocaleDateString(locale)} →{" "}
                  {activeChair.termEnd
                    ? activeChair.termEnd.toLocaleDateString(locale)
                    : cp.chairTermOpen}
                </p>
              </>
            ) : (
              <p className="page-muted-note">{cp.chairVacant}</p>
            )}
            <p className="page-muted-note">{cp.chairOpsDesc}</p>
          </div>
        )}

        {canReview && pendingChairNominations.length > 0 && (
          <>
            <h2 className="section-title">{cp.chairNominationQueueTitle}</h2>
            <ul className="list-muted">
              {pendingChairNominations.map((nomination) => (
                <li key={nomination.id}>
                  {nomination.candidate.githubLogin ?? nomination.candidate.name ?? "—"} —{" "}
                  {nomination.statement ?? cp.chairNominationNoStatement}
                </li>
              ))}
            </ul>
          </>
        )}

        {chairNominationModelsReady &&
          userIsMember &&
          canReview &&
          chairNominationCandidates.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <CommitteeChairNominationForm
              committeeSlug={slug}
              members={chairNominationCandidates}
              labels={{
                title: cp.chairNominationTitle,
                desc: cp.chairNominationDesc,
                candidate: cp.chairNominationCandidate,
                statement: cp.chairNominationStatement,
                submit: cp.chairNominationSubmit,
                success: cp.chairNominationSuccess,
                error: cp.chairNominationError,
              }}
            />
          </div>
        )}

        {isDomain && committee.governedModules.length > 0 && (
          <>
            <h2 className="section-title">{cp.governedModulesTitle}</h2>
            <ul className="list-muted">
              {committee.governedModules.map(({ module: mod }) => (
                <li key={mod.slug}>
                  <Link href={`/modules/${mod.slug}`}>{mod.name}</Link>{" "}
                  <span className="page-muted-note">({mod.slug})</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {isDomain && relatedModuleCommittees.length > 0 && (
          <>
            <h2 className="section-title">{cp.relatedModuleCommitteesTitle}</h2>
            <ul className="list-muted">
              {relatedModuleCommittees.map((item) => (
                <li key={item.committeeSlug}>
                  <Link href={`/committees/${item.committeeSlug}`}>{item.moduleName}</Link>{" "}
                  <span className="page-muted-note">({item.moduleSlug})</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className="section-title">
          {cp.members} ({committee.members.length})
        </h2>
        {committee.members.length === 0 ? (
          <p className="page-muted-note">{t.mypage.committeesEmpty}</p>
        ) : (
          <table className="lf-table">
            <thead>
              <tr>
                <th>{ui.name}</th>
                <th>{ui.role}</th>
                <th>{cp.memberSpecialty}</th>
                <th>{cp.memberRegion}</th>
              </tr>
            </thead>
            <tbody>
              {committee.members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link href={getUserProfilePath(m.user)}>
                      {m.user.githubLogin ?? m.user.name ?? "—"}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      {getCommitteeMemberRoleLabel(m.role, locale)}
                    </span>
                  </td>
                  <td>{m.user.specialty ?? "—"}</td>
                  <td>{m.user.region ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="membership-policy-callout">
          <h3 className="membership-policy-callout-title">{cp.membershipPolicyTitle}</h3>
          <p>{cp.membershipPolicyBody}</p>

          <h4 className="section-title" style={{ marginTop: "1.25rem", fontSize: "1rem" }}>
            {cp.participationTitle}
          </h4>
          {isDomain && (
            <>
              <p className="page-muted-note">{cp.participationDomainDirect}</p>
              <p className="page-muted-note">{cp.participationDomainModulePath}</p>
            </>
          )}
          {isModule && applyHref && (
            <p className="page-muted-note">{cp.participationModulePath}</p>
          )}
          {isStandard && (
            <p className="page-muted-note">{cp.participationStandardNomination}</p>
          )}

          {supportsDirectApply && (
            <>
              <h4 className="section-title" style={{ marginTop: "1.25rem", fontSize: "1rem" }}>
                {cp.applyDirectTitle}
              </h4>
              <p className="page-muted-note">{cp.applyDirectDesc}</p>
              {!membershipModelsReady ? (
                <p className="page-muted-note">{forms.committeeMembership.error}</p>
              ) : !session?.user ? (
                <p className="section-cta" style={{ marginBottom: 0 }}>
                  <span className="page-muted-note">{cp.applySignInHintDirect} </span>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(`/committees/${slug}#apply-committee`)}`}
                    className="btn btn-primary btn-sm"
                  >
                    {t.nav.signIn}
                  </Link>
                </p>
              ) : userIsMember ? (
                <p className="page-muted-note" style={{ marginBottom: 0 }}>
                  {cp.alreadyMember}
                </p>
              ) : userPendingMembershipRequest ? (
                <p style={{ color: "var(--success)", marginBottom: 0 }}>
                  {forms.committeeMembership.pendingReview}
                </p>
              ) : (
                <div id="apply-committee">
                  <CommitteeMembershipRequestForm committeeSlug={slug} labels={forms.committeeMembership} />
                </div>
              )}
            </>
          )}

          {isModule && applyHref && (
            <p className="section-cta" style={{ marginBottom: 0 }}>
              {session?.user ? (
                <Link href={applyHref} className="btn btn-primary btn-sm">
                  {cp.applyToModuleCta}
                </Link>
              ) : (
                <>
                  <span className="page-muted-note">{cp.applySignInHint} </span>
                  {applyLoginHref && (
                    <Link href={applyLoginHref} className="btn btn-primary btn-sm">
                      {t.nav.signIn}
                    </Link>
                  )}
                </>
              )}
            </p>
          )}

          {isDomain && !applyHref && committee.governedModules.length === 0 && (
            <p className="section-cta" style={{ marginBottom: 0 }}>
              <Link href="/modules#registry" className="btn btn-primary btn-sm">
                {t.mypage.browseModules}
              </Link>
            </p>
          )}

          {isStandard && (
            <p className="section-cta" style={{ marginBottom: 0 }}>
              <Link href="/governance" className="btn btn-primary btn-sm">
                {t.about.governanceCta}
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
