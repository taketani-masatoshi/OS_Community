import { redirect } from "next/navigation";

export default async function DocSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/content/${slug}`);
}
