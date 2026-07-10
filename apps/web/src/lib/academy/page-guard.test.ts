import { beforeEach, describe, expect, it, vi } from "vitest";
import { AcademyApiError } from "@os-community/academy-client";
import { AcademyConfigError } from "@/lib/academy/server-client";

const { redirect, notFound } = vi.hoisted(() => {
  const redirect = vi.fn(() => {
    throw new Error("REDIRECT");
  });
  const notFound = vi.fn(() => {
    throw new Error("NOT_FOUND");
  });
  return { redirect, notFound };
});

vi.mock("next/navigation", () => ({ redirect, notFound }));

import { handleAcademyLoadError, redirectIfAcademyUnavailable } from "./page-guard";

describe("redirectIfAcademyUnavailable", () => {
  beforeEach(() => {
    redirect.mockClear();
    notFound.mockClear();
  });

  it("redirects on AcademyConfigError", () => {
    expect(() => redirectIfAcademyUnavailable(new AcademyConfigError("missing"))).toThrow("REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/learning#curriculum");
  });

  it("redirects on 5xx AcademyApiError", () => {
    expect(() =>
      redirectIfAcademyUnavailable(new AcademyApiError(503, "service_unavailable", "down")),
    ).toThrow("REDIRECT");
  });

  it("redirects on network errors", () => {
    expect(() => redirectIfAcademyUnavailable(new Error("fetch failed"))).toThrow("REDIRECT");
  });

  it("does nothing for 404 AcademyApiError", () => {
    redirectIfAcademyUnavailable(new AcademyApiError(404, "not_found", "missing"));
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("handleAcademyLoadError", () => {
  beforeEach(() => {
    redirect.mockClear();
    notFound.mockClear();
  });

  it("calls notFound for 404", () => {
    expect(() => handleAcademyLoadError(new AcademyApiError(404, "not_found", "missing"))).toThrow(
      "NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalled();
  });

  it("redirects for config errors", () => {
    expect(() => handleAcademyLoadError(new AcademyConfigError("missing"))).toThrow("REDIRECT");
  });

  it("falls back to notFound for unknown errors", () => {
    expect(() => handleAcademyLoadError(new Error("unexpected"))).toThrow("NOT_FOUND");
  });
});
