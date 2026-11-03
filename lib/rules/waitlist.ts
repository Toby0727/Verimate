// Waitlist survey steps. A student is entered in the raffle once every step
// is answered.
import type {
  Area,
  Budget,
  Cannabis,
  Drinking,
  Smoking,
  StudyAbroad,
  Term,
  Year,
} from "@/lib/waitlist/options";

export type WaitlistAnswers = {
  year: Year | null;
  major: string | null;
  budget: Budget | null;
  areas: Area[] | null;
  studyAbroad: StudyAbroad | null;
  // Empty array means "not needed"; null means not answered yet.
  subletOutTerms: Term[] | null;
  subletInTerms: Term[] | null;
  roommateTerms: Term[] | null;
  drinking: Drinking | null;
  smoking: Smoking | null;
  cannabis: Cannabis | null;
};

export const EMPTY_ANSWERS: WaitlistAnswers = {
  year: null,
  major: null,
  budget: null,
  areas: null,
  studyAbroad: null,
  subletOutTerms: null,
  subletInTerms: null,
  roommateTerms: null,
  drinking: null,
  smoking: null,
  cannabis: null,
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

export const MAJOR_MAX_LENGTH = 80;

export function isStepDone(step: WaitlistStep, a: WaitlistAnswers): boolean {
  switch (step) {
    case "about":
      return (
        a.year !== null &&
        a.major !== null &&
        a.major.trim().length > 0 &&
        a.major.trim().length <= MAJOR_MAX_LENGTH
      );
    case "budget":
      return a.budget !== null;
    case "areas":
      return a.areas !== null && a.areas.length > 0;
    case "abroad":
      return a.studyAbroad !== null;
    case "timing":
      return (
        a.subletOutTerms !== null &&
        a.subletInTerms !== null &&
        a.roommateTerms !== null
      );
    case "lifestyle":
      return a.drinking !== null && a.smoking !== null && a.cannabis !== null;
  }
}

export function stepsLeft(a: WaitlistAnswers): number {
  return WAITLIST_STEPS.filter((step) => !isStepDone(step, a)).length;
}

export function isComplete(a: WaitlistAnswers): boolean {
  return stepsLeft(a) === 0;
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
