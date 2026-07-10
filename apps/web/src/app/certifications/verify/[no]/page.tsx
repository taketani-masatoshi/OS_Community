import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageLayout, Badge, Card } from "@/components/ui";
import { getLabelMessages, getPageMessages, localeToBcp47 } from "@os-community/shared";
import { getT } from "@/lib/i18n";

export default async function VerifyCertPage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const { locale } = await getT();
  const p = getPageMessages(locale);
  const v = p.certificationsVerify;
  const certLabels = getLabelMessages(locale).certification;
  const dateLocale = localeToBcp47(locale);

  const cert = await prisma.certification.findUnique({
    where: { certificateNo: no },
    include: { user: { select: { name: true, githubLogin: true } } },
  });

  if (!cert) notFound();

  const valid = cert.status === "APPROVED" && cert.expiresAt > new Date();

  return (
    <PageLayout title={v.title} description={`${v.desc} ${no}`}>
      <Card>
        <Badge variant={valid ? "success" : "danger"}>{valid ? v.valid : v.invalid}</Badge>
        <dl style={{ marginTop: "1rem", fontSize: "0.95rem" }}>
          <dt style={{ color: "var(--muted)" }}>{v.labelType}</dt>
          <dd style={{ margin: "0.25rem 0 0.75rem" }}>{certLabels[cert.type]}</dd>
          <dt style={{ color: "var(--muted)" }}>{v.labelHolder}</dt>
          <dd style={{ margin: "0.25rem 0 0.75rem" }}>{cert.user.githubLogin ?? cert.user.name}</dd>
          <dt style={{ color: "var(--muted)" }}>{v.labelIssued}</dt>
          <dd style={{ margin: "0.25rem 0 0.75rem" }}>{cert.issuedAt.toLocaleDateString(dateLocale)}</dd>
          <dt style={{ color: "var(--muted)" }}>{v.labelExpires}</dt>
          <dd style={{ margin: "0.25rem 0 0.75rem" }}>{cert.expiresAt.toLocaleDateString(dateLocale)}</dd>
          <dt style={{ color: "var(--muted)" }}>{v.labelStatus}</dt>
          <dd style={{ margin: "0.25rem 0 0" }}>{cert.status}</dd>
        </dl>
      </Card>
    </PageLayout>
  );
}
