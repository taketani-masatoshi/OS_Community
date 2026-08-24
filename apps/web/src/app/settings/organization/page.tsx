import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { getT } from "@/lib/i18n";
import { listUserAffiliations, serializeAffiliation } from "@/lib/org-affiliation";
import { OrgAffiliationForm } from "@/components/settings/OrgAffiliationForm";

export default async function SettingsOrganizationPage() {
  const session = await requireAuth("/settings/organization");
  const { messages: t } = await getT();
  const s = t.settings;
  const affiliations = await listUserAffiliations(session.user.id);

  return (
    <>
      <h2 className="section-title" style={{ marginTop: 0 }}>
        {s.organization}
      </h2>
      <p className="page-desc">{s.organizationDesc}</p>
      <p className="page-muted-note" style={{ marginBottom: "1.5rem" }}>
        {s.organizationOperatorNote}{" "}
        <Link href="/certifications">{t.nav.certification}</Link>
      </p>

      <OrgAffiliationForm
        initial={affiliations.map(serializeAffiliation)}
        labels={{
          corporateNumber: s.orgCorporateNumber,
          corporateNumberHint: s.orgCorporateNumberHint,
          legalName: s.orgLegalName,
          title: s.orgTitle,
          submit: s.orgSubmit,
          remove: s.orgRemove,
          removeConfirm: s.orgRemoveConfirm,
          statusPending: s.orgStatusPending,
          statusVerified: s.orgStatusVerified,
          statusRejected: s.orgStatusRejected,
          saved: s.orgSaved,
          errorGeneric: s.orgErrorGeneric,
          errorInvalidNumber: s.orgErrorInvalidNumber,
          empty: s.orgEmpty,
        }}
      />

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/settings/profile" className="btn btn-ghost btn-sm">
          {s.profile}
        </Link>
      </p>
    </>
  );
}
