import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContentArticleLayout } from "@/components/content/ContentArticleLayout";
import { MarkdownContent } from "@/components/MarkdownContent";
import { getContentById, getPublishedContentIds, stripMarkdownLeadHeading } from "@/lib/content";
import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import { contentPageMetadata } from "@/lib/site-metadata";

export function generateStaticParams() {
  return getPublishedContentIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { locale } = await getT();
  const doc = getContentById(id, locale);
  if (!doc || doc.entry.status !== "published") return {};
  return contentPageMetadata(doc.meta.title, doc.meta.description);
}

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { locale } = await getT();
  const detail = getPageMessages(locale).contentDetail;
  const doc = getContentById(id, locale);
  if (!doc || doc.entry.status !== "published") notFound();

  return (
    <ContentArticleLayout
      title={doc.meta.title}
      description={doc.meta.description}
      backHref="/content"
      backLabel={detail.back}
    >
      <MarkdownContent content={stripMarkdownLeadHeading(doc.content)} />
    </ContentArticleLayout>
  );
}
