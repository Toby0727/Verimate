// Waitlist survey options. Values must match the check constraints in
// supabase/migrations/20261103070000_waitlist_responses.sql.
import type { Choice } from "@/components/shell/choice-chips";

export const YEARS = [
  { value: "freshman", label: "Freshman" },
  { value: "sophomore", label: "Sophomore" },
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
  { value: "graduate", label: "Graduate" },
] as const satisfies Choice<string>[];

export const BUDGETS = [
  { value: "under-600", label: "Under $600" },
  { value: "600-800", label: "$600–800" },
  { value: "800-1000", label: "$800–1,000" },
  { value: "1000-1200", label: "$1,000–1,200" },
  { value: "1200-1500", label: "$1,200–1,500" },
  { value: "1500-plus", label: "$1,500+" },
] as const satisfies Choice<string>[];

export const AREAS = [
  { value: "university-hill", label: "University Hill" },
  { value: "south-campus", label: "South Campus" },
  { value: "euclid", label: "Euclid Ave" },
  { value: "westcott", label: "Westcott" },
  { value: "downtown", label: "Downtown / Armory Square" },
  { value: "not-sure", label: "Not sure yet" },
] as const satisfies Choice<string>[];

export const STUDY_ABROAD = [
  { value: "no", label: "No plans" },
  { value: "spring-2027", label: "Spring 2027" },
  { value: "summer-2027", label: "Summer 2027" },
  { value: "fall-2027", label: "Fall 2027" },
  { value: "spring-2028", label: "Spring 2028" },
  { value: "not-sure", label: "Not sure yet" },
] as const satisfies Choice<string>[];

export const TERMS = [
  { value: "spring-2027", label: "Spring 2027" },
  { value: "summer-2027", label: "Summer 2027" },
  { value: "fall-2027", label: "Fall 2027" },
  { value: "spring-2028", label: "Spring 2028" },
] as const satisfies Choice<string>[];

export const DRINKING = [
  { value: "never", label: "Never" },
  { value: "socially", label: "Socially" },
  { value: "often", label: "Often" },
] as const satisfies Choice<string>[];

export const SMOKING = [
  { value: "no", label: "No" },
  { value: "outside", label: "Outside only" },
  { value: "yes", label: "Yes" },
] as const satisfies Choice<string>[];

export const CANNABIS = [
  { value: "never", label: "Never" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
] as const satisfies Choice<string>[];

type ValueOf<T extends readonly { value: string }[]> = T[number]["value"];
export type Year = ValueOf<typeof YEARS>;
export type Budget = ValueOf<typeof BUDGETS>;
export type Area = ValueOf<typeof AREAS>;
export type StudyAbroad = ValueOf<typeof STUDY_ABROAD>;
export type Term = ValueOf<typeof TERMS>;
export type Drinking = ValueOf<typeof DRINKING>;
export type Smoking = ValueOf<typeof SMOKING>;
export type Cannabis = ValueOf<typeof CANNABIS>;

export const RAFFLE = {
  prize: "$50 Amazon gift card",
  endsLabel: "November 30, 2026",
  endsAt: "2026-12-01T04:59:59Z", // 11:59 PM Eastern, Nov 30
  drawnBy: "December 4, 2026",
} as const;
