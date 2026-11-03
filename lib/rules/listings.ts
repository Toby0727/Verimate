// Floor plans shown under the waitlist map for the areas a student picks.
// The data itself lives in lib/waitlist/listings.ts.
import type { Area } from "@/lib/waitlist/options";

export type ListedArea = Exclude<Area, "not-sure">;

export type FloorPlan = {
  property: string;
  area: ListedArea;
  plan: string;
  beds: number; // 0 for a studio
  baths: number | null;
  sqft: string | null; // a range like "550–680" when the plan varies
  monthly: number;
  basis: "per-bed" | "per-unit" | "unclear";
  leaseMonths: number | null; // null when the listing doesn't say
  // Set when the property states the lease total itself (e.g. per-semester
  // billing); otherwise the total is monthly × lease months.
  statedTotal?: number;
  note?: string;
  source: string;
};

export type PropertyPlans = {
  property: string;
  area: ListedArea;
  plans: FloorPlan[];
};

// Null when the lease length isn't known, so no total is guessed.
export function leaseTotal(plan: FloorPlan): number | null {
  if (plan.statedTotal !== undefined) return plan.statedTotal;
  if (plan.leaseMonths === null) return null;
  return Math.round(plan.monthly * plan.leaseMonths);
}

// Groups the plans in the picked areas by property, cheapest first.
export function plansInAreas(
  plans: readonly FloorPlan[],
  areas: Area[] | null,
): PropertyPlans[] {
  const picked = new Set<Area>(areas ?? []);
  const byProperty = new Map<string, PropertyPlans>();
  for (const plan of plans) {
    if (!picked.has(plan.area)) continue;
    const group = byProperty.get(plan.property) ?? {
      property: plan.property,
      area: plan.area,
      plans: [],
    };
    group.plans.push(plan);
    byProperty.set(plan.property, group);
  }
  const groups = [...byProperty.values()];
  for (const group of groups) {
    group.plans.sort((a, b) => a.monthly - b.monthly || a.beds - b.beds);
  }
  return groups.sort((a, b) => a.plans[0].monthly - b.plans[0].monthly);
}
