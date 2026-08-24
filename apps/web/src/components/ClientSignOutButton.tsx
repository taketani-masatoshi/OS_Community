"use client";

import { signOut } from "next-auth/react";
import { REAUTH_COOKIE, REAUTH_MAX_AGE_SEC } from "@/lib/auth-reauth";

function markForceReauth(): void {
  document.cookie = `${REAUTH_COOKIE}=1; Path=/; Max-Age=${REAUTH_MAX_AGE_SEC}; SameSite=Lax`;
}

export function ClientSignOutButton({
  label,
  className = "btn btn-ghost btn-sm",
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        markForceReauth();
        void signOut({ callbackUrl: "/" });
      }}
    >
      {label}
    </button>
  );
}
