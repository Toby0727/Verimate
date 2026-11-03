import { describe, expect, it } from "vitest";
import { type FloorPlan, leaseTotal, plansInAreas } from "./listings";

const plan = (overrides: Partial<FloorPlan>): FloorPlan => ({
  property: "The Standard",
  area: "university-hill",
  plan: "2x2",
  beds: 2,
  baths: 2,
  sqft: "800",
  monthly: 1000,
  basis: "per-bed",
  leaseMonths: 12,
  source: "https://example.com",
  ...overrides,
});

describe("leaseTotal", () => {
  it("multiplies monthly rent by lease months", () => {
    expect(leaseTotal(plan({ monthly: 1049, leaseMonths: 12 }))).toBe(12588);
  });

  it("rounds partial-month leases", () => {
    expect(leaseTotal(plan({ monthly: 999.5, leaseMonths: 11.5 }))).toBe(11494);
  });

  it("has no total when the lease length is unknown", () => {
    expect(leaseTotal(plan({ leaseMonths: null }))).toBeNull();
  });

  it("uses a total the property states itself", () => {
    expect(leaseTotal(plan({ statedTotal: 9800, monthly: 1089 }))).toBe(9800);
  });
});

describe("plansInAreas", () => {
  const plans = [
    plan({ property: "A", monthly: 1200, plan: "1x1", beds: 1 }),
    plan({ property: "A", monthly: 900, plan: "4x4", beds: 4 }),
    plan({ property: "B", monthly: 800 }),
    plan({ property: "C", area: "downtown", monthly: 700 }),
  ];

  it("shows nothing until an area is picked", () => {
    expect(plansInAreas(plans, null)).toEqual([]);
    expect(plansInAreas(plans, ["not-sure"])).toEqual([]);
  });

  it("keeps only the picked areas", () => {
    expect(
      plansInAreas(plans, ["downtown"]).map((group) => group.property),
    ).toEqual(["C"]);
  });

  it("groups by property, cheapest property and plan first", () => {
    const groups = plansInAreas(plans, ["university-hill"]);
    expect(groups.map((group) => group.property)).toEqual(["B", "A"]);
    expect(groups[1].plans.map((p) => p.plan)).toEqual(["4x4", "1x1"]);
  });
});
