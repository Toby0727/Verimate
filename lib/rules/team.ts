// Team dashboard: what the team sees about each account that signed in.
// Pure functions; rows come from public.team_waitlist().
import {
  decodeAbroadPlans,
  raffleWeight,
  stepsLeft,
  WAITLIST_STEPS,
  type WaitlistAnswers,
} from "@/lib/rules/waitlist";

export type TeamRow = {
  user_id: string;
  email: string;
  google_name: string | null;
  account_created_at: string;
  last_sign_in_at: string | null;
  school: "SU" | "ESF" | null;
  has_response: boolean;
  name: string | null;
  gender: WaitlistAnswers["gender"];
  year: WaitlistAnswers["year"];
  major: string | null;
  budget: WaitlistAnswers["budget"];
  areas: WaitlistAnswers["areas"];
  study_abroad: WaitlistAnswers["studyAbroad"];
  study_abroad_plans: string[] | null;
  sublet_out_terms: WaitlistAnswers["subletOutTerms"];
  sublet_in_terms: WaitlistAnswers["subletInTerms"];
  roommate_terms: WaitlistAnswers["roommateTerms"];
  drinking: WaitlistAnswers["drinking"];
  smoking: WaitlistAnswers["smoking"];
  cannabis: WaitlistAnswers["cannabis"];
  greek_life: WaitlistAnswers["greekLife"];
  pets: WaitlistAnswers["pets"];
  photo_path: string | null;
  photo_uploaded: boolean;
  referral_code: string | null;
  referred_by: string | null;
  referral_count: number;
  started_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
};

// Signed in only = never saved a step; in progress = started, not finished;
// finished = in the raffle.
export type SignupStatus = "signed-in" | "in-progress" | "finished";

export function answersOf(row: TeamRow): WaitlistAnswers {
  return {
    name: row.name,
    photoPath: row.photo_uploaded ? row.photo_path : null,
    referredBy: row.referred_by,
    gender: row.gender,
    year: row.year,
    major: row.major,
    budget: row.budget,
    areas: row.areas,
    studyAbroad: row.study_abroad,
    studyAbroadPlans: decodeAbroadPlans(row.study_abroad_plans),
    subletOutTerms: row.sublet_out_terms,
    subletInTerms: row.sublet_in_terms,
    roommateTerms: row.roommate_terms,
    drinking: row.drinking,
    smoking: row.smoking,
    cannabis: row.cannabis,
    greekLife: row.greek_life,
    pets: row.pets,
  };
}

export function signupStatus(row: TeamRow): SignupStatus {
  if (row.completed_at) return "finished";
  return row.has_response ? "in-progress" : "signed-in";
}

export function stepsDone(row: TeamRow): number {
  if (!row.has_response) return 0;
  return WAITLIST_STEPS.length - stepsLeft(answersOf(row));
}

// Raffle entries go by the database's completed_at (the server stamp), not
// by the answers alone: 1 for finishing, +1 when the photo is in storage.
export function teamRaffleEntries(row: TeamRow): number {
  if (!row.completed_at) return 0;
  return row.photo_uploaded ? 2 : 1;
}

export function teamRaffleWeight(row: TeamRow): number {
  return raffleWeight(
    teamRaffleEntries(row),
    row.school !== null,
    row.referral_count,
  );
}

// Each finisher's share of all raffle weight, 0–1.
export function winChance(row: TeamRow, rows: TeamRow[]): number {
  const total = rows.reduce((sum, r) => sum + teamRaffleWeight(r), 0);
  return total > 0 ? teamRaffleWeight(row) / total : 0;
}

export function displayName(row: TeamRow): string {
  return row.name?.trim() || row.google_name?.trim() || row.email;
}

export type TeamTotals = {
  accounts: number;
  started: number;
  finished: number;
  signedInOnly: number;
  school: number;
  personal: number;
  photos: number;
  referred: number;
  newToday: number;
};

// School vs personal goes by the email, since accounts that never saved a
// step have no school column yet.
export function isSchoolEmail(email: string): boolean {
  return /@(syr\.edu|g\.syr\.edu|esf\.edu)$/i.test(email);
}

export function teamTotals(
  rows: TeamRow[],
  now: Date,
  timeZone: string,
): TeamTotals {
  const today = dayKey(now, timeZone);
  return {
    accounts: rows.length,
    started: rows.filter((r) => r.has_response).length,
    finished: rows.filter((r) => r.completed_at).length,
    signedInOnly: rows.filter((r) => !r.has_response).length,
    school: rows.filter((r) => isSchoolEmail(r.email)).length,
    personal: rows.filter((r) => !isSchoolEmail(r.email)).length,
    photos: rows.filter((r) => r.photo_uploaded).length,
    referred: rows.filter((r) => r.referred_by).length,
    newToday: rows.filter(
      (r) => dayKey(new Date(r.account_created_at), timeZone) === today,
    ).length,
  };
}

// "2026-11-03" for the calendar day the moment falls on in timeZone.
export function dayKey(moment: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(moment);
}

export type DayCount = { day: string; signups: number; finished: number };

// New accounts and new finishers on each of the last `days` days, oldest
// first, today last. Days with nothing are kept at zero.
export function dailyCounts(
  rows: TeamRow[],
  days: number,
  now: Date,
  timeZone: string,
): DayCount[] {
  const out: DayCount[] = [];
  const index = new Map<string, DayCount>();
  // Count back from today's date on the calendar itself, so daylight-saving
  // changes never skip or repeat a day.
  const [y, m, d] = dayKey(now, timeZone).split("-").map(Number);
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.UTC(y, m - 1, d - i)).toISOString().slice(0, 10);
    const entry = { day, signups: 0, finished: 0 };
    index.set(day, entry);
    out.push(entry);
  }
  for (const row of rows) {
    const signup = index.get(
      dayKey(new Date(row.account_created_at), timeZone),
    );
    if (signup) signup.signups++;
    if (row.completed_at) {
      const done = index.get(dayKey(new Date(row.completed_at), timeZone));
      if (done) done.finished++;
    }
  }
  return out;
}

export type ActivityKind = "signed-up" | "started" | "finished";
export type Activity = {
  kind: ActivityKind;
  at: string;
  userId: string;
  who: string;
};

// Newest first: account created, first survey save, raffle entry.
export function recentActivity(rows: TeamRow[], limit: number): Activity[] {
  const events: Activity[] = [];
  for (const row of rows) {
    const who = displayName(row);
    events.push({
      kind: "signed-up",
      at: row.account_created_at,
      userId: row.user_id,
      who,
    });
    if (row.started_at)
      events.push({
        kind: "started",
        at: row.started_at,
        userId: row.user_id,
        who,
      });
    if (row.completed_at)
      events.push({
        kind: "finished",
        at: row.completed_at,
        userId: row.user_id,
        who,
      });
  }
  return events
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, limit);
}

// Who invited this student: the account that owns their referred_by code.
export function referrerOf(row: TeamRow, rows: TeamRow[]): TeamRow | null {
  if (!row.referred_by) return null;
  return rows.find((r) => r.referral_code === row.referred_by) ?? null;
}

export function matchesSearch(row: TeamRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.name, row.google_name, row.email, row.major, row.referral_code]
    .filter((v): v is string => Boolean(v))
    .some((v) => v.toLowerCase().includes(q));
}
