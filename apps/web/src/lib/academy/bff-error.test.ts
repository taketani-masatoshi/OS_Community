import { describe, it, expect, vi } from "vitest";
import { AcademyConfigError } from "@/lib/academy/server-client";
import { academyErrorResponse, academyUnavailableResponse } from "@/lib/academy/bff-error";

vi.mock("@/lib/api-error", () => ({
  apiErrorResponse: vi.fn(async (code: string, status: number) =>
    Response.json({ code, error: code }, { status }),
  ),
}));

describe("academy bff-error", () => {
  it("maps AcademyConfigError to SERVICE_UNAVAILABLE", async () => {
    const res = await academyUnavailableResponse(new AcademyConfigError("missing"));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("maps upstream 404 to NOT_FOUND", async () => {
    const res = await academyErrorResponse({ status: 404, code: "not_found", message: "x" });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe("NOT_FOUND");
  });
});
