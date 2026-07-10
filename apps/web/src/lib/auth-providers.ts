import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import type { Provider } from "next-auth/providers";
import {
  isGithubAuthConfigured,
  resolveGoogleOAuthCredentials,
  resolveLinkedInOAuthCredentials,
} from "@/lib/auth-env";

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
          },
        },
      })
    );
  }

  if (isGithubAuthConfigured()) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
        allowDangerousEmailAccountLinking: true,
        profile(profile) {
          return {
            id: profile.id.toString(),
            name: profile.name ?? profile.login,
            email: profile.email,
            image: profile.avatar_url,
            githubLogin: profile.login,
          };
        },
      })
    );
  }

  const linkedin = resolveLinkedInOAuthCredentials();
  if (linkedin.configured && linkedin.clientId && linkedin.clientSecret) {
    providers.push(
      LinkedIn({
        clientId: linkedin.clientId,
        clientSecret: linkedin.clientSecret,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  return providers;
}
