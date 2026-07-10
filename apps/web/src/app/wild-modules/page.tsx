import Link from "next/link";
import { getModules } from "@/lib/modules";
import { PageLayout, Badge, Card } from "@/components/ui";
import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";

export default async function WildModulesPage() {
  const { locale } = await getT();
  const p = getPageMessages(locale);
  const w = p.wildModules;
  const wild = await getModules({ wildOnly: true });

  return (
    <PageLayout title={w.title} description={w.desc}>
      <Card title={w.disclaimerTitle}>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.9rem", color: "var(--muted)" }}>
          {w.disclaimerItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link href="/wild-modules/register" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
          {w.registerCta}
        </Link>
      </Card>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>
          {w.registeredTitle} ({wild.length})
        </h2>
        {wild.map((m) => (
          <Link key={m.slug} href={`/modules/${m.slug}`}>
            <Card>
              <Badge variant="danger">{w.badgeUnmaintained}</Badge>
              <strong style={{ marginLeft: "0.5rem" }}>{m.name}</strong>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{m.githubRepo}</p>
            </Card>
          </Link>
        ))}
      </section>
    </PageLayout>
  );
}
