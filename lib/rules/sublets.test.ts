import { describe, expect, it } from "vitest";
import { isSubletListed, missingSubletFields, subletStatusAt } from "./sublets";
import { makeSublet, NOW } from "./test-fixtures";
import { addDays } from "./time";

describe("missingSubletFields", () => {
  it("passes a complete post", () => {
    expect(missingSubletFields(makeSublet())).toEqual([]);
  });

  it("names each missing field", () => {
    expect(
      missingSubletFields(
        makeSublet({ area: null, buildingId: null, photos: [] }),
      ),
    ).toEqual(["location", "photos"]);
    expect(missingSubletFields(makeSublet({ furnished: null }))).toEqual([
      "furnished",
    ]);
    expect(missingSubletFields(makeSublet({ onLeaseDeclared: false }))).toEqual(
      ["onLeaseDeclared"],
    );
  });

  it("rejects an end date on or before the start date", () => {
    expect(
      missingSubletFields(
        makeSublet({ startDate: "2027-06-01", endDate: "2027-05-01" }),
      ),
    ).toEqual(["dates"]);
  });
});

describe("subletStatusAt", () => {
  const updated = (days: number) =>
    makeSublet({ updatedAt: addDays(NOW, -days), endDate: "2099-01-01" });

  it("turns stale after 30 days without an update", () => {
    expect(subletStatusAt(updated(29), NOW)).toBe("active");
    expect(subletStatusAt(updated(30), NOW)).toBe("stale");
  });

  it("expires 7 days after the stale reminder", () => {
    const reminded = (days: number) =>
      makeSublet({
        updatedAt: addDays(NOW, -40),
        staleNotifiedAt: addDays(NOW, -days),
        endDate: "2099-01-01",
      });
    expect(subletStatusAt(reminded(6), NOW)).toBe("stale");
    expect(subletStatusAt(reminded(7), NOW)).toBe("expired");
  });

  it("expires after the end date and keeps final states", () => {
    expect(subletStatusAt(makeSublet({ endDate: "2026-01-01" }), NOW)).toBe(
      "expired",
    );
    expect(subletStatusAt(makeSublet({ status: "subleased" }), NOW)).toBe(
      "subleased",
    );
    expect(subletStatusAt(makeSublet({ status: "removed" }), NOW)).toBe(
      "removed",
    );
  });

  it("lists only active and stale posts", () => {
    expect(isSubletListed(updated(1), NOW)).toBe(true);
    expect(isSubletListed(updated(31), NOW)).toBe(true);
    expect(isSubletListed(makeSublet({ status: "subleased" }), NOW)).toBe(
      false,
    );
  });
});
