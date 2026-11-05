// Waitlist survey steps. A student is entered in the raffle once every step
// is answered.
import type {
  AbroadPlace,
  Area,
  Budget,
  Cannabis,
  Cleanliness,
  CustomHobbyIcon,
  Drinking,
  Gender,
  GreekLife,
  Guests,
  Hobby,
  Pets,
  Sleep,
  Smoking,
  StudyAbroad,
  Term,
  Year,
} from "@/lib/waitlist/options";
import {
  CUSTOM_HOBBY_ICONS,
  HOBBIES,
  HOBBY_CUSTOM_MAX,
  HOBBY_LABEL_MAX,
  TERMS,
} from "@/lib/waitlist/options";

const TERM_ORDER: Term[] = TERMS.map((term) => term.value);

export type AbroadPlan = { term: Term; place: AbroadPlace | null };

// A hobby the student added themselves, with the icon they picked.
export type CustomHobby = { icon: CustomHobbyIcon; label: string };

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
  // Where they live now: a building from APARTMENTS or what they typed.
  // Asked only when they want to sublet their place out (2026-11-05).
  currentHome: string | null;
  subletInTerms: Term[] | null;
  roommateTerms: Term[] | null;
  drinking: Drinking | null;
  smoking: Smoking | null;
  cannabis: Cannabis | null;
  greekLife: GreekLife | null;
  pets: Pets | null;
  // Living-together habits (2026-11-04).
  sleep: Sleep | null;
  cleanliness: Cleanliness | null;
  guests: Guests | null;
  // Hobbies page (2026-11-05): picked from HOBBIES, plus their own.
  hobbies: Hobby[] | null;
  customHobbies: CustomHobby[] | null;
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
  currentHome: null,
  subletInTerms: null,
  roommateTerms: null,
  drinking: null,
  smoking: null,
  cannabis: null,
  greekLife: null,
  pets: null,
  sleep: null,
  cleanliness: null,
  guests: null,
  hobbies: null,
  customHobbies: null,
};

export const WAITLIST_STEPS = [
  "about",
  "budget",
  "areas",
  "abroad",
  "timing",
  "lifestyle",
  "hobbies",
] as const;
export type WaitlistStep = (typeof WAITLIST_STEPS)[number];

export const NAME_MAX_LENGTH = 80;
export const MAJOR_MAX_LENGTH = 80;
export const HOME_MAX_LENGTH = 120;

// Text a spreadsheet would run as a formula when the team exports the data
// (the database refuses it too, as it does for names and majors).
export const looksLikeFormula = (text: string) => /^\s*[=+@-]/.test(text);

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
        a.roommateTerms !== null &&
        (!needsCurrentHome(a) || isHomeFilled(a.currentHome))
      );
    case "lifestyle":
      return (
        a.drinking !== null &&
        a.smoking !== null &&
        a.cannabis !== null &&
        a.greekLife !== null &&
        a.pets !== null &&
        a.sleep !== null &&
        a.cleanliness !== null &&
        a.guests !== null
      );
    case "hobbies":
      return hobbyCount(a) > 0;
  }
}

// "Where do you live now?" shows once they tick any "Sublet my place" term.
export function needsCurrentHome(a: WaitlistAnswers): boolean {
  return (a.subletOutTerms?.length ?? 0) > 0;
}

function isHomeFilled(home: string | null): boolean {
  return filled(home, HOME_MAX_LENGTH) && !looksLikeFormula(home ?? "");
}

// What gets saved: their home only while they're subletting out, trimmed.
export function homeToSave(a: WaitlistAnswers): string | null {
  if (!needsCurrentHome(a)) return null;
  const home = a.currentHome?.trim();
  return home && isHomeFilled(home) ? home : null;
}

export function hobbyCount(a: WaitlistAnswers): number {
  return (a.hobbies?.length ?? 0) + (a.customHobbies?.length ?? 0);
}

