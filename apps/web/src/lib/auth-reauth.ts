/** Cookie set on Community sign-out so the next Google sign-in forces re-auth. */
export const REAUTH_COOKIE = "oorgos_reauth";
export const REAUTH_MAX_AGE_SEC = 600;

export function reauthCookieHeader(): string {
  return `${REAUTH_COOKIE}=1; Path=/; Max-Age=${REAUTH_MAX_AGE_SEC}; SameSite=Lax`;
}
