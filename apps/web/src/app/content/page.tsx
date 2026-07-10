import Link from "next/link";
import { PageLayout, Card, Badge } from "@/components/ui";
import { getContentEntries, getContentById } from "@/lib/content";
import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";

export default async function ContentIndexPage() {
  const { locale } = await getT();
  const p = getPageMessages(locale);
  const c = p.content;

  const published = getContentEntries({ publishedOnly: true }).filter((e) =>
    e.route.startsWith("/content/")
  );
  const draftCount = getContentEntries().filter((e) => e.status === "draft").length;

  const categoryLabels: Record<string, string> = {
    docs: c.categoryDocs,
    guides: c.categoryGuides,
  };

  return (
    <PageLayout title={c.title} description={c.desc}>
      {draftCount > 0 && (
        <p style={{ fontSize: "0.85rem", marginBottom: "var(--space-4)" }}>
          <Badge variant="warning">
            {draftCount}
            {c.draftBadge}
          </Badge>
          <span style={{ color: "var(--muted)", marginLeft: "var(--space-2)" }}>{c.draftHint}</span>
        </p>
      )}

      {(["docs", "guides"] as const).map((cat) => {
        const items = published.filter((e) => e.category === cat);
        return (
          <section key={cat} style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">{categoryLabels[cat]}</h2>
            {items.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{c.categoryEmpty}</p>
            ) : (
              items.map((item) => {
                const doc = getContentById(item.id, locale);
                const title = doc?.meta.title ?? item.title;
                const description = doc?.meta.description ?? item.description;
                return (
                <Link key={item.id} href={`/content/${item.id}`}>
                  <Card>
                    <strong>{title}</strong>
                    {description && (
                      <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                        {description}
                      </p>
                    )}
                  </Card>
                </Link>
              );
              })
            )}
          </section>
        );
      })}
    </PageLayout>
  );
}
