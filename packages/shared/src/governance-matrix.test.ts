import { describe, expect, it } from "vitest";
import {
  buildGovernanceCommitteeDefinitions,
  buildGovernanceCommitteeSlug,
  buildDomainGovernanceTree,
  resolveDomainCommitteeSlugsForModule,
} from "./governance-matrix";

describe("governance-matrix", () => {
  it("builds jurisdiction x domain committee slugs", () => {
    expect(buildGovernanceCommitteeSlug("JP", "accounting")).toBe("jp-accounting");
    expect(buildGovernanceCommitteeDefinitions()).toHaveLength(7 * 6);
  });

  it("links jurisdiction pack modules to default domain committees", () => {
    const slugs = resolveDomainCommitteeSlugsForModule({
      slug: "jurisdiction-jp",
      jurisdictionCode: "JP",
    });
    expect(slugs).toContain("jp-accounting");
    expect(slugs).toContain("jp-legal");
  });

  it("links business modules to expert domains in default jurisdiction", () => {
    const slugs = resolveDomainCommitteeSlugsForModule({ slug: "clinic" });
    expect(slugs).toEqual(["jp-medical-qms"]);
  });

  it("builds config-driven domain governance tree from constants", () => {
    const tree = buildDomainGovernanceTree();
    expect(tree).toHaveLength(7);
    expect(tree[0]?.jurisdiction.code).toBe("JP");
    expect(tree[0]?.domains.map((d) => d.slug)).toEqual([
      "jp-accounting",
      "jp-legal",
      "jp-startup-gov",
    ]);
    expect(tree.find((node) => node.jurisdiction.code === "US")?.domains).toHaveLength(3);
  });
});
