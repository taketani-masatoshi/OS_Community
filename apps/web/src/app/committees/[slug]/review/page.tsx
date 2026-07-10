import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n";
import { getFormMessages, getLabelMessages } from "@os-community/shared";
import {
  getCommitteeBySlug,
  getCommitteeDisplayName,
  getCommitteeMemberRoleLabel,
} from "@/lib/committees";
import {
  canAccessCommitteeReviewPage,
  filterReviewableCommitteeMembershipRequests,
  filterReviewableModuleRoleRequests,
} from "@/lib/review-authorization";
import { CommitteeReviewActions } from "@/components/CommitteeReviewActions";
import { AdminChairNominationActions } from "@/components/AdminChairNominationActions";
import { isCommitteeMembershipRequestAvailable } from "@/lib/prisma-committee-models";
import { listPendingChairNominations } from "@/lib/committee-chair";

export default async function CommitteeReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/committees/${slug}/review`)}`);
  }

  const committee = await getCommitteeBySlug(slug);
  if (!committee) notFound();

  const canReview = await canAccessCommitteeReviewPage(
    session.user.id,
    session.user.siteRole,
    committee,
  );
  if (!canReview) {
    redirect(`/committees/${slug}`);
  }

  const { locale, messages: t } = await getT();
  const cp = t.committeesPage;
  const forms = getFormMessages(locale);
  const labels = getLabelMessages(locale);
  const membershipReady = isCommitteeMembershipRequestAvailable();

  const moduleRoleRequestsRaw = committee.moduleId
    ? await prisma.moduleRoleRequest.findMany({
        where: { moduleId: committee.moduleId, status: "PENDING" },
        include: {
          module: { select: { slug: true, name: true } },
          user: { select: { githubLogin: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const membershipRequestsRaw =
    committee.type !== "MODULE" && membershipReady
      ? await prisma.committeeMembershipRequest.findMany({
          where: { committeeId: committee.id, status: "PENDING" },
          include: {
            user: { select: { githubLogin: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        })
      : [];

  const moduleRoleRequests = await filterReviewableModuleRoleRequests(
    session.user.id,
    session.user.siteRole,
    moduleRoleRequestsRaw,
  );
  const membershipRequests = await filterReviewableCommitteeMembershipRequests(
    session.user.id,
    session.user.siteRole,
    membershipRequestsRaw,
  );

  const chairNominations = await listPendingChairNominations(committee.id);

  const displayName = getCommitteeDisplayName(committee, locale);

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <Link href={`/committees/${slug}`} className="hero-back-link">
            ← {displayName}
          </Link>
          <h1 className="lf-hero-title-sm">{cp.reviewQueueTitle}</h1>
          <p className="lf-hero-lead">{cp.reviewQueueDesc.replace("{name}", displayName)}</p>
        </div>
      </section>

      <div className="page-wrap">
        {committee.moduleId && (
          <section style={{ marginBottom: "2rem" }}>
            <h2 className="section-title">
              {cp.moduleRoleRequestsTitle} ({moduleRoleRequests.length})
            </h2>
            {moduleRoleRequests.length === 0 ? (
              <p className="page-muted-note">{cp.reviewQueueEmpty}</p>
            ) : (
              moduleRoleRequests.map((r) => (
                <div key={r.id} className="lf-card" style={{ marginBottom: "1rem" }}>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span className="badge badge-default">{labels.moduleRole[r.role]}</span>
                    <span style={{ marginLeft: "0.5rem" }}>
                      {r.user.githubLogin ?? r.user.name} →{" "}
                      <Link href={`/modules/${r.module.slug}`}>{r.module.name}</Link>
                    </span>
                  </div>
                  {r.message && (
                    <p className="page-muted-note" style={{ fontSize: "0.9rem" }}>
                      {r.message}
                    </p>
                  )}
                  <CommitteeReviewActions kind="module-role" requestId={r.id} labels={forms.admin} />
                </div>
              ))
            )}
          </section>
        )}

        {committee.type !== "MODULE" && (
          <section style={{ marginBottom: "2rem" }}>
            <h2 className="section-title">
              {cp.membershipRequestsTitle} ({membershipRequests.length})
            </h2>
            {!membershipReady ? (
              <p className="page-muted-note">{forms.committeeMembership.error}</p>
            ) : membershipRequests.length === 0 ? (
              <p className="page-muted-note">{cp.reviewQueueEmpty}</p>
            ) : (
              membershipRequests.map((r) => (
                <div key={r.id} className="lf-card" style={{ marginBottom: "1rem" }}>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span className="badge badge-success">
                      {getCommitteeMemberRoleLabel(
                        r.desiredRole === "REVIEWER" ? "REVIEWER" : "MEMBER",
                        locale,
                      )}
                    </span>
                    <span style={{ marginLeft: "0.5rem" }}>{r.user.githubLogin ?? r.user.name}</span>
                  </div>
                  {r.message && (
                    <p className="page-muted-note" style={{ fontSize: "0.9rem" }}>
                      {r.message}
                    </p>
                  )}
                  <CommitteeReviewActions
                    kind="committee-membership"
                    requestId={r.id}
                    committeeSlug={slug}
                    labels={forms.admin}
                  />
                </div>
              ))
            )}
          </section>
        )}

        {(committee.type === "DOMAIN" || committee.type === "MODULE") && (
          <section>
            <h2 className="section-title">
              {cp.chairNominationQueueTitle} ({chairNominations.length})
            </h2>
            {chairNominations.length === 0 ? (
              <p className="page-muted-note">{cp.reviewQueueEmpty}</p>
            ) : (
              chairNominations.map((nomination) => (
                <div key={nomination.id} className="lf-card" style={{ marginBottom: "1rem" }}>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span className="badge badge-navy">CHAIR</span>
                    <span style={{ marginLeft: "0.5rem" }}>
                      {nomination.candidate.githubLogin ?? nomination.candidate.name}
                    </span>
                  </div>
                  {nomination.statement && (
                    <p className="page-muted-note" style={{ fontSize: "0.9rem" }}>
                      {nomination.statement}
                    </p>
                  )}
                  <AdminChairNominationActions
                    committeeSlug={slug}
                    nominationId={nomination.id}
                    labels={forms.admin}
                  />
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </>
  );
}
