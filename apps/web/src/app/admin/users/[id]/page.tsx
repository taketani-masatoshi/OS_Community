import Link from "next/link";
import { notFound } from "next/navigation";
import { getLabelMessages, localeToBcp47 } from "@os-community/shared";
import { requireRole } from "@/lib/session";
import { getT } from "@/lib/i18n";
import { getAdminUserDetail } from "@/lib/admin-users";
import { formatCorporateNumberDisplay } from "@/lib/org-affiliation";
import { AdminAffiliationDecideButtons } from "@/components/AdminAffiliationDecideButtons";
import { getUserProfilePath } from "@/lib/users";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"], "/admin/users");
  const { id } = await params;
  const { locale, messages: t } = await getT();
  const u = t.userPages;
  const roleLabels = getLabelMessages(locale).siteRole;
  const user = await getAdminUserDetail(id);
  if (!user) notFound();

  const dateLocale = localeToBcp47(locale);

  function statusLabel(status: string) {
    if (status === "VERIFIED") return u.adminUsersAffiliationVerified;
    if (status === "REJECTED") return u.adminUsersAffiliationRejected;
    return u.adminUsersAffiliationPending;
  }

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <Link href="/admin/users" className="hero-back-link">
            ← {u.adminUsersTitle}
          </Link>
          <h1 className="lf-hero-title-sm">{user.name ?? user.email ?? user.id}</h1>
          <p className="lf-hero-lead">{u.adminUsersDetailLead}</p>
        </div>
      </section>

      <div className="page-wrap">
        <section className="lf-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            {u.adminUsersDetailIdentity}
          </h2>
          <p>
            <strong>{u.adminUsersTableEmail}:</strong> {user.email ?? "—"}
          </p>
          <p>
            <strong>{u.adminUsersTableGoogle}:</strong>{" "}
            {user.accounts.some((a) => a.provider === "google")
              ? u.adminUsersGoogleYes
              : u.adminUsersGoogleNo}
          </p>
          <p>
            <strong>{u.adminUsersTableRole}:</strong> {roleLabels[user.siteRole]}
          </p>
          <p>
            <strong>{u.adminUsersTableStatus}:</strong>{" "}
            {user.accountStatus === "SUSPENDED"
              ? u.adminUsersStatusSuspended
              : u.adminUsersStatusActive}
          </p>
          {user.githubLogin && (
            <p>
              <strong>GitHub:</strong> @{user.githubLogin}
            </p>
          )}
          <p className="page-muted-note">
            {u.memberSince}: {user.createdAt.toLocaleDateString(dateLocale)}
          </p>
          <p style={{ marginTop: "1rem" }}>
            <Link href={getUserProfilePath(user)} className="btn btn-ghost btn-sm">
              {u.adminUsersViewProfile}
            </Link>
          </p>
        </section>

        <section className="lf-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            {u.adminUsersDetailAffiliations}
          </h2>
          {user.orgAffiliations.length === 0 ? (
            <p className="page-muted-note">{u.adminUsersAffiliationNone}</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {user.orgAffiliations.map((aff) => (
                <li
                  key={aff.id}
                  style={{
                    borderTop: "1px solid var(--border)",
                    padding: "1rem 0",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600 }}>{aff.organization.legalName}</p>
                  <p className="page-muted-note" style={{ margin: "0.25rem 0" }}>
                    {formatCorporateNumberDisplay(aff.organization.corporateNumber)} ·{" "}
                    {statusLabel(aff.status)}
                  </p>
                  {aff.title && <p className="page-muted-note">{aff.title}</p>}
                  {aff.rejectReason && (
                    <p style={{ color: "var(--danger)" }}>{aff.rejectReason}</p>
                  )}
                  {aff.status === "PENDING" && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <AdminAffiliationDecideButtons
                        affiliationId={aff.id}
                        labels={{
                          verify: u.adminUsersAffiliationVerify,
                          reject: u.adminUsersAffiliationReject,
                          rejectPrompt: u.adminUsersAffiliationRejectPrompt,
                          saved: u.adminUsersRoleSaved,
                          error: u.adminUsersErrorGeneric,
                        }}
                      />
                    </div>
                  )}
                  {aff.auditLogs.length > 0 && (
                    <ul className="list-muted" style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
                      {aff.auditLogs.map((log) => (
                        <li key={log.id}>
                          {log.createdAt.toLocaleString(dateLocale)} · {log.action}
                          {log.actor.name || log.actor.email
                            ? ` · ${log.actor.name ?? log.actor.email}`
                            : ""}
                          {log.note ? ` — ${log.note}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lf-card">
          <h2 className="section-title" style={{ marginTop: 0 }}>
            {u.adminUsersDetailAccounts}
          </h2>
          <ul className="list-muted">
            {user.accounts.map((a) => (
              <li key={`${a.provider}-${a.providerAccountId}`}>
                {a.provider}: {a.providerAccountId}
              </li>
            ))}
          </ul>
          <p className="page-muted-note" style={{ marginTop: "1rem" }}>
            {user._count.moduleRoles} {u.statsModules} · {user._count.certifications} {u.statsCerts} ·{" "}
            {user._count.committeeMemberships} {u.statsCommittees} · {user._count.githubConnections}{" "}
            GitHub repos
          </p>
        </section>
      </div>
    </>
  );
}
