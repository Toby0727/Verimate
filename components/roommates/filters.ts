import type {
  Cleanliness,
  Gender,
  Pets,
  Profile,
  Sleep,
  Smoking,
} from "@/lib/rules/types";

export type Term = "spring" | "summer" | "fall";

export type RoommateFilters = {
  maxBudget: number | null;
  term: Term | null;
  buildingId: string | null;
  gender: Gender | null;
  sleep: Sleep | null;
  cleanliness: Cleanliness | null;
  smoking: Smoking | null;
  pets: Pets | null;
  sameBuilding: boolean;
};

export const EMPTY_FILTERS: RoommateFilters = {
  maxBudget: null,
  term: null,
  buildingId: null,
  gender: null,
  sleep: null,
  cleanliness: null,
  smoking: null,
  pets: null,
  sameBuilding: false,
};

export function termOf(date: string | null): Term | null {
  if (!date) return null;
  const month = Number(date.slice(5, 7));
  if (month <= 4) return "spring";
  if (month <= 7) return "summer";
  return "fall";
}

export function matchesFilters(p: Profile, f: RoommateFilters): boolean {
  return (
    (f.maxBudget === null || (p.budgetMin ?? 0) <= f.maxBudget) &&
    (f.term === null || termOf(p.moveInFrom) === f.term) &&
    (f.buildingId === null || p.buildingId === f.buildingId) &&
    (f.gender === null || p.gender === f.gender) &&
    (f.sleep === null || p.sleep === f.sleep) &&
    (f.cleanliness === null || p.cleanliness === f.cleanliness) &&
    (f.smoking === null || p.smoking === f.smoking) &&
    (f.pets === null || p.pets === f.pets)
  );
}

export function activeFilterCount(f: RoommateFilters): number {
  return Object.entries(f).filter(([, v]) => v !== null && v !== false).length;
}
