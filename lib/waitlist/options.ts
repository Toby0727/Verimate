// Waitlist survey options. Values must match the check constraints in
// supabase/migrations/20261103070000_waitlist_responses.sql.
import type { Choice } from "@/components/shell/choice-chips";

export const GENDERS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not", label: "Prefer not to say" },
] as const satisfies Choice<string>[];

export const YEARS = [
  { value: "freshman", label: "Freshman" },
  { value: "sophomore", label: "Sophomore" },
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
  { value: "fifth-year", label: "5th year" },
  { value: "grad-1", label: "Grad 1st year" },
  { value: "grad-2", label: "Grad 2nd year" },
  { value: "grad-3", label: "Grad 3rd year" },
  { value: "phd", label: "PhD" },
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

// Where a student going away would be, from SU Abroad's centers and partner
// programs (suabroad.syr.edu) and SU's US "study away" semesters. Shown only
// after a term is picked. Keep in sync with the study_abroad_where check.
export const ABROAD_PLACES = {
  us: [
    { value: "los-angeles", label: "Los Angeles" },
    { value: "new-york", label: "New York City" },
    { value: "washington-dc", label: "Washington, DC" },
  ],
  centers: [
    { value: "florence", label: "Florence" },
    { value: "london", label: "London" },
    { value: "madrid", label: "Madrid" },
    { value: "santiago", label: "Santiago" },
    { value: "strasbourg", label: "Strasbourg" },
  ],
  partners: [
    { value: "seoul", label: "Seoul" },
    { value: "tokyo", label: "Tokyo" },
    { value: "hong-kong", label: "Hong Kong" },
    { value: "shanghai", label: "Shanghai" },
    { value: "taipei", label: "Taipei" },
    { value: "copenhagen", label: "Copenhagen" },
    { value: "stockholm", label: "Stockholm" },
    { value: "prague", label: "Prague" },
    { value: "dublin", label: "Dublin" },
    { value: "edinburgh", label: "Edinburgh" },
    { value: "barcelona", label: "Barcelona" },
    { value: "rome", label: "Rome" },
    { value: "berlin", label: "Berlin" },
    { value: "paris", label: "Paris" },
  ],
  // SU Abroad's SEA Semester partner, or Semester at Sea.
  sea: [{ value: "at-sea", label: "Semester at sea" }],
  other: [
    { value: "other", label: "Somewhere else" },
    { value: "not-sure", label: "Not sure yet" },
  ],
} as const satisfies Record<string, Choice<string>[]>;

export const ABROAD_PLACE_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(ABROAD_PLACES)
    .flat()
    .map((place) => [place.value, place.label]),
);

export const TERMS = [
  { value: "spring-2027", label: "Spring 2027" },
  { value: "summer-2027", label: "Summer 2027" },
  { value: "fall-2027", label: "Fall 2027" },
  { value: "spring-2028", label: "Spring 2028" },
] as const satisfies Choice<string>[];

// Typical sublet months for each term, shown next to the term so students
// know how long they'd be away or need a place.
export const TERM_MONTHS: Record<Term, { months: string; count: number }> = {
  "spring-2027": { months: "Jan–May", count: 5 },
  "summer-2027": { months: "Jun–Aug", count: 3 },
  "fall-2027": { months: "Aug–Dec", count: 5 },
  "spring-2028": { months: "Jan–May", count: 5 },
};

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

export const GREEK_LIFE = [
  { value: "member", label: "In a fraternity or sorority" },
  { value: "rushing", label: "Planning to rush" },
  { value: "no", label: "No" },
] as const satisfies Choice<string>[];

export const PETS = [
  { value: "have-pet", label: "I have a pet" },
  { value: "okay", label: "Fine with pets" },
  { value: "no-pets", label: "No pets, please" },
] as const satisfies Choice<string>[];

// Living-together habits (2026-11-04): the posters promise matching on
// these (night owls, clean freaks), so the survey asks them.
export const SLEEP = [
  { value: "early", label: "Early bird" },
  { value: "flexible", label: "In between" },
  { value: "late", label: "Night owl" },
] as const satisfies Choice<string>[];

