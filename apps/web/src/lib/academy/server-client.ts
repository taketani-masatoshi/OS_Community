import { AcademyClient } from "@os-community/academy-client";

let client: AcademyClient | null = null;

export class AcademyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcademyConfigError";
  }
}

/** Server-side singleton — Content API URL はクライアントに露出しない */
export function getAcademyClient(): AcademyClient {
  if (client) return client;

  const baseUrl = process.env.ACADEMY_API_URL;
  if (!baseUrl) {
    throw new AcademyConfigError(
      "ACADEMY_API_URL is not configured. Set it in .env for Academy integration.",
    );
  }

  client = new AcademyClient({
    baseUrl,
    timeoutMs: Number(process.env.ACADEMY_API_TIMEOUT_MS ?? 10_000),
  });
  return client;
}

