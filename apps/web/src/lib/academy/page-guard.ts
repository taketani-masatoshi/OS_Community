import { notFound, redirect } from "next/navigation";
import { AcademyApiError } from "@os-community/academy-client";
import { AcademyConfigError } from "@/lib/academy/server-client";

/** Redirect curriculum pages to Learning when Content API is unavailable (not missing content). */
export function redirectIfAcademyUnavailable(error: unknown): void {
  if (error instanceof AcademyConfigError) {
    redirect("/learning#curriculum");
  }
  if (error instanceof AcademyApiError && error.status >= 500) {
    redirect("/learning#curriculum");
  }
  if (error instanceof Error && /fetch failed|ECONNREFUSED|ETIMEDOUT/i.test(error.message)) {
    redirect("/learning#curriculum");
  }
}

/** 404 → notFound; API outage → Learning hub; otherwise notFound. */
export function handleAcademyLoadError(error: unknown): never {
  if (error instanceof AcademyApiError && error.status === 404) {
    notFound();
  }
  redirectIfAcademyUnavailable(error);
  notFound();
}
