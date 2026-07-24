import { PageLayout, Card } from "@/components/ui";
import { CertificationApplyForm } from "@/components/CertificationApplyForm";
import { requireAuth } from "@/lib/session";
import { getFormMessages, getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import { userHasClaimedAffiliation } from "@/lib/org-affiliation";

export default async function CertApplyPage() {
  const session = await requireAuth();
  const { locale } = await getT();
  const p = getPageMessages(locale);
  const c = p.certificationsApply;
  const forms = getFormMessages(locale);
  const hasOrgAffiliation = await userHasClaimedAffiliation(session.user.id);

  return (
    <PageLayout title={c.title} description={c.desc}>
      <Card>
        <CertificationApplyForm
          labels={forms.certification}
          hasOrgAffiliation={hasOrgAffiliation}
        />
      </Card>
    </PageLayout>
  );
}
