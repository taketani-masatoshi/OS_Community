"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";

/** Reload JWT claims from the database (Auth.js session update). */
export function useRefreshClientSession() {
  const { update } = useSession();

  return useCallback(async (): Promise<boolean> => {
    try {
      await update({});
      return true;
    } catch {
      return false;
    }
  }, [update]);
}
