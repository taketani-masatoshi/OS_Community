import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AcademyClient, AcademyApiError } from "./client";

describe("AcademyClient", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getTracks parses response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tracks: [
          {
            id: "level-0-user",
            level: 0,
            name: "Test",
            description: "d",
            version: "2026.06.0",
            modules: [],
          },
        ],
      }),
    });
    const client = new AcademyClient({ baseUrl: "http://test", fetchImpl: fetchMock });
    const tracks = await client.getTracks();
    expect(tracks).toHaveLength(1);
    expect(tracks[0].id).toBe("level-0-user");
  });

  it("throws AcademyApiError on 404", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({ error: { code: "not_found", message: "missing" } }),
    });
    const client = new AcademyClient({ baseUrl: "http://test", fetchImpl: fetchMock, timeoutMs: 1000 });
    await expect(client.getLesson("x")).rejects.toBeInstanceOf(AcademyApiError);
  });

  it("retries once on network failure", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: [] }),
      });
    const client = new AcademyClient({ baseUrl: "http://test", fetchImpl: fetchMock });
    const tracks = await client.getTracks();
    expect(tracks).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
