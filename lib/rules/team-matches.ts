// Team dashboard: who could help whom. Pure functions over team_waitlist()
// rows. Sublets pair a student who needs a place for a term with one who's
// subletting theirs out that term; roommates pair students looking for the
// same term whose budgets and areas overlap, scored on how they live.
import type { TeamRow } from "@/lib/rules/team";
import { APARTMENTS } from "@/lib/waitlist/apartments";
import {
  type Area,
  CANNABIS,
  CLEANLINESS,
  DRINKING,
  GUESTS,
  HOBBIES,
  SLEEP,
  TERMS,
  type Term,
} from "@/lib/waitlist/options";

export type TermDemand = {
  term: Term;
  // Subletting their place out that term.
  offering: number;
  // Looking for a sublet that term.
  seeking: number;
  // Looking for roommates that term.
  roommates: number;
};

const has = (list: readonly string[] | null, value: string) =>
  list?.includes(value) ?? false;

export function termDemand(rows: TeamRow[]): TermDemand[] {
  return TERMS.map(({ value: term }) => ({
    term,
    offering: rows.filter((r) => has(r.sublet_out_terms, term)).length,
    seeking: rows.filter((r) => has(r.sublet_in_terms, term)).length,
    roommates: rows.filter((r) => has(r.roommate_terms, term)).length,
  }));
}

// The area of the place they're subletting, when they picked (or typed
// exactly) a building we know. Null when we can't tell.
export function homeArea(row: TeamRow): Area | null {
  const home = row.current_home?.trim().toLowerCase();
  if (!home) return null;
  const apt = APARTMENTS.find(
    (a) =>
      a.name.toLowerCase() === home ||
      a.aliases.some((alias) => alias.toLowerCase() === home),
  );
  return apt?.area ?? null;
}

// "area": their place is in an area the seeker wants (or the seeker isn't
// sure yet); "unknown": we don't know where their place is; "elsewhere":
// it's in an area the seeker didn't pick.
export type SubletFit = "area" | "unknown" | "elsewhere";

export type SubletMatch = {
  term: Term;
  seekerId: string;
  offererId: string;
  fit: SubletFit;
};

export function subletFit(seeker: TeamRow, offerer: TeamRow): SubletFit {
  const area = homeArea(offerer);
  if (!area) return "unknown";
  const wants = seeker.areas ?? [];
  return wants.length === 0 ||
    wants.includes("not-sure") ||
    wants.includes(area)
    ? "area"
    : "elsewhere";
}

const FIT_ORDER: SubletFit[] = ["area", "unknown", "elsewhere"];

export function subletMatches(rows: TeamRow[], term: Term): SubletMatch[] {
  const seekers = rows.filter((r) => has(r.sublet_in_terms, term));
  const offerers = rows.filter((r) => has(r.sublet_out_terms, term));
  const matches: SubletMatch[] = [];
  for (const seeker of seekers) {
    for (const offerer of offerers) {
      if (seeker.user_id === offerer.user_id) continue;
      matches.push({
        term,
        seekerId: seeker.user_id,
        offererId: offerer.user_id,
        fit: subletFit(seeker, offerer),
      });
    }
  }
  return matches.sort(
    (a, b) => FIT_ORDER.indexOf(a.fit) - FIT_ORDER.indexOf(b.fit),
  );
}

export type RoommateMatch = {
  term: Term;
  aId: string;
  bId: string;
  // 0–100: how alike they live, plus a little for shared hobbies.
  score: number;
  // Plain-language reasons, best first ("Both night owls").
  reasons: string[];
  // Things that usually break a lease ("One smokes").
  clashes: string[];
};

const overlaps = (a: readonly string[] | null, b: readonly string[] | null) =>
  !a?.length || !b?.length || a.some((x) => b.includes(x));

const areasOverlap = (a: Area[] | null, b: Area[] | null) =>
  has(a, "not-sure") || has(b, "not-sure") || overlaps(a, b);

// How close two answers on an ordered scale are: 1 same, 0.5 next to each
// other, 0 opposite ends. Null if either didn't answer.
function closeness(
  scale: readonly { value: string }[],
  a: string | null,
  b: string | null,
): number | null {
  if (!a || !b) return null;
  const i = scale.findIndex((s) => s.value === a);
  const j = scale.findIndex((s) => s.value === b);
  if (i < 0 || j < 0) return null;
  return 1 - Math.abs(i - j) / Math.max(1, scale.length - 1);
}

