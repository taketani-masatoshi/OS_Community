import Link from "next/link";
import { redirect } from "next/navigation";
import type { SiteRole } from "@os-community/db";
import { getLabelMessages, localeToBcp47 } from "@os-community/shared";
import { requireRole } from "@/lib/session";
import { auth } from "@/auth";
import { fillTemplate, getT } from "@/lib/i18n";
import { getUserProfilePath } from "@/lib/users";
import {
  ALLOWED_SITE_ROLES,
  ADMIN_USERS_PAGE_SIZE,
  listRecentRoleAuditLogs,
  listUsersForAdmin,
} from "@/lib/admin-users";
import { AdminUserRoleForm } from "@/components/AdminUserRoleForm";
import { AdminUserStatusActions } from "@/components/AdminUserStatusActions";
import { AdminAuditExportButton } from "@/components/AdminAuditExportButton";
import { BootstrapFounderButton } from "@/components/BootstrapFounderButton";

function buildAdminUsersHref(params: {
  q?: string;
  role?: string;
  affiliation?: string;
  page?: number;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.role) sp.set("role", params.role);
  if (params.affiliation) sp.set("affiliation", params.affiliation);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/admin/users?${qs}` : "/admin/users";
}

function displayUser(user: { name?: string | null; githubLogin?: string | null; email?: string | null }) {
  return user.name ?? user.githubLogin ?? user.email ?? "—";
}

const AFFILIATION_FILTERS = ["pending", "verified", "none"] as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; affiliation?: string; page?: string }>;
}) {
  await requireRole(["ADMIN"], "/admin/users");
  const session = await auth();
  const { locale, messages: t } = await getT();
  const u = t.userPages;
  const roleLabels = getLabelMessages(locale).siteRole;
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const roleFilter = ALLOWED_SITE_ROLES.includes(params.role as SiteRole)
    ? (params.role as SiteRole)
    : undefined;
  const affiliationFilter = AFFILIATION_FILTERS.includes(
    params.affiliation as (typeof AFFILIATION_FILTERS)[number],
  )
    ? (params.affiliation as (typeof AFFILIATION_FILTERS)[number])
    : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [{ users, total, totalPages, page: effectivePage, pageClamped }, auditLogs] = await Promise.all([
    listUsersForAdmin({ q: q || undefined, role: roleFilter, affiliation: affiliationFilter, page }),
    listRecentRoleAuditLogs(25),
  ]);

  if (pageClamped) {
    redirect(buildAdminUsersHref({ q, role: roleFilter, affiliation: affiliationFilter, page: effectivePage }));
  }

  const from = total === 0 ? 0 : (effectivePage - 1) * ADMIN_USERS_PAGE_SIZE + 1;
  const to = Math.min(effectivePage * ADMIN_USERS_PAGE_SIZE, total);
  const dateLocale = localeToBcp47(locale);

  const formLabels = {
    updateLabel: u.adminUsersUpdateRole,
    savedLabel: u.adminUsersRoleSaved,
    confirmGrantAdmin: u.adminUsersConfirmGrantAdmin,
    confirmSelfDemote: u.adminUsersConfirmSelfDemote,
    errorGeneric: u.adminUsersErrorGeneric,
    errorLastAdmin: u.adminUsersErrorLastAdmin,
    errorNotFound: u.adminUsersErrorNotFound,
  };

  function affiliationStatusLabel(status: string) {
    if (status === "VERIFIED") return u.adminUsersAffiliationVerified;
    if (status === "REJECTED") return u.adminUsersAffiliationRejected;
    return u.adminUsersAffiliationPending;
  }

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <Link href="/admin" className="hero-back-link">
            ← {t.nav.admin}
          </Link>
          <h1 className="lf-hero-title-sm">{u.adminUsersTitle}</h1>
          <p className="lf-hero-lead">{u.adminUsersDesc}</p>
        </div>
      </section>

      <div className="page-wrap">
        <BootstrapFounderButton
          label={u.adminUsersBootstrapLabel}
          doneLabel={u.adminUsersBootstrapDone}
          description={u.adminUsersBootstrapDesc}
          errorLabel={u.adminUsersBootstrapError}
          modulesLabel={u.adminUsersBootstrapModules}
        />

        <form method="get" className="admin-users-toolbar" style={{ marginBottom: "1.5rem" }}>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={u.adminUsersSearchPlaceholder}
            className="admin-users-search"
            aria-label={u.adminUsersSearchPlaceholder}
          />
          <select name="role" defaultValue={roleFilter ?? ""} aria-label={u.adminUsersTableRole}>
            <option value="">{u.adminUsersFilterAllRoles}</option>
            {ALLOWED_SITE_ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabels[r]}
              </option>
            ))}
          </select>
          <select
            name="affiliation"
            defaultValue={affiliationFilter ?? ""}
            aria-label={u.adminUsersTableAffiliation}
          >
            <option value="">{u.adminUsersFilterAllAffiliations}</option>
            <option value="pending">{u.adminUsersFilterAffiliationPending}</option>
            <option value="verified">{u.adminUsersFilterAffiliationVerified}</option>
            <option value="none">{u.adminUsersFilterAffiliationNone}</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">
            {u.adminUsersApplyFilters}
          </button>
        </form>

        {users.length === 0 ? (
          <p className="page-muted-note">{u.adminUsersEmpty}</p>
        ) : (
          <>
            <p className="page-muted-note" style={{ marginBottom: "0.75rem" }}>
              {fillTemplate(u.adminUsersPageSummary, { from, to, total })}
            </p>
            <div className="admin-users-table-wrap">
              <table className="lf-table">
                <thead>
                  <tr>
                    <th>{u.adminUsersTableName}</th>
                    <th>{u.adminUsersTableEmail}</th>
                    <th>{u.adminUsersTableGoogle}</th>
                    <th>{u.adminUsersTableAffiliation}</th>
                    <th>{u.adminUsersTableRole}</th>
                    <th>{u.adminUsersTableStatus}</th>
                    <th>{u.adminUsersTableActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const primaryAff = user.orgAffiliations[0];
                    return (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.name ?? "—"}</strong>
                        </td>
                        <td style={{ fontSize: "0.85rem" }}>{user.email ?? "—"}</td>
                        <td>
                          {user.accounts.length > 0 ? u.adminUsersGoogleYes : u.adminUsersGoogleNo}
                        </td>
                        <td style={{ fontSize: "0.82rem" }}>
                          {primaryAff ? (
                            <>
                              <div>{primaryAff.organization.legalName}</div>
                              <div className="page-muted-note">
                                {primaryAff.organization.corporateNumber} ·{" "}
                                {affiliationStatusLabel(primaryAff.status)}
                              </div>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <span className="badge badge-default">{roleLabels[user.siteRole]}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${user.accountStatus === "SUSPENDED" ? "badge-danger" : "badge-default"}`}
                          >
                            {user.accountStatus === "SUSPENDED"
                              ? u.adminUsersStatusSuspended
                              : u.adminUsersStatusActive}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <Link href={`/admin/users/${user.id}`} className="btn btn-primary btn-sm">
                              {u.adminUsersViewDetail}
                            </Link>
                            <Link href={getUserProfilePath(user)} className="btn btn-ghost btn-sm">
                              {u.adminUsersViewProfile}
                            </Link>
                            {session?.user && (
                              <>
                                <AdminUserRoleForm
                                  actorId={session.user.id}
                                  userId={user.id}
                                  currentRole={user.siteRole}
                                  roleLabels={roleLabels}
                                  labels={formLabels}
                                />
                                <AdminUserStatusActions
                                  userId={user.id}
                                  actorId={session.user.id}
                                  accountStatus={user.accountStatus}
                                  labels={{
                                    suspend: u.adminUsersSuspend,
                                    restore: u.adminUsersRestore,
                                    delete: u.adminUsersDelete,
                                    confirmSuspend: u.adminUsersConfirmSuspend,
                                    confirmDelete: u.adminUsersConfirmDelete,
                                    errorGeneric: u.adminUsersErrorGeneric,
                                    errorLastAdmin: u.adminUsersErrorLastAdmin,
                                    errorSelfAction: u.adminUsersErrorSelfAction,
                                    saved: u.adminUsersRoleSaved,
                                  }}
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav
                className="admin-users-pagination"
                aria-label={u.adminUsersPaginationAria}
                style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", alignItems: "center" }}
              >
                {effectivePage > 1 ? (
                  <Link
                    href={buildAdminUsersHref({
                      q,
                      role: roleFilter,
                      affiliation: affiliationFilter,
                      page: effectivePage - 1,
                    })}
                    className="btn btn-ghost btn-sm"
                  >
                    {u.adminUsersPrevPage}
                  </Link>
                ) : (
                  <span className="btn btn-ghost btn-sm" style={{ opacity: 0.4, pointerEvents: "none" }}>
                    {u.adminUsersPrevPage}
                  </span>
                )}
                <span className="page-muted-note">
                  {effectivePage} / {totalPages}
                </span>
                {effectivePage < totalPages ? (
                  <Link
                    href={buildAdminUsersHref({
                      q,
                      role: roleFilter,
                      affiliation: affiliationFilter,
                      page: effectivePage + 1,
                    })}
                    className="btn btn-ghost btn-sm"
                  >
                    {u.adminUsersNextPage}
                  </Link>
                ) : (
                  <span className="btn btn-ghost btn-sm" style={{ opacity: 0.4, pointerEvents: "none" }}>
                    {u.adminUsersNextPage}
                  </span>
                )}
              </nav>
            )}
          </>
        )}

        <section style={{ marginTop: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              {u.adminUsersAuditTitle}
            </h2>
            <AdminAuditExportButton label={u.adminUsersExportAudit} />
          </div>
          {auditLogs.length === 0 ? (
            <p className="page-muted-note">{u.adminUsersAuditEmpty}</p>
          ) : (
            <ul className="list-muted" style={{ fontSize: "0.9rem" }}>
              {auditLogs.map((log) => (
                <li key={log.id} style={{ marginBottom: "0.5rem" }}>
                  <time dateTime={log.createdAt.toISOString()} style={{ color: "var(--muted)", marginRight: "0.5rem" }}>
                    {log.createdAt.toLocaleString(dateLocale)}
                  </time>
                  {fillTemplate(u.adminUsersAuditChange, {
                    actor: displayUser(log.actor),
                    target: displayUser(log.user),
                    oldRole: roleLabels[log.oldRole],
                    newRole: roleLabels[log.newRole],
                  })}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
