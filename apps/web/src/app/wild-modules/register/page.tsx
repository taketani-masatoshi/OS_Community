import { PageLayout, Card } from "@/components/ui";
import { WildModuleRegisterForm } from "@/components/WildModuleRegisterForm";
import { requireAuth } from "@/lib/session";
import { getFormMessages, getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";

export default async function WildRegisterPage() {
  await requireAuth();
  const { locale } = await getT();
  const p = getPageMessages(locale);
  const w = p.wildModulesRegister;
  const forms = getFormMessages(locale);

  return (
    <PageLayout title={w.title} description={w.desc}>
      <Card>
        <WildModuleRegisterForm labels={forms.wildModule} />
      </Card>
    </PageLayout>
  );
}
