import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
};

/** Published markdown articles — single title in hero, body in prose-docs. */
export function ContentArticleLayout({ title, description, backHref, backLabel, children }: Props) {
  return (
    <>
      <section className="lf-hero lf-hero-compact content-hero">
        <div className="lf-hero-inner">
          <Link href={backHref} className="content-back-link">
            {backLabel}
          </Link>
          <h1 className="lf-hero-title-sm">{title}</h1>
          {description ? <p className="lf-hero-lead">{description}</p> : null}
        </div>
      </section>
      <div className="page-wrap content-article-body">{children}</div>
    </>
  );
}