export const CLEANLINESS = [
  { value: "spotless", label: "Very tidy" },
  { value: "tidy", label: "Tidy enough" },
  { value: "relaxed", label: "Pretty relaxed" },
] as const satisfies Choice<string>[];

export const GUESTS = [
  { value: "rarely", label: "Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
] as const satisfies Choice<string>[];

// Hobbies (2026-11-05, migration v7): a page of tappable icons, plus up to
// HOBBY_CUSTOM_MAX of their own, each with an icon from CUSTOM_HOBBY_ICONS.
// Values must match the hobbies / custom_hobbies checks in
// supabase/migrations/20261105120000_waitlist_hobbies_and_home.sql. The
// icon drawn for each lives in components/waitlist/hobby-icons.ts.
export const HOBBIES = [
  { value: "gym", label: "Gym" },
  { value: "running", label: "Running" },
  { value: "sports", label: "Playing sports" },
  { value: "cuse-games", label: "Cuse games" },
  { value: "hiking", label: "Hiking & outdoors" },
  { value: "cycling", label: "Cycling" },
  { value: "yoga", label: "Yoga" },
  { value: "skiing", label: "Skiing" },
  { value: "swimming", label: "Swimming" },
  { value: "music", label: "Music" },
  { value: "instrument", label: "Playing an instrument" },
  { value: "singing", label: "Singing" },
  { value: "dancing", label: "Dancing" },
  { value: "gaming", label: "Gaming" },
  { value: "movies", label: "Movies & TV" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "art", label: "Art & drawing" },
  { value: "photography", label: "Photography" },
  { value: "cooking", label: "Cooking & baking" },
  { value: "coffee", label: "Coffee shops" },
  { value: "travel", label: "Travel" },
  { value: "going-out", label: "Going out" },
  { value: "coding", label: "Coding & tech" },
  { value: "fashion", label: "Fashion" },
  { value: "volunteering", label: "Volunteering" },
  { value: "board-games", label: "Board games" },
  { value: "plants", label: "Plants" },
  { value: "theater", label: "Theater" },
] as const satisfies Choice<string>[];

// Icons a student can pick for a hobby they add themselves.
export const CUSTOM_HOBBY_ICONS = [
  "star",
  "heart",
  "sparkles",
  "music",
  "camera",
  "brush",
  "leaf",
  "tent",
  "rocket",
  "puzzle",
  "zap",
  "smile",
] as const;

export const HOBBY_CUSTOM_MAX = 5;
export const HOBBY_LABEL_MAX = 30;

type ValueOf<T extends readonly { value: string }[]> = T[number]["value"];
export type Gender = ValueOf<typeof GENDERS>;
export type Year = ValueOf<typeof YEARS>;
export type Budget = ValueOf<typeof BUDGETS>;
export type Area = ValueOf<typeof AREAS>;
export type StudyAbroad = ValueOf<typeof STUDY_ABROAD>;
export type AbroadPlace = ValueOf<
  (typeof ABROAD_PLACES)[keyof typeof ABROAD_PLACES]
>;
export type Term = ValueOf<typeof TERMS>;
export type Drinking = ValueOf<typeof DRINKING>;
export type Smoking = ValueOf<typeof SMOKING>;
export type Cannabis = ValueOf<typeof CANNABIS>;
export type GreekLife = ValueOf<typeof GREEK_LIFE>;
export type Pets = ValueOf<typeof PETS>;
export type Sleep = ValueOf<typeof SLEEP>;
export type Cleanliness = ValueOf<typeof CLEANLINESS>;
export type Guests = ValueOf<typeof GUESTS>;
export type Hobby = ValueOf<typeof HOBBIES>;
export type CustomHobbyIcon = (typeof CUSTOM_HOBBY_ICONS)[number];

// Public contact for privacy requests and raffle questions.
export const CONTACT_EMAIL = "hpang05@syr.edu";

export const RAFFLE = {
  prize: "$50 Amazon gift card",
  endsLabel: "November 30, 2026",
  endsAt: "2026-12-01T04:59:59Z", // 11:59 PM Eastern, Nov 30
  drawnBy: "December 4, 2026",
} as const;
