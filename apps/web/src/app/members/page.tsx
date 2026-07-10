import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageLayout, Card } from "@/components/ui";
import { getUserProfilePath } from "@/lib/users";
import { getLabelMessages, getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";

export default async function MembersPage() {
  const { locale } = await getT();
  const p = getPageMessages(locale);
  const m = p.members;
  const roleLabels = getLabelMessages(locale).siteRole;

  const members = await prisma.user.findMany({
    where: {
      deletedAt: null,
      accountStatus: "ACTIVE",
      profileCompletedAt: { not: null },
    },
    select: {
      id: true,
      name: true,
      githubLogin: true,
      image: true,
      siteRole: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <PageLayout title={m.title} description={m.desc}>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {members.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{m.empty}</p>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {member.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.image} alt="" width={32} height={32} style={{ borderRadius: "50%" }} />
                )}
                <div>
                  <Link href={getUserProfilePath(member)}>
                    <strong>{member.name ?? member.githubLogin ?? p.ui.unknown}</strong>
                  </Link>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                    {roleLabels[member.siteRole]}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
}
