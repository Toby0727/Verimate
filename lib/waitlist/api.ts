// Reads and writes the signed-in student's waitlist row. Runs in the browser;
// RLS on public.waitlist_responses limits each student to their own row.
import type { School } from "@/lib/rules/types";
import { schoolOfGoogleAccount } from "@/lib/rules/verification";
import {
  EMPTY_ANSWERS,
  isComplete,
  type WaitlistAnswers,
} from "@/lib/rules/waitlist";

export type WaitlistSession =
  | { status: "signed-out" }
  | { status: "not-school"; email: string }
  | {
      status: "signed-in";
      userId: string;
      email: string;
      school: School;
      answers: WaitlistAnswers;
      completedAt: string | null;
    };

type Row = {
  year: WaitlistAnswers["year"];
  major: string | null;
  budget: WaitlistAnswers["budget"];
  areas: WaitlistAnswers["areas"];
  study_abroad: WaitlistAnswers["studyAbroad"];
  sublet_out_terms: WaitlistAnswers["subletOutTerms"];
  sublet_in_terms: WaitlistAnswers["subletInTerms"];
  roommate_terms: WaitlistAnswers["roommateTerms"];
  drinking: WaitlistAnswers["drinking"];
  smoking: WaitlistAnswers["smoking"];
  cannabis: WaitlistAnswers["cannabis"];
  completed_at: string | null;
};

const COLUMNS =
  "year, major, budget, areas, study_abroad, sublet_out_terms, sublet_in_terms, roommate_terms, drinking, smoking, cannabis, completed_at";

// Imported lazily so pages still render when the Supabase env vars are missing.
async function supabase() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

// `npm run dev` only: /?preview shows the survey as a signed-in SU student
// without touching Supabase, for design review.
function isPreview() {
  return (
    process.env.NODE_ENV === "development" &&
    new URLSearchParams(window.location.search).has("preview")
  );
}

export async function loadWaitlist(): Promise<WaitlistSession> {
  if (isPreview()) {
    return {
      status: "signed-in",
      userId: "preview",
      email: "preview@g.syr.edu",
      school: "SU",
      answers: EMPTY_ANSWERS,
      completedAt: null,
    };
  }
  const client = await supabase();
  const { data, error } = await client.auth.getUser();
  const user = data.user;
  if (error || !user?.email) return { status: "signed-out" };

  const email = user.email.toLowerCase();
  const school = schoolOfGoogleAccount(email);
  if (!school) return { status: "not-school", email };

  const { data: row, error: rowError } = await client
    .from("waitlist_responses")
    .select(COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle<Row>();
  if (rowError) throw rowError;

  return {
    status: "signed-in",
    userId: user.id,
    email,
    school,
    answers: {
      year: row?.year ?? null,
      major: row?.major ?? null,
      budget: row?.budget ?? null,
      areas: row?.areas ?? null,
      studyAbroad: row?.study_abroad ?? null,
      subletOutTerms: row?.sublet_out_terms ?? null,
      subletInTerms: row?.sublet_in_terms ?? null,
      roommateTerms: row?.roommate_terms ?? null,
      drinking: row?.drinking ?? null,
      smoking: row?.smoking ?? null,
      cannabis: row?.cannabis ?? null,
    },
    completedAt: row?.completed_at ?? null,
  };
}

// Saves every answer so far. The first time all answers are in, completed_at
// is set, which enters the student in the raffle; later edits keep that time.
export async function saveWaitlist(
  session: Extract<WaitlistSession, { status: "signed-in" }>,
  answers: WaitlistAnswers,
): Promise<{ completedAt: string | null }> {
  const completedAt = isComplete(answers)
    ? (session.completedAt ?? new Date().toISOString())
    : null;
  if (isPreview()) return { completedAt };
  const client = await supabase();
  const { error } = await client.from("waitlist_responses").upsert(
    {
      user_id: session.userId,
      email: session.email,
      school: session.school,
      year: answers.year,
      major: answers.major?.trim() || null,
      budget: answers.budget,
      areas: answers.areas,
      study_abroad: answers.studyAbroad,
      sublet_out_terms: answers.subletOutTerms,
      sublet_in_terms: answers.subletInTerms,
      roommate_terms: answers.roommateTerms,
      drinking: answers.drinking,
      smoking: answers.smoking,
      cannabis: answers.cannabis,
      completed_at: completedAt,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return { completedAt };
}
