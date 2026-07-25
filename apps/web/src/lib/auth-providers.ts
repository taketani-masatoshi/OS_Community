import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { resolveGoogleOAuthCredentials } from "@/lib/auth-env";

/**
 * Auth providers for Community login.
 * Stabilization: Google only. LinkedIn / GitHub OAuth providers are disabled
 * until account-linking UX is re-enabled.
 */
export function buildAuthProviders(): Provider[] {
  const providers: Provider[] = [];

  const google = resolveGoogleOAuthCredentials();
  if (google.configured && google.clientId && google.clientSecret) {
    providers.push(
      Google({
        clientId: google.clientId,
        clientSecret: google.clientSecret,
        // Review before production: linking by email can merge accounts unexpectedly.
        allowDangerousEmailAccountLinking: true,
        authorization: {
          params: {
            access_type: "offline",
            response_type: "code",
            // Always show the account picker so re-login is never fully silent SSO.
            prompt: "select_account",
          },
        },
      })
    );
  }

  return providers;
}
