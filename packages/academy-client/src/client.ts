import {
  certTemplatesResponseSchema,
  examFormResponseSchema,
  issuanceResponseSchema,
  lessonResponseSchema,
  moduleResponseSchema,
  trackResponseSchema,
  tracksResponseSchema,
  type LessonSummary,
  type ModuleSummary,
  type TrackSummary,
} from "./schemas";

export type AcademyClientOptions = {
  baseUrl: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export class AcademyApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AcademyApiError";
  }
}

export class AcademyClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AcademyClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 10_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async getTracks(): Promise<TrackSummary[]> {
    const data = await this.getJson("/v1/tracks", tracksResponseSchema);
    return data.tracks;
  }

  async getTrack(trackId: string): Promise<TrackSummary> {
    const data = await this.getJson(`/v1/tracks/${encodeURIComponent(trackId)}`, trackResponseSchema);
    return data.track;
  }

  async getModule(trackId: string, moduleSlug: string): Promise<ModuleSummary> {
    const data = await this.getJson(
      `/v1/modules/${encodeURIComponent(trackId)}/${encodeURIComponent(moduleSlug)}`,
      moduleResponseSchema,
    );
    return data.module;
  }

  async getLesson(lessonId: string): Promise<LessonSummary> {
    const data = await this.getJson(
      `/v1/lessons/${encodeURIComponent(lessonId)}`,
      lessonResponseSchema,
    );
    return data.lesson;
  }

  async getExamForm(bankId: string, formId: string) {
    return this.getJson(
      `/v1/exams/forms/${encodeURIComponent(bankId)}/${encodeURIComponent(formId)}`,
      examFormResponseSchema,
    );
  }

  async getCertTemplates() {
    const data = await this.getJson("/v1/certifications/templates", certTemplatesResponseSchema);
    return data.templates;
  }

  async getIssuanceRules() {
    const data = await this.getJson("/v1/certifications/issuance", issuanceResponseSchema);
    return data.rules;
  }

  private async getJson<T>(path: string, schema: { parse: (data: unknown) => T }): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        const res = await this.fetchImpl(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(timer);

        if (!res.ok) {
          let code = "request_failed";
          let message = res.statusText;
          try {
            const errBody = (await res.json()) as { error?: { code?: string; message?: string } };
            code = errBody.error?.code ?? code;
            message = errBody.error?.message ?? message;
          } catch {
            /* ignore parse errors */
          }
          throw new AcademyApiError(res.status, code, message);
        }

        const json = await res.json();
        return schema.parse(json);
      } catch (err) {
        lastError = err;
        if (err instanceof AcademyApiError) throw err;
        if (attempt === 1) {
          const message =
            err instanceof Error && err.message.includes("fetch failed")
              ? "Academy Content API is unavailable"
              : err instanceof Error
                ? err.message
                : "Academy Content API is unavailable";
          throw new AcademyApiError(503, "service_unavailable", message);
        }
      }
    }

    throw lastError;
  }
}
