import Link from "next/link";
import { getPageMessages } from "@os-community/shared";
import { getLocale } from "@/lib/i18n";
import { getContentById } from "@/lib/content";
import { MarkdownContent } from "@/components/MarkdownContent";

const SUB_PAGES = ["contact", "brand", "inclusion", "careers"] as const;
type SubPageSlug = (typeof SUB_PAGES)[number];

function isSubPageSlug(slug: string): slug is SubPageSlug {
  return (SUB_PAGES as readonly string[]).includes(slug);
}

export default async function AboutSubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const p = getPageMessages(locale);
  const sub = p.aboutSub;

  if (!isSubPageSlug(slug)) {
    return (
      <div className="page-wrap">
        <h1 className="page-title">{sub.notFound}</h1>
        <Link href="/about">{sub.back}</Link>
      </div>
    );
  }

  const page = sub[slug];
  const brandDoc = slug === "brand" ? getContentById("brand-guidelines", locale) : null;

  return (
    <>
      <section className="lf-hero" style={{ padding: "2.5rem 1.5rem" }}>
        <div className="lf-hero-inner">
          <Link href="/about" style={{ color: "var(--hero-muted)", fontSize: "0.85rem" }}>
            {sub.back}
          </Link>
          <h1 style={{ fontSize: "2rem", marginTop: "0.5rem" }}>{page.title}</h1>
          <p className="lf-hero-lead">{page.body}</p>
        </div>
      </section>
      <div className="page-wrap">
        {brandDoc ? (
          <div className="prose-docs">
            <MarkdownContent content={brandDoc.content} />
          </div>
        ) : (
          <p style={{ maxWidth: 640, lineHeight: 1.7 }}>{page.body}</p>
        )}
        <p style={{ marginTop: "2rem" }}>
          <Link href="/login" className="btn btn-primary">
            {sub.join}
          </Link>
        </p>
      </div>
    </>
  );
}
