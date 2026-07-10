import { describe, expect, it } from "vitest";
import {
  GITHUB_COLLABORATOR_PERMISSION,
  mapPermissionLevelToGitHub,
  mergeRepoPermissionLevels,
  verifyGitHubWebhookSignature,
} from "@/lib/github-provisioning";

describe("mapPermissionLevelToGitHub", () => {
  it("maps community permission levels to GitHub collaborator permissions", () => {
    expect(mapPermissionLevelToGitHub("read")).toBe("pull");
    expect(mapPermissionLevelToGitHub("maintain")).toBe("maintain");
    expect(GITHUB_COLLABORATOR_PERMISSION.admin).toBe("admin");
  });
});

describe("mergeRepoPermissionLevels", () => {
  it("picks the highest permission level", () => {
    expect(mergeRepoPermissionLevels(["read", "write", "triage"])).toBe("write");
    expect(mergeRepoPermissionLevels(["maintain", "write"])).toBe("maintain");
  });
});

describe("verifyGitHubWebhookSignature", () => {
  it("accepts valid sha256 signatures", () => {
    const secret = "test-secret";
    const payload = '{"action":"created"}';
    const crypto = require("node:crypto");
    const digest = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    expect(verifyGitHubWebhookSignature(payload, `sha256=${digest}`, secret)).toBe(true);
  });

  it("rejects invalid signatures", () => {
    expect(verifyGitHubWebhookSignature("{}", "sha256=deadbeef", "secret")).toBe(false);
  });
});
