/** One-click Google OAuth entry (skips intermediate /login page). */
export function loginStartHref(callbackUrl = "/mypage"): string {
  const cb =
    !callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")
      ? "/mypage"
      : callbackUrl;
  return `/login/start?callbackUrl=${encodeURIComponent(cb)}`;
}