export type CustomHobbyRefusal =
  | "empty"
  | "too-long"
  | "formula"
  | "taken"
  | "full";

// Adds a hobby of their own: trimmed, single-spaced, at most
// HOBBY_LABEL_MAX characters, not one they already have (or one of the
// listed hobbies), and at most HOBBY_CUSTOM_MAX of them.
export function addCustomHobby(
  list: CustomHobby[] | null,
  icon: CustomHobbyIcon,
  input: string,
):
  | { ok: true; list: CustomHobby[] }
  | { ok: false; reason: CustomHobbyRefusal } {
  const current = list ?? [];
  const label = input.replace(/\s+/g, " ").trim();
  if (!label) return { ok: false, reason: "empty" };
  if (label.length > HOBBY_LABEL_MAX) return { ok: false, reason: "too-long" };
  if (looksLikeFormula(label)) return { ok: false, reason: "formula" };
  const key = label.toLowerCase();
  const taken =
    current.some((hobby) => hobby.label.toLowerCase() === key) ||
    HOBBIES.some((hobby) => hobby.label.toLowerCase() === key);
  if (taken) return { ok: false, reason: "taken" };
  if (current.length >= HOBBY_CUSTOM_MAX) return { ok: false, reason: "full" };
  return { ok: true, list: [...current, { icon, label }] };
}

export function removeCustomHobby(
  list: CustomHobby[] | null,
  label: string,
): CustomHobby[] {
  return (list ?? []).filter((hobby) => hobby.label !== label);
}

// Stored as "icon:label" (e.g. "tent:Camping") so the database can check
// each one. The label may itself contain ":".
export function encodeCustomHobbies(
  list: CustomHobby[] | null,
): string[] | null {
  if (!list) return null;
  return list.map((hobby) => `${hobby.icon}:${hobby.label}`);
}

export function decodeCustomHobbies(
  stored: string[] | null,
): CustomHobby[] | null {
  if (!stored) return null;
  const icons: readonly string[] = CUSTOM_HOBBY_ICONS;
  return stored.flatMap((item) => {
    if (typeof item !== "string") return [];
    const at = item.indexOf(":");
    const icon = item.slice(0, at);
    const label = item.slice(at + 1);
    if (at < 1 || !label || !icons.includes(icon)) return [];
    return [{ icon: icon as CustomHobbyIcon, label }];
  });
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
  // Skips anything that isn't a "term:place" string rather than crashing.
  const plans = stored
    .filter((item): item is string => typeof item === "string")
    .map((item) => {
      const [term, place] = item.split(":");
      return {
        term: term as Term,
        place: place ? (place as AbroadPlace) : null,
      };
    });
  return plans.length ? plans : null;
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

// Signing in with a school account raises your chance this much.
export const SCHOOL_BOOST = 0.05;

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

// Extra chance on top of your entries, as a fraction: 5% for a school
// account and 10% per friend who joined with your code.
export function raffleBoost(schoolAccount: boolean, referrals: number): number {
  return (schoolAccount ? SCHOOL_BOOST : 0) + REFERRAL_BOOST * referrals;
}

// Chance weight in the drawing: entries raised by the boost.
export function raffleWeight(
  entries: number,
  schoolAccount: boolean,
  referrals: number,
): number {
  const weight = entries * (1 + raffleBoost(schoolAccount, referrals));
  return Math.round(weight * 100) / 100;
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

// Where a sign-up came from: the ?src= tag on a poster QR code or story
// link (e.g. "ig-story", "slocum-gym-rat"). Lowercase letters, digits and
// dashes, at most 40 characters; anything else is dropped. Null if empty.
export const SOURCE_MAX_LENGTH = 40;

export function normalizeSource(input: string | null): string | null {
  if (!input) return null;
  const clean = input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SOURCE_MAX_LENGTH)
    .replace(/-$/, "");
  return clean || null;
}
