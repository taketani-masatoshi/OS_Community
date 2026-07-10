import Link from "next/link";
import type { Locale } from "@os-community/shared";
import { getContentById, getContentEntries } from "@/lib/content";

type Props = {
  locale: Locale;
  labels: {
    section: string;
    desc: string;
    readCta: string;
  };
};

export function LearningGuidesSection({ locale, labels }: Props) {
  const entries = getContentEntries({ publishedOnly: true, category: "guides" });
  const guides = entries
    .map((entry) => getContentById(entry.id, locale))
    .filter((doc): doc is NonNullable<ReturnType<typeof getContentById>> => doc != null);

  if (guides.length === 0) return null;

  return (
    <section id="guides" className="mypage-section">
      <h2 className="section-title">{labels.section}</h2>
      <p className="page-desc">{labels.desc}</p>
      <div className="lf-card-grid" style={{ marginTop: "1rem" }}>
        {guides.map((doc) => (
          <Link key={doc.meta.id} href={doc.meta.route} className="lf-card-link-wrap">
            <div className="lf-card lf-card-full">
              <h3>{doc.meta.title}</h3>
              {doc.meta.description ? (
                <p style={{ marginBottom: "0.75rem", color: "var(--muted)" }}>{doc.meta.description}</p>
              ) : null}
              <span className="btn btn-primary btn-sm">{labels.readCta}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
