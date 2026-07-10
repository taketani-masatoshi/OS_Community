import { redirect } from "next/navigation";

/** Onboarding alias — profile editing lives at /settings/profile (Fedora Account style). */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const q = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
  redirect(`/settings/profile${q}`);
}
