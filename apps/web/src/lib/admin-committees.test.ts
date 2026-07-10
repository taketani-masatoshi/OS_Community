import { describe, expect, it } from "vitest";

describe("admin-committees validation helpers", () => {
  it("COMMITTEE_MEMBER_ROLES includes CHAIR through OBSERVER", async () => {
    const { COMMITTEE_MEMBER_ROLES } = await import("./admin-committees");
    expect(COMMITTEE_MEMBER_ROLES).toEqual(["CHAIR", "REVIEWER", "MEMBER", "OBSERVER"]);
  });
});
