import { describe, expect, it } from "vitest";
import { parseGithubRepoUrl } from "./github-repo-url";

describe("parseGithubRepoUrl", () => {
  it("parses https repository URLs", () => {
    expect(parseGithubRepoUrl("https://github.com/acme/OS_Steward")).toEqual({
      owner: "acme",
      name: "OS_Steward",
      repoUrl: "https://github.com/acme/OS_Steward",
    });
  });

  it("strips .git suffix and trailing slash", () => {
    expect(parseGithubRepoUrl("https://github.com/acme/OS_Steward.git/")).toEqual({
      owner: "acme",
      name: "OS_Steward",
      repoUrl: "https://github.com/acme/OS_Steward",
    });
  });

  it("rejects placeholder example URLs without valid owner", () => {
    expect(parseGithubRepoUrl("https://github.com/your-org/OS_Steward")).toEqual({
      owner: "your-org",
      name: "OS_Steward",
      repoUrl: "https://github.com/your-org/OS_Steward",
    });
  });

  it("returns null for non-GitHub URLs", () => {
    expect(parseGithubRepoUrl("https://openorgos.net/github")).toBeNull();
  });
});
