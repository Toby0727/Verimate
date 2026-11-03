// Waitlist survey steps. A student is entered in the raffle once every step
// is answered.
import type {
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

export type WaitlistAnswers = {
  name: string | null;
  // Storage path of the optional photo; a photo earns a bonus raffle entry.
  photoPath: string | null;
  gender: Gender | null;
  year: Year | null;
  major: string | null;
  budget: Budget[] | null;
  areas: Area[] | null;
  studyAbroad: StudyAbroad | null;
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
  gender: null,
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
        a.gender !== null &&
        a.year !== null &&
        filled(a.major, MAJOR_MAX_LENGTH)
      );
    case "budget":
      return a.budget !== null && a.budget.length > 0;
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
      return (
        a.drinking !== null &&
        a.smoking !== null &&
        a.cannabis !== null &&
        a.greekLife !== null &&
        a.pets !== null
      );
  }
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
