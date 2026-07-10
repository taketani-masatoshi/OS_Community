import Link from "next/link";
import { requireRole } from "@/lib/session";
import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import { PageLayout } from "@/components/ui";
import { AdminCommitteeForm } from "@/components/AdminCommitteeForm";
import { listModulesWithoutCommittee } from "@/lib/admin-committees";

export default async function AdminCommitteeNewPage() {
  await requireRole(["ADMIN"], "/admin/committees/new");
  const { locale } = await getT();
  const a = getPageMessages(locale).admin;
  const modules = await listModulesWithoutCommittee();

  return (
    <PageLayout title={a.committeesNewTitle} description={a.committeesNewDesc}>
      <p style={{ marginBottom: "1rem" }}>
        <Link href="/admin/committees" className="btn btn-ghost btn-sm">
          ← {a.committeesDetailBack}
        </Link>
      </p>
      <AdminCommitteeForm
        modules={modules}
        labels={{
          committeesTypeStandard: a.committeesTypeStandard,
          committeesTypeDomain: a.committeesTypeDomain,
          committeesTypeModule: a.committeesTypeModule,
          committeesSlugLabel: a.committeesSlugLabel,
          committeesNameLabel: a.committeesNameLabel,
          committeesDescriptionLabel: a.committeesDescriptionLabel,
          committeesJurisdictionLabel: a.committeesJurisdictionLabel,
          committeesExpertDomainLabel: a.committeesExpertDomainLabel,
          committeesModuleLabel: a.committeesModuleLabel,
          committeesSubmitCreate: a.committeesSubmitCreate,
          committeesCreated: a.committeesCreated,
          committeesErrorGeneric: a.committeesErrorGeneric,
          committeesFilterType: a.committeesFilterType,
        }}
      />
    </PageLayout>
  );
}
