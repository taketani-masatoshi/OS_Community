import Link from "next/link";
import { redirect } from "next/navigation";
import type { CommitteeType } from "@os-community/db";
import { requireRole } from "@/lib/session";
import { fillTemplate, getT } from "@/lib/i18n";
import { getLabelMessages, getPageMessages } from "@os-community/shared";
import { PageLayout } from "@/components/ui";
import { AdminCommitteeSyncButton } from "@/components/AdminCommitteeSyncButton";
import { getCommitteeTypeLabel } from "@/lib/committees";
import { ADMIN_COMMITTEES_PAGE_SIZE, listCommitteesForAdmin } from "@/lib/admin-committees";

function buildHref(params: { q?: string; type?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.type) sp.set("type", params.type);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/admin/committees?${qs}` : "/admin/committees";
}

export default async function AdminCommitteesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  await requireRole(["ADMIN"], "/admin/committees");
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const typeFilter = ["STANDARD", "DOMAIN", "MODULE"].includes(params.type ?? "")
    ? (params.type as CommitteeType)
    : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const { committees, total, page: effectivePage, totalPages, pageClamped } =
    await listCommitteesForAdmin({ q: q || undefined, type: typeFilter, page });

  if (pageClamped) {
    redirect(buildHref({ q, type: typeFilter, page: effectivePage }));
  }

  const { locale } = await getT();
  const a = getPageMessages(locale).admin;
  const from = total === 0 ? 0 : (effectivePage - 1) * ADMIN_COMMITTEES_PAGE_SIZE + 1;
  const to = Math.min(effectivePage * ADMIN_COMMITTEES_PAGE_SIZE, total);

  return (
    <PageLayout title={a.committeesTitle} description={a.committeesDesc}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <Link href="/admin/committees/new" className="btn btn-primary btn-sm">
          {a.committeesCreate}
        </Link>
        <AdminCommitteeSyncButton
          label={a.committeesSync}
          doneLabel={a.committeesSyncDone}
          errorLabel={a.committeesErrorGeneric}
        />
      </div>

      <form method="get" className="admin-users-toolbar" style={{ marginBottom: "1.5rem" }}>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={a.committeesSearchPlaceholder}
          className="admin-users-search"
          aria-label={a.committeesSearchPlaceholder}
        />
        <select name="type" defaultValue={typeFilter ?? ""} aria-label={a.committeesFilterType}>
          <option value="">{a.committeesFilterAllTypes}</option>
          <option value="STANDARD">{a.committeesTypeStandard}</option>
          <option value="DOMAIN">{a.committeesTypeDomain}</option>
          <option value="MODULE">{a.committeesTypeModule}</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm">
          {a.committeesApplyFilters}
        </button>
      </form>

      {committees.length === 0 ? (
        <p className="page-muted-note">{a.committeesEmpty}</p>
      ) : (
        <>
          <p className="page-muted-note">
            {fillTemplate(a.committeesPageSummary, { from, to, total })}
          </p>
          <div className="admin-users-table-wrap">
            <table className="lf-table">
              <thead>
                <tr>
                  <th>{a.committeesTableName}</th>
                  <th>{a.committeesTableType}</th>
                  <th>{a.committeesTableSlug}</th>
                  <th>{a.committeesTableChair}</th>
                  <th>{a.committeesTableMembers}</th>
                  <th>{a.committeesTablePending}</th>
                  <th>{a.committeesTableActions}</th>
                </tr>
              </thead>
              <tbody>
                {committees.map((committee) => (
                  <tr key={committee.id}>
                    <td>{committee.name}</td>
                    <td>{getCommitteeTypeLabel(committee.type, locale)}</td>
                    <td>
                      <code>{committee.slug}</code>
                    </td>
                    <td>{committee.chairName ?? "—"}</td>
                    <td>{committee.memberCount}</td>
                    <td>{committee.pendingTotal}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        <Link href={`/admin/committees/${committee.slug}`} className="btn btn-primary btn-sm">
                          {a.committeesViewDetail}
                        </Link>
                        <Link href={`/committees/${committee.slug}`} className="btn btn-ghost btn-sm">
                          {a.committeesViewPublic}
                        </Link>
                        <Link href={`/committees/${committee.slug}/review`} className="btn btn-ghost btn-sm">
                          {a.committeesViewReview}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              {effectivePage > 1 ? (
                <Link href={buildHref({ q, type: typeFilter, page: effectivePage - 1 })} className="btn btn-ghost btn-sm">
                  ←
                </Link>
              ) : null}
              <span className="page-muted-note">
                {effectivePage} / {totalPages}
              </span>
              {effectivePage < totalPages ? (
                <Link href={buildHref({ q, type: typeFilter, page: effectivePage + 1 })} className="btn btn-ghost btn-sm">
                  →
                </Link>
              ) : null}
            </nav>
          )}
        </>
      )}
    </PageLayout>
  );
}
