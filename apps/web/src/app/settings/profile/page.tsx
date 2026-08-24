import Link from "next/link";
import { redirect } from "next/navigation";
import { getFormMessages } from "@os-community/shared";
import { requireAuth } from "@/lib/session";
import { getLocale, getT } from "@/lib/i18n";
import { getUserProfile, isProfileComplete } from "@/lib/user-profile";
import { UserProfileForm } from "@/components/UserProfileForm";

function safeCallbackUrl(raw?: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/mypage";
  return raw;
}

export default async function SettingsProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; edit?: string }>;
}) {
  const session = await requireAuth("/settings/profile");
  const { callbackUrl, edit } = await searchParams;
  const redirectTo = safeCallbackUrl(callbackUrl);
  const { messages: t } = await getT();
  const forms = getFormMessages(await getLocale());
  const u = t.userPages;

  const profile = await getUserProfile(session.user.id);
  if (profile && isProfileComplete(profile) && edit !== "1") {
    redirect(redirectTo);
  }
  const isEdit = Boolean(profile?.profileCompletedAt);

  return (
    <>
      <h2 className="section-title" style={{ marginTop: 0 }}>
        {t.settings.profile}
      </h2>
      <p className="page-desc">{t.settings.profileDesc}</p>

      <div className="lf-card" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
        <p className="page-muted-note" style={{ marginBottom: "0.75rem" }}>
          {u.registerAuthNote}
        </p>
        <p>
          <strong>{t.settings.openOrgIdLabel}:</strong>{" "}
          {session.user.primaryEmail ?? session.user.email ?? "—"}
        </p>
        {session.user.githubLogin && (
          <p className="page-muted-note">
            GitHub: @{session.user.githubLogin}
          </p>
        )}
        <p className="page-muted-note" style={{ marginTop: "0.5rem" }}>
          <Link href="/settings/organization">{t.settings.organization}</Link>
          {" · "}
          <Link href="/settings/connections">{t.settings.connections}</Link>
        </p>
      </div>

      <UserProfileForm
        initial={{
          name: profile?.name ?? session.user.name ?? "",
          specialty: profile?.specialty ?? "",
          region: profile?.region ?? "",
          organization: profile?.organization ?? "",
          bio: profile?.bio ?? "",
        }}
        labels={{
          name: u.registerNameLabel,
          specialty: u.registerSpecialtyLabel,
          specialtyHint: u.registerSpecialtyHint,
          region: u.registerRegionLabel,
          regionHint: u.registerRegionHint,
          organization: u.registerOrganizationLabel,
          bio: u.registerBioLabel,
          submit: isEdit ? u.registerEditTitle : u.registerSubmit,
          saved: u.registerSaved,
          required: u.registerRequired,
        }}
        redirectTo={redirectTo}
        errorUnauthorized={forms.moduleRole.errorUnauthorized}
      />

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/mypage" className="btn btn-primary btn-sm">
          ← {t.nav.myPage}
        </Link>
      </p>
    </>
  );
}
