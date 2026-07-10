import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import { PageLayout, Card, Badge } from "@/components/ui";
import { getFormMessages, getLabelMessages, getPageMessages } from "@os-community/shared";
import { AdminModulePromotionActions } from "@/components/AdminModulePromotionActions";
import { getModulePromotionRequest } from "@/lib/module-promotion";
import { fillTemplate, getT } from "@/lib/i18n";
import { getCommitteeAdminSummary } from "@/lib/admin-committees";

export default async function AdminPage() {
  const session = await getAuthSession();
  const isSiteAdmin = session?.user?.siteRole === "ADMIN";
  const { locale, messages: t } = await getT();
  const p = getPageMessages(locale);
  const a = p.admin;
  const forms = getFormMessages(locale);
  const labels = getLabelMessages(locale);

  const [certApplications, committeeSummary] = await Promise.all([
    prisma.certificationApplication.findMany({
      where: { status: { in: ["PENDING", "UNDER_REVIEW"] } },
      include: { user: { select: { githubLogin: true, name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    isSiteAdmin ? getCommitteeAdminSummary() : Promise.resolve(null),
  ]);

  const wildModules = isSiteAdmin
    ? await prisma.module.findMany({
        where: { trustLevel: "WILD" },
        select: {
          id: true,
          slug: true,
          name: true,
          metadata: true,
        },
        orderBy: { slug: "asc" },
      })
    : [];

  const promotionQueue = wildModules
    .map((mod) => ({ mod, promotion: getModulePromotionRequest(mod.metadata) }))
    .filter(({ promotion }) => promotion?.status === "PENDING");

  return (
    <PageLayout title={a.title} description={a.desc}>
      {isSiteAdmin && (
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <Link href="/admin/users" className="btn btn-primary btn-sm">
            {t.userPages.adminUsersLink}
          </Link>
          <Link href="/admin/committees" className="btn btn-primary btn-sm">
            {a.committeesManageLink}
          </Link>
        </div>
      )}

      {isSiteAdmin && committeeSummary && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>{a.committeesSummaryTitle}</h2>
          <Card>
            <p style={{ marginBottom: "0.5rem" }}>
              {fillTemplate(a.committeesSummaryTotal, { total: committeeSummary.total })}
            </p>
            <p style={{ marginBottom: "0.75rem", color: "var(--muted)" }}>
              {fillTemplate(a.committeesSummaryPending, { count: committeeSummary.pendingTotal })}
            </p>
            <Link href="/admin/committees" className="btn btn-primary btn-sm">
              {a.committeesManageLink}
            </Link>
          </Card>
        </section>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>{a.roleRequestsMovedTitle}</h2>
        <Card>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
            {a.roleRequestsMovedHint}
          </p>
          <Link href="/governance" className="btn btn-primary btn-sm">
            {a.roleRequestsMovedLink}
          </Link>
        </Card>
      </section>

      {isSiteAdmin && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>
            {a.promotionRequestsTitle} ({promotionQueue.length})
          </h2>
          {promotionQueue.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>{a.promotionRequestsEmpty}</p>
          ) : (
            promotionQueue.map(({ mod, promotion }) => (
              <Card key={mod.id}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <Badge>WILD → COMMUNITY</Badge>
                  <span style={{ marginLeft: "0.5rem" }}>
                    <Link href={`/modules/${mod.slug}`}>{mod.name}</Link>
                  </span>
                </div>
                {promotion?.message && (
                  <p style={{ fontSize: "0.9rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>
                    {promotion.message}
                  </p>
                )}
                <AdminModulePromotionActions moduleId={mod.id} labels={forms.admin} />
              </Card>
            ))
          )}
        </section>
      )}

      <section>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>
          {a.certApplicationsTitle} ({certApplications.length})
        </h2>
        {certApplications.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{a.certApplicationsEmpty}</p>
        ) : (
          certApplications.map((app) => (
            <Card key={app.id}>
              <Badge>{labels.certification[app.type]}</Badge>
              <span style={{ marginLeft: "0.5rem" }}>{app.user.githubLogin ?? app.user.name}</span>
              {app.statement && <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>{app.statement}</p>}
              <Link href={`/admin/certifications/${app.id}`} className="btn btn-primary" style={{ marginTop: "0.5rem", display: "inline-block" }}>
                {a.reviewButton}
              </Link>
            </Card>
          ))
        )}
      </section>
    </PageLayout>
  );
}
