import { redirect } from "next/navigation";

export default async function StewardshipSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/modules/${slug}`);
}
