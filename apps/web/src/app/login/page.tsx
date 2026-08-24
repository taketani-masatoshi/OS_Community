import { headers } from "next/headers";
import { BRAND } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import { isDatabaseAvailable } from "@/lib/db-health";
import {
  getAuthBaseUrl,
  isGoogleAuthConfigured,
  isPrimaryLoginConfigured,
  resolveGoogleOAuthCredentials,
  resolveLoginAuthErrorMessage,
} from "@/lib/auth-env";
import { signInWithGoogle } from "@/app/login/actions";

function safeCallbackUrl(raw?: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/mypage";
  return raw;
}

async function isDatabaseAvailableForLogin(): Promise<boolean> {
  return isDatabaseAvailable();
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = safeCallbackUrl(callbackUrl);
  const { locale, messages: t } = await getT();
  const l = t.login;
  const googleConfigured = isGoogleAuthConfigured();
  const primaryLoginConfigured = isPrimaryLoginConfigured();
  const dbAvailable = await isDatabaseAvailableForLogin();
  const authError = !dbAvailable
    ? l.errorDatabaseUnavailable
    : resolveLoginAuthErrorMessage(error, l, locale);
  // Go straight to the intended destination (mypage etc.) — profile nudge lives on mypage.
  const afterLogin = redirectTo;
  const googleCallback = resolveGoogleOAuthCredentials().callbackUrl;
  const authBaseUrl = getAuthBaseUrl();
  const headerStore = await headers();
  const requestHost = headerStore.get("host");
  const expectedHost = (() => {
    try {
      return new URL(authBaseUrl).host;
    } catch {
      return null;
    }
  })();
  const hostMismatch = Boolean(
    requestHost && expectedHost && requestHost !== expectedHost,
  );

  return (
    <section className="lf-hero lf-hero-compact">
      <div className="lf-hero-inner">
        <h1 className="lf-hero-title-sm">
          {l.title} — {BRAND.community}
        </h1>
        <p className="lf-hero-lead">{l.desc}</p>
        {!primaryLoginConfigured && (
          <div className="login-auth-notice" role="alert">
            <p className="form-error">{l.providersNotConfigured}</p>
          </div>
        )}
        {!dbAvailable && (
          <div className="login-auth-notice" role="alert">
            <p className="form-error">{l.errorDatabaseUnavailable}</p>
          </div>
        )}
        {authError && dbAvailable && (
          <p className="form-error" role="alert">
            {authError}
          </p>
        )}
        {(error === "OAuthCallback" || error === "OAuthSignin" || error === "Callback") &&
          googleConfigured && (
            <p className="page-muted-note" style={{ marginBottom: "1rem" }}>
              {l.redirectUriHint.replace("{callbackUrl}", googleCallback)}
            </p>
          )}
        {hostMismatch && googleConfigured && (
          <p className="page-muted-note" style={{ marginBottom: "1rem" }}>
            {l.hostMismatchHint
              .replace("{expectedUrl}", authBaseUrl)
              .replace("{currentHost}", requestHost ?? "")}
          </p>
        )}
        <div className="login-provider-stack">
          {googleConfigured && (
            <form
              action={async () => {
                "use server";
                await signInWithGoogle(afterLogin);
              }}
            >
              <button type="submit" className="btn btn-primary btn-sm">
                {l.signInGoogle}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
