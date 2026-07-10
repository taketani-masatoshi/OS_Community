"use client";

import { signOut } from "next-auth/react";

export function ClientSignOutButton({
  label,
  className = "btn btn-ghost btn-sm",
}: {
  label: string;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={() => signOut({ callbackUrl: "/" })}>
      {label}
    </button>
  );
}
