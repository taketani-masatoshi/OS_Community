import { PageLayout, Card } from "@/components/ui";
import { CertificationApplyForm } from "@/components/CertificationApplyForm";
import { requireAuth } from "@/lib/session";
import { getFormMessages, getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";

export default async function CertApplyPage() {
  await requireAuth();
  const { locale } = await getT();
  const p = getPageMessages(locale);
  const c = p.certificationsApply;
  const forms = getFormMessages(locale);

  return (
    <PageLayout title={c.title} description={c.desc}>
      <Card>
        <CertificationApplyForm labels={forms.certification} />
      </Card>
    </PageLayout>
  );
}
