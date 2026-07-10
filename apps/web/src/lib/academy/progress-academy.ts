import { getAcademyClient, AcademyConfigError } from "@/lib/academy/server-client";

export { AcademyConfigError };

/** Whether Academy Content API integration is configured for this deployment. */
export function isAcademyConfigured(): boolean {
  return Boolean(process.env.ACADEMY_API_URL?.trim());
}

export function getConfiguredAcademyClient() {
  if (!isAcademyConfigured()) {
    throw new AcademyConfigError(
      "ACADEMY_API_URL is not configured. Set it in .env for Academy integration.",
    );
  }
  return getAcademyClient();
}

export async function academyFetchTrack(trackId: string) {
  return getConfiguredAcademyClient().getTrack(trackId);
}

export async function academyFetchTracks() {
  return getConfiguredAcademyClient().getTracks();
}

export async function academyFetchLesson(lessonId: string) {
  return getConfiguredAcademyClient().getLesson(lessonId);
}
