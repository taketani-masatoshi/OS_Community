import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getT } from "@/lib/i18n";
import { getFormMessages, getLabelMessages, getPageMessages } from "@os-community/shared";
import { PageLayout, Card } from "@/components/ui";
import { getCommitteeAdminDetail } from "@/lib/admin-committees";
import { getCommitteeDisplayName, getCommitteeMemberRoleLabel, getCommitteeTypeLabel } from "@/lib/committees";
import { getUserProfilePath } from "@/lib/users";
import { AdminCommitteeMemberForm } from "@/components/AdminCommitteeMemberForm";
import { AdminCommitteeMemberActions } from "@/components/AdminCommitteeMemberActions";
import { AdminChairNominationActions } from "@/components/AdminChairNominationActions";
import { CommitteeReviewActions } from "@/components/CommitteeReviewActions";

export default async function AdminCommitteeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireRole(["ADMIN"], "/admin/committees");
  const { slug } = await params;
  const detail = await getCommitteeAdminDetail(slug);
  if (!detail) notFound();

  const { locale } = await getT();
  const a = getPageMessages(locale).admin;
  const forms = getFormMessages(locale);
  const labels = getLabelMessages(locale);
  const { committee, membershipRequests, chairNominations, moduleRoleRequests } = detail;
  const displayName = getCommitteeDisplayName(committee, locale);
  const roleLabels = {
    CHAIR: getCommitteeMemberRoleLabel("CHAIR", locale),
    REVIEWER: getCommitteeMemberRoleLabel("REVIEWER", locale),
    MEMBER: getCommitteeMemberRoleLabel("MEMBER", locale),
    OBSERVER: getCommitteeMemberRoleLabel("OBSERVER", locale),
  };

  return (
    <PageLayout title={displayName} description={getCommitteeTypeLabel(committee.type, locale)}>
      <p style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Link href="/admin/committees" className="btn btn-ghost btn-sm">
          ← {a.committeesDetailBack}
        </Link>
        <Link href={`/committees/${committee.slug}`} className="btn btn-ghost btn-sm">
          {a.committeesViewPublic}
        </Link>
        <Link href={`/committees/${committee.slug}/review`} className="btn btn-ghost btn-sm">
          {a.committeesViewReview}
        </Link>
      </p>

      <AdminCommitteeMemberForm committeeSlug={committee.slug} roleLabels={roleLabels} labels={a} />

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>{a.committeesMembersTitle}</h2>
        {committee.members.length === 0 ? (
          <p className="page-muted-note">{a.committeesNoMembers}</p>
        ) : (
          <div className="admin-users-table-wrap">
            <table className="lf-table">
              <thead>
                <tr>
                  <th>{a.committeesTableName}</th>
                  <th>{a.committeesMemberRole}</th>
                  <th>{a.committeesTableActions}</th>
                </tr>
              </thead>
              <tbody>
                {committee.members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <Link href={getUserProfilePath(member.user)}>
                        {member.user.githubLogin ?? member.user.name ?? member.user.email ?? member.user.id}
                      </Link>
                    </td>
                    <td>{roleLabels[member.role]}</td>
                    <td>
                      <AdminCommitteeMemberActions
                        committeeSlug={committee.slug}
                        userId={member.user.id}
                        currentRole={member.role}
                        roleLabels={roleLabels}
                        labels={a}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {membershipRequests.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>{a.committeesPendingMembership}</h2>
          {membershipRequests.map((request) => (
            <Card key={request.id}>
              <strong>{request.user.githubLogin ?? request.user.name}</strong>
              <span className="page-muted-note" style={{ marginLeft: "0.5rem" }}>
                {request.desiredRole}
              </span>
              {request.message && <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>{request.message}</p>}
              <CommitteeReviewActions
                kind="committee-membership"
                requestId={request.id}
                committeeSlug={committee.slug}
                labels={forms.admin}
              />
            </Card>
          ))}
        </section>
      )}

      {chairNominations.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>{a.committeesPendingChair}</h2>
          {chairNominations.map((nomination) => (
            <Card key={nomination.id}>
              <strong>{nomination.candidate.githubLogin ?? nomination.candidate.name}</strong>
              {nomination.statement && (
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>{nomination.statement}</p>
              )}
              <AdminChairNominationActions
                committeeSlug={committee.slug}
                nominationId={nomination.id}
                labels={forms.admin}
              />
            </Card>
          ))}
        </section>
      )}

      {moduleRoleRequests.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>{a.committeesPendingModuleRole}</h2>
          {moduleRoleRequests.map((request) => (
            <Card key={request.id}>
              <strong>{request.user.githubLogin ?? request.user.name}</strong>
              <span className="page-muted-note" style={{ marginLeft: "0.5rem" }}>
                {request.role}
              </span>
              <CommitteeReviewActions kind="module-role" requestId={request.id} labels={forms.admin} />
            </Card>
          ))}
        </section>
      )}

      {membershipRequests.length === 0 &&
        chairNominations.length === 0 &&
        moduleRoleRequests.length === 0 && (
          <p className="page-muted-note">{a.committeesNoPending}</p>
        )}
    </PageLayout>
  );
}