const labelOf = (
  scale: readonly { value: string; label: string }[],
  v: string,
) => scale.find((s) => s.value === v)?.label ?? v;

export function sharedHobbies(a: TeamRow, b: TeamRow): string[] {
  const listed = (a.hobbies ?? [])
    .filter((h) => has(b.hobbies, h))
    .map((h) => labelOf(HOBBIES, h));
  const own = (row: TeamRow) =>
    (row.custom_hobbies ?? []).map((h) =>
      h.slice(h.indexOf(":") + 1).toLowerCase(),
    );
  const theirs = own(b);
  const custom = (a.custom_hobbies ?? [])
    .map((h) => h.slice(h.indexOf(":") + 1))
    .filter((label) => theirs.includes(label.toLowerCase()));
  return [...listed, ...custom];
}

export function roommateScore(
  a: TeamRow,
  b: TeamRow,
): Pick<RoommateMatch, "score" | "reasons" | "clashes"> {
  const reasons: string[] = [];
  const clashes: string[] = [];
  const parts: number[] = [];

  const scales = [
    ["sleep", SLEEP],
    ["cleanliness", CLEANLINESS],
    ["guests", GUESTS],
    ["drinking", DRINKING],
    ["cannabis", CANNABIS],
  ] as const;
  for (const [key, scale] of scales) {
    const c = closeness(scale, a[key], b[key]);
    if (c === null) continue;
    parts.push(c);
    const va = a[key];
    if (c === 1 && va) {
      if (key === "sleep")
        reasons.push(
          va === "flexible"
            ? "Same sleep schedule"
            : `Both ${labelOf(SLEEP, va).toLowerCase()}s`,
        );
      if (key === "cleanliness")
        reasons.push(`Both "${labelOf(CLEANLINESS, va).toLowerCase()}"`);
      if (key === "guests")
        reasons.push(`Guests over: both ${labelOf(GUESTS, va).toLowerCase()}`);
    }
    if (c === 0 && key === "sleep") clashes.push("Early bird + night owl");
    if (c === 0 && key === "cleanliness") clashes.push("Very tidy + relaxed");
  }

  // Smoking and pets are yes/no deal-breakers more than scales.
  if (a.smoking && b.smoking) {
    const pair = [a.smoking, b.smoking];
    const clash = pair.includes("yes") && pair.includes("no");
    parts.push(clash ? 0 : 1);
    if (clash) clashes.push("Smoker + non-smoker");
  }
  if (a.pets && b.pets) {
    const clash =
      (a.pets === "have-pet" && b.pets === "no-pets") ||
      (b.pets === "have-pet" && a.pets === "no-pets");
    parts.push(clash ? 0 : 1);
    if (clash) clashes.push("Pet + no pets");
  }

  const shared = sharedHobbies(a, b);
  if (shared.length) {
    const more = shared.length > 3 ? ` +${shared.length - 3}` : "";
    const shown = shared.slice(0, 3).join(", ") + more;
    reasons.push(
      `${shared.length} hobb${shared.length === 1 ? "y" : "ies"} in common: ${shown}`,
    );
  }

  const habits = parts.length
    ? parts.reduce((s, x) => s + x, 0) / parts.length
    : 0.5;
  const score = Math.round(habits * 80 + Math.min(shared.length, 4) * 5);
  return { score, reasons, clashes };
}

// Pairs looking for roommates the same term whose budgets and areas
// overlap, best first.
export function roommateMatches(rows: TeamRow[], term: Term): RoommateMatch[] {
  const looking = rows.filter((r) => has(r.roommate_terms, term));
  const matches: RoommateMatch[] = [];
  for (let i = 0; i < looking.length; i++) {
    for (let j = i + 1; j < looking.length; j++) {
      const a = looking[i];
      const b = looking[j];
      if (!overlaps(a.budget, b.budget) || !areasOverlap(a.areas, b.areas)) {
        continue;
      }
      matches.push({
        term,
        aId: a.user_id,
        bId: b.user_id,
        ...roommateScore(a, b),
      });
    }
  }
  return matches.sort((x, y) => y.score - x.score);
}

// The term with the most possible matches, so the board opens on it.
export function busiestTerm(rows: TeamRow[]): Term {
  let best: Term = TERMS[0].value;
  let most = -1;
  for (const { value } of TERMS) {
    const n =
      subletMatches(rows, value).length + roommateMatches(rows, value).length;
    if (n > most) {
      best = value;
      most = n;
    }
  }
  return best;
}
