// Display labels for profile and sublet values.
import type {
  Cleanliness,
  Gender,
  HousingStatus,
  Pets,
  Profile,
  Questionnaire,
  RoomType,
  Sleep,
  Smoking,
} from "@/lib/rules/types";
import type { Choice } from "./choice-chips";

// Asked as pronouns; the stored value still drives the gender filter.
export const GENDER: Choice<Gender>[] = [
  { value: "woman", label: "she/her" },
  { value: "man", label: "he/him" },
  { value: "nonbinary", label: "they/them" },
];

export const HOUSING: Choice<HousingStatus>[] = [
  { value: "has-place", label: "Have a place, need roommates" },
  { value: "needs-place", label: "Need a place" },
  { value: "group", label: "Group looking for more" },
];

export const SLEEP: Choice<Sleep>[] = [
  { value: "early", label: "Early bird" },
  { value: "flexible", label: "Flexible" },
  { value: "late", label: "Night owl" },
];

export const CLEANLINESS: Choice<Cleanliness>[] = [
  { value: "very-tidy", label: "Very tidy" },
  { value: "tidy", label: "Tidy" },
  { value: "relaxed", label: "Relaxed" },
];

export const SMOKING: Choice<Smoking>[] = [
  { value: "no", label: "Non-smoker" },
  { value: "outside", label: "Smokes outside" },
  { value: "yes", label: "Smoker" },
];

export const PETS: Choice<Pets>[] = [
  { value: "none", label: "No pets" },
  { value: "ok", label: "Pets OK" },
  { value: "has-pet", label: "Has a pet" },
];

// Year in school, or the term an admitted student starts.
export const STANDINGS = {
  current: ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
  admitted: [
    "Admitted · Spring 2027",
    "Admitted · Summer 2027",
    "Admitted · Fall 2027",
    "Admitted · Spring 2028",
  ],
};

// Common lease terms. "Custom" in the profile form lets people pick exact dates.
export const MOVE_TERMS = [
  {
    value: "spring-2027",
    label: "Spring 2027",
    from: "2027-01-10",
    to: "2027-05-15",
  },
  {
    value: "summer-2027",
    label: "Summer 2027",
    from: "2027-05-15",
    to: "2027-08-15",
  },
  {
    value: "fall-2027",
    label: "Fall 2027",
    from: "2027-08-15",
    to: "2027-12-20",
  },
  {
    value: "year-2027",
    label: "2027–28 school year",
    from: "2027-08-15",
    to: "2028-05-15",
  },
  {
    value: "spring-2028",
    label: "Spring 2028",
    from: "2028-01-10",
    to: "2028-05-15",
  },
];

export const ROOM_TYPES: Choice<RoomType>[] = [
  { value: "private", label: "Private room" },
  { value: "entire", label: "Entire place" },
  { value: "shared", label: "Shared room" },
];

// Fixed prompt list for profile answer cards.
export const PROMPTS: Choice<string>[] = [
  { value: "ideal-sunday", label: "My ideal Sunday at home" },
  { value: "guests", label: "When friends come over" },
  { value: "dealbreaker", label: "My roommate dealbreaker" },
  { value: "kitchen", label: "In the kitchen, I'm the one who" },
  { value: "quiet-hours", label: "My quiet hours" },
  { value: "good-roommate", label: "I'm a good roommate because" },
  { value: "share", label: "Things I'm happy to share" },
];

export const QUESTIONS: {
  key: keyof Questionnaire;
  label: string;
  options: Choice<string>[];
}[] = [
  {
    key: "guests",
    label: "How often do you have guests over?",
    options: [
      { value: "rarely", label: "Rarely" },
      { value: "sometimes", label: "Sometimes" },
      { value: "often", label: "Often" },
    ],
  },
  {
    key: "noise",
    label: "What noise level do you like at home?",
    options: [
      { value: "quiet", label: "Quiet" },
      { value: "moderate", label: "Moderate" },
      { value: "lively", label: "Lively" },
    ],
  },
  {
    key: "cooking",
    label: "How often do you cook?",
    options: [
      { value: "rarely", label: "Rarely" },
      { value: "sometimes", label: "Sometimes" },
      { value: "daily", label: "Daily" },
    ],
  },
  {
    key: "study",
    label: "Where do you usually study?",
    options: [
      { value: "home", label: "At home" },
      { value: "library", label: "Library" },
      { value: "mixed", label: "Both" },
    ],
  },
  {
    key: "sharing",
    label: "How do you feel about sharing things?",
    options: [
      { value: "keep-separate", label: "Keep separate" },
      { value: "share-basics", label: "Share basics" },
      { value: "share-everything", label: "Share everything" },
    ],
  },
];

export function labelOf<T extends string>(
  options: Choice<T>[],
  value: T | null | undefined,
): string {
  return options.find((o) => o.value === value)?.label ?? "—";
}

export function housingSummary(profile: Profile): string {
  if (profile.housingStatus === "group") {
    return `Group of ${profile.groupHave ?? "?"}, need ${profile.groupNeed ?? "?"} more`;
  }
  return labelOf(HOUSING, profile.housingStatus);
}

// One sentence for the top of a profile, e.g. "Has a place in Westcott, looking for roommates".
export function needSentence(profile: Profile, place: string | null): string {
  if (profile.housingStatus === "has-place") {
    return `Has a place${place ? ` in ${place}` : ""}, looking for roommates`;
  }
  if (profile.housingStatus === "group") {
    return `Group of ${profile.groupHave ?? "?"}${place ? ` looking at ${place}` : ""}, needs ${profile.groupNeed ?? "?"} more`;
  }
  return `Looking for a place${place ? `, ideally ${place}` : ""}, and roommates`;
}

// Whole months between move-in and move-out, e.g. "9 mo".
export function stayLength(from: string | null, to: string | null): string {
  if (!from || !to) return "—";
  const days = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
  return `${Math.max(1, Math.round(days / 30.44))} mo`;
}

const MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const formatMonth = (iso: string | null) =>
  iso ? MONTH.format(new Date(iso)) : "—";
export const formatDay = (iso: string | null) =>
  iso ? DAY.format(new Date(iso)) : "—";

export function formatRange(from: string | null, to: string | null) {
  return `${formatMonth(from)} – ${formatMonth(to)}`;
}

export function initials(name: string | null | undefined) {
  return (name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
