import { describe, expect, it } from "vitest";
import {
  COMPLIANCE_CHECKLIST_TYPES,
  COMPLIANCE_REGISTRY_CATEGORIES,
  getComplianceCategoryLabel,
  getComplianceChecklistTypeLabel,
  localizedComplianceField,
} from "@os-community/shared";

describe("compliance-registry constants", () => {
  it("defines regulated profession, ISO, and compliance specialist categories", () => {
    const keys = COMPLIANCE_REGISTRY_CATEGORIES.map((row) => row.key);
    expect(keys).toContain("REGULATED_PROFESSION");
    expect(keys).toContain("ISO_AUDIT_QUALIFICATION");
    expect(keys).toContain("COMPLIANCE_SPECIALIST");
  });

  it("defines COI, sanctions, anti-social, and trade checklist types", () => {
    const keys = COMPLIANCE_CHECKLIST_TYPES.map((row) => row.key);
    expect(keys).toContain("CONFLICT_OF_INTEREST");
    expect(keys).toContain("SANCTIONS_SCREENING");
    expect(keys).toContain("ANTI_SOCIAL_FORCES");
    expect(keys).toContain("IMPORT_EXPORT_CONTROLS");
  });

  it("localizes fields for Japanese locale", () => {
    expect(localizedComplianceField("ja", "Attorney", "弁護士")).toBe("弁護士");
    expect(localizedComplianceField("en", "Attorney", "弁護士")).toBe("Attorney");
    expect(getComplianceCategoryLabel("REGULATED_PROFESSION", "ja")).toContain("国家");
    expect(getComplianceChecklistTypeLabel("ANTI_SOCIAL_FORCES", "ja")).toContain("反社会");
  });
});
