"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRefreshClientSession } from "@/lib/refresh-client-session";

/** After OAuth link redirect, refresh JWT session claims from the database. */
export function ConnectionLinkRefresh({ linked }: { linked?: string }) {
  const router = useRouter();
  const refreshSession = useRefreshClientSession();

  useEffect(() => {
    if (!linked) return;
    void refreshSession().then(() => router.refresh());
  }, [linked, refreshSession, router]);

  return null;
}
