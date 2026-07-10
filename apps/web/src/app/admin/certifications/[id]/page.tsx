import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageLayout, Card } from "@/components/ui";
import { AdminCertActions } from "@/components/AdminCertActions";
import { getFormMessages, getLabelMessages, getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";

export default async function AdminCertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { locale } = await getT();
  const p = getPageMessages(locale);
  const forms = getFormMessages(locale);
  const labels = getLabelMessages(locale);

  const app = await prisma.certificationApplication.findUnique({
    where: { id },
    include: { user: { select: { githubLogin: true, name: true } } },
  });
  if (!app) notFound();

  return (
    <PageLayout title={p.adminCert.title} description={labels.certification[app.type] ?? app.type}>
      <Card>
        <p>
          <strong>{app.user.githubLogin ?? app.user.name}</strong>
        </p>
        <p style={{ marginTop: "0.75rem" }}>{app.statement}</p>
        <AdminCertActions applicationId={app.id} labels={forms.admin} />
      </Card>
    </PageLayout>
  );
}
