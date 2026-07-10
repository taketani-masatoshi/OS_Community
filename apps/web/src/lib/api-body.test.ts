import { describe, it, expect, vi, beforeEach } from "vitest";
import { readJsonBody } from "@/lib/api-body";

vi.mock("@/lib/api-error", () => ({
  apiErrorResponse: vi.fn(async (code: string, status: number) => {
    return new Response(JSON.stringify({ code }), { status });
  }),
}));

describe("readJsonBody", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses valid JSON object", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ foo: "bar" }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await readJsonBody<{ foo: string }>(req);
    expect(result).toEqual({ foo: "bar" });
  });

  it("returns 400 response for invalid JSON", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      body: "{ not valid json",
      headers: { "Content-Type": "application/json" },
    });
    const result = await readJsonBody(req);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(400);
  });

  it("returns 400 for empty body", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      body: "",
      headers: { "Content-Type": "application/json" },
    });
    const result = await readJsonBody(req);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(400);
  });

  it("returns 400 for JSON array instead of object", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      body: "[1,2,3]",
      headers: { "Content-Type": "application/json" },
    });
    const result = await readJsonBody<Record<string, unknown>>(req);
    expect(Array.isArray(result)).toBe(true);
  });

  it("handles binary garbage without throwing", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      body: "\x00\x01\xff\xfe",
      headers: { "Content-Type": "application/json" },
    });
    const result = await readJsonBody(req);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(400);
  });
});
