import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContentArticleLayout } from "@/components/content/ContentArticleLayout";
import { MarkdownContent } from "@/components/MarkdownContent";
import { getLegalContentBySlug, stripMarkdownLeadHeading } from "@/lib/content";
import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import { contentPageMetadata } from "@/lib/site-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getT();
  const legal = getPageMessages(locale).legal;
  const content = getLegalContentBySlug(slug, locale);
  if (!content) return {};
  const title =
    slug === "disclaimer"
      ? legal.disclaimer
      : slug === "terms"
        ? legal.terms
        : slug === "privacy"
          ? legal.privacy
          : slug === "trademark-usage"
            ? legal.trademark
            : slug;
  return contentPageMetadata(title);
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale, messages: t } = await getT();
  const legal = getPageMessages(locale).legal;
  const content = getLegalContentBySlug(slug, locale);
  if (!content) notFound();

  const title =
    slug === "disclaimer"
      ? legal.disclaimer
      : slug === "terms"
        ? legal.terms
        : slug === "privacy"
          ? legal.privacy
          : slug === "trademark-usage"
            ? legal.trademark
            : slug;

  return (
    <ContentArticleLayout title={title} backHref="/" backLabel={t.common.backHome}>
      <MarkdownContent content={stripMarkdownLeadHeading(content)} />
    </ContentArticleLayout>
  );
}
