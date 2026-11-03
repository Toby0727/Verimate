// Waitlist survey steps. A student is entered in the raffle once every step
// is answered.
import type {
  AbroadPlace,
  Area,
  Budget,
  Cannabis,
  Drinking,
  Gender,
  GreekLife,
  Pets,
  Smoking,
  StudyAbroad,
  Term,
  Year,
} from "@/lib/waitlist/options";
import { TERMS } from "@/lib/waitlist/options";

const TERM_ORDER: Term[] = TERMS.map((term) => term.value);

export type AbroadPlan = { term: Term; place: AbroadPlace | null };

export type WaitlistAnswers = {
  name: string | null;
  // Storage path of the optional photo; a photo earns a bonus raffle entry.
  photoPath: string | null;
  // Code of the friend who invited them (optional).
  referredBy: string | null;
  gender: Gender | null;
  year: Year | null;
  major: string | null;
  budget: Budget[] | null;
  areas: Area[] | null;
  studyAbroad: StudyAbroad | null;
  // One entry per term away, each with where (null until picked). Null when
  // there's no term away; studyAbroad then holds "no" or "not-sure", and
  // otherwise the earliest term.
  studyAbroadPlans: AbroadPlan[] | null;
  // Empty array means "not needed"; null means not answered yet.
  subletOutTerms: Term[] | null;
  subletInTerms: Term[] | null;
  roommateTerms: Term[] | null;
  drinking: Drinking | null;
  smoking: Smoking | null;
  cannabis: Cannabis | null;
  greekLife: GreekLife | null;
  pets: Pets | null;
};

export const EMPTY_ANSWERS: WaitlistAnswers = {
  name: null,
  photoPath: null,
  referredBy: null,
  gender: null,
  year: null,
  major: null,
  budget: null,
  areas: null,
  studyAbroad: null,
  studyAbroadPlans: null,
  subletOutTerms: null,
  subletInTerms: null,
  roommateTerms: null,
  drinking: null,
  smoking: null,
  cannabis: null,
  greekLife: null,
  pets: null,
};

export const WAITLIST_STEPS = [
  "about",
  "budget",
  "areas",
  "abroad",
  "timing",
  "lifestyle",
] as const;
export type WaitlistStep = (typeof WAITLIST_STEPS)[number];

export const NAME_MAX_LENGTH = 80;
export const MAJOR_MAX_LENGTH = 80;

const filled = (text: string | null, max: number) =>
  text !== null && text.trim().length > 0 && text.trim().length <= max;

export function isStepDone(step: WaitlistStep, a: WaitlistAnswers): boolean {
  switch (step) {
    case "about":
      return (
        filled(a.name, NAME_MAX_LENGTH) &&
        (a.referredBy === null || isReferralCode(a.referredBy)) &&
        a.gender !== null &&
        a.year !== null &&
        filled(a.major, MAJOR_MAX_LENGTH)
      );
    case "budget":
      return a.budget !== null && a.budget.length > 0;
    case "areas":
      return a.areas !== null && a.areas.length > 0;
    case "abroad":
      return (
        a.studyAbroad !== null &&
        (!isAwayTerm(a.studyAbroad) ||
          (a.studyAbroadPlans !== null &&
            a.studyAbroadPlans.length > 0 &&
            a.studyAbroadPlans.every((plan) => plan.place !== null)))
      );
    case "timing":
      return (
        a.subletOutTerms !== null &&
        a.subletInTerms !== null &&
        a.roommateTerms !== null
      );
    case "lifestyle":
      return (
        a.drinking !== null &&
        a.smoking !== null &&
        a.cannabis !== null &&
        a.greekLife !== null &&
        a.pets !== null
      );
  }
}

// True for an actual term away, as opposed to "No plans" or "Not sure yet".
export function isAwayTerm(value: StudyAbroad | null): boolean {
  return value !== null && value !== "no" && value !== "not-sure";
}

// Tapping "No plans" or "Not sure yet" clears any terms; tapping a term adds
// or removes it (several terms can be away), kept in calendar order.
export function toggleAbroad(
  plans: AbroadPlan[] | null,
  value: StudyAbroad,
): Pick<WaitlistAnswers, "studyAbroad" | "studyAbroadPlans"> {
  if (!isAwayTerm(value)) return { studyAbroad: value, studyAbroadPlans: null };
  const term = value as Term;
  const current = plans ?? [];
  const next = current.some((plan) => plan.term === term)
    ? current.filter((plan) => plan.term !== term)
    : [...current, { term, place: null }];
  next.sort((a, b) => TERM_ORDER.indexOf(a.term) - TERM_ORDER.indexOf(b.term));
  if (next.length === 0) return { studyAbroad: null, studyAbroadPlans: null };
  return { studyAbroad: next[0].term, studyAbroadPlans: next };
}

export function setAbroadPlace(
  plans: AbroadPlan[],
  term: Term,
  place: AbroadPlace,
): AbroadPlan[] {
  return plans.map((plan) => (plan.term === term ? { ...plan, place } : plan));
}

// Stored as "fall-2027:london" so the database can check each pair.
export function encodeAbroadPlans(plans: AbroadPlan[] | null): string[] | null {
  if (!plans) return null;
  return plans.map((plan) => `${plan.term}:${plan.place ?? ""}`);
}

export function decodeAbroadPlans(
  stored: string[] | null,
): AbroadPlan[] | null {
  if (!stored) return null;
  return stored.map((item) => {
    const [term, place] = item.split(":");
    return {
      term: term as Term,
      place: place ? (place as AbroadPlace) : null,
    };
  });
}

export function stepsLeft(a: WaitlistAnswers): number {
  return WAITLIST_STEPS.filter((step) => !isStepDone(step, a)).length;
}

export function isComplete(a: WaitlistAnswers): boolean {
  return stepsLeft(a) === 0;
}

// One entry for finishing the survey, plus one for adding a photo.
export function raffleEntries(a: WaitlistAnswers): number {
  if (!isComplete(a)) return 0;
  return a.photoPath ? 2 : 1;
}

export const REFERRAL_CODE_LENGTH = 6;
// Each friend who finishes the survey with your code adds this share of
// your entries to your chances.
export const REFERRAL_BOOST = 0.1;

// What a student types or pastes becomes a clean code: capitals and digits
// only, at most six characters.
export function normalizeReferralCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, REFERRAL_CODE_LENGTH);
}

export function isReferralCode(code: string): boolean {
  return new RegExp(`^[A-Z0-9]{${REFERRAL_CODE_LENGTH}}$`).test(code);
}

// Chance weight in the drawing: entries, raised 10% per friend who joined.
export function raffleWeight(entries: number, referrals: number): number {
  return Math.round(entries * (1 + REFERRAL_BOOST * referrals) * 100) / 100;
}

// Where to resume: the first unanswered step, or null when all are done.
export function firstOpenStep(a: WaitlistAnswers): WaitlistStep | null {
  return WAITLIST_STEPS.find((step) => !isStepDone(step, a)) ?? null;
}

// "Not sure yet" can't be combined with specific areas.
export function toggleArea(areas: Area[] | null, area: Area): Area[] {
  const current = areas ?? [];
  if (current.includes(area)) return current.filter((a) => a !== area);
  if (area === "not-sure") return ["not-sure"];
  return [...current.filter((a) => a !== "not-sure"), area];
}

// Adds the value to the list, or removes it if it's already there.
export function toggle<T>(list: T[] | null, value: T): T[] {
  const current = list ?? [];
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}
