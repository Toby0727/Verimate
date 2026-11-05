// Reads and writes the signed-in student's waitlist row. Runs in the browser;
// RLS on public.waitlist_responses limits each student to their own row.
import type { School } from "@/lib/rules/types";
import { schoolOfGoogleAccount } from "@/lib/rules/verification";
import {
  decodeAbroadPlans,
  EMPTY_ANSWERS,
  encodeAbroadPlans,
  isAwayTerm,
  isComplete,
  type WaitlistAnswers,
} from "@/lib/rules/waitlist";

export type WaitlistSession =
  | { status: "signed-out" }
  | {
      status: "signed-in";
      userId: string;
      email: string;
      // Null for a personal Google account, which isn't verified as a student.
      school: School | null;
      answers: WaitlistAnswers;
      completedAt: string | null;
      // Their own code to share; made by the database on first save.
      referralCode: string | null;
    };

type Row = {
  name: string | null;
  photo_path: string | null;
  referred_by: string | null;
  referral_code: string | null;
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
  sleep: WaitlistAnswers["sleep"];
  cleanliness: WaitlistAnswers["cleanliness"];
  guests: WaitlistAnswers["guests"];
  completed_at: string | null;
};

const COLUMNS =
  "name, photo_path, referred_by, referral_code, gender, year, major, budget, areas, study_abroad, study_abroad_plans, sublet_out_terms, sublet_in_terms, roommate_terms, drinking, smoking, cannabis, greek_life, pets, sleep, cleanliness, guests, completed_at";

// Imported lazily so pages still render when the Supabase env vars are missing.
async function supabase() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

// `npm run dev` only: /?preview shows the survey as a signed-in SU student
// without touching Supabase, for design review; /?preview=landing shows the
// signed-out homepage; /?preview=personal signs in with a personal account.
function isPreview() {
  return (
    process.env.NODE_ENV === "development" &&
    new URLSearchParams(window.location.search).has("preview")
  );
}

export async function loadWaitlist(): Promise<WaitlistSession> {
  if (
    isPreview() &&
    new URLSearchParams(window.location.search).get("preview") === "landing"
  ) {
    return { status: "signed-out" };
  }
  if (isPreview()) {
    const personal =
      new URLSearchParams(window.location.search).get("preview") === "personal";
    return {
      status: "signed-in",
      userId: "preview",
      email: personal ? "preview@gmail.com" : "preview@g.syr.edu",
      school: personal ? null : "SU",
      answers: EMPTY_ANSWERS,
      completedAt: null,
      referralCode: null,
    };
  }
  const client = await supabase();
  const { data, error } = await client.auth.getUser();
  const user = data.user;
  if (error || !user?.email) return { status: "signed-out" };

  const email = user.email.toLowerCase();
  const school = schoolOfGoogleAccount(email);

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
      // Google's name is the starting point until the student saves their own.
      name: row?.name ?? googleName(user.user_metadata),
      photoPath: row?.photo_path ?? null,
      referredBy: row?.referred_by ?? null,
      gender: row?.gender ?? null,
      year: row?.year ?? null,
      major: row?.major ?? null,
      budget: row?.budget ?? null,
      areas: row?.areas ?? null,
      studyAbroad: row?.study_abroad ?? null,
      studyAbroadPlans: decodeAbroadPlans(row?.study_abroad_plans ?? null),
      subletOutTerms: row?.sublet_out_terms ?? null,
      subletInTerms: row?.sublet_in_terms ?? null,
      roommateTerms: row?.roommate_terms ?? null,
      drinking: row?.drinking ?? null,
      smoking: row?.smoking ?? null,
      cannabis: row?.cannabis ?? null,
      greekLife: row?.greek_life ?? null,
      pets: row?.pets ?? null,
      sleep: row?.sleep ?? null,
      cleanliness: row?.cleanliness ?? null,
      guests: row?.guests ?? null,
    },
    completedAt: row?.completed_at ?? null,
    referralCode: row?.referral_code ?? null,
  };
}

function googleName(metadata: Record<string, unknown>): string | null {
  const name = metadata.full_name ?? metadata.name;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

const PHOTO_BUCKET = "waitlist-photos";
// Largest photo we accept from the device; it's shrunk before upload.
export const PHOTO_MAX_BYTES = 20 * 1024 * 1024;
const PHOTO_MAX_SIDE = 1280;

// Redraws the photo as a JPEG of at most 1280px. Besides keeping uploads
// small, this drops EXIF data such as the GPS spot the photo was taken.
async function toJpeg(file: File): Promise<Blob> {
  const image = await createImageBitmap(file);
  const scale = Math.min(
    1,
    PHOTO_MAX_SIDE / Math.max(image.width, image.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("Couldn't read that photo");
  return blob;
}

// Uploads (or replaces) the student's photo and returns its storage path.
// Storage only accepts it once the student has a waitlist row, so one is
// created first if needed.
export async function uploadWaitlistPhoto(
  session: Extract<WaitlistSession, { status: "signed-in" }>,
  file: File,
): Promise<string> {
  const path = `${session.userId}/photo.jpg`;
  const jpeg = await toJpeg(file);
  if (isPreview()) return path;
  const client = await supabase();
  const { error: rowError } = await client
    .from("waitlist_responses")
    .upsert(
      { user_id: session.userId, email: session.email, school: session.school },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  if (rowError) throw rowError;
  const { error } = await client.storage
    .from(PHOTO_BUCKET)
    .upload(path, jpeg, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  return path;
}

// The referral code they typed isn't anyone's (or is their own).
export class InvalidReferralCode extends Error {}

// How many friends finished the survey with this student's code.
export async function loadReferralCount(): Promise<number> {
  if (isPreview()) return 2;
  const client = await supabase();
  const { data, error } = await client.rpc("my_referral_count");
  if (error) throw error;
  return (data as number | null) ?? 0;
}

// A ?ref= code from a friend's link, kept across the Google sign-in
// redirect. Browser storage can be unavailable, so failures are ignored.
const REF_KEY = "verimate-ref";

export function rememberReferral(code: string) {
  try {
    localStorage.setItem(REF_KEY, code);
  } catch {}
}

export function forgetReferral() {
  try {
    localStorage.removeItem(REF_KEY);
  } catch {}
}

export function rememberedReferral(): string | null {
  try {
    return localStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}

// A ?src= tag from the poster or story link they came in on, kept across
// the Google sign-in redirect. The first tag wins, so a later visit from
// another poster doesn't overwrite where they actually found us.
const SRC_KEY = "verimate-src";

export function rememberSource(source: string) {
  try {
    if (!localStorage.getItem(SRC_KEY)) localStorage.setItem(SRC_KEY, source);
  } catch {}
}

export function rememberedSource(): string | null {
  try {
    return localStorage.getItem(SRC_KEY);
  } catch {
    return null;
  }
}

// Short-lived link for showing the student their own saved photo.
export async function waitlistPhotoUrl(path: string): Promise<string | null> {
  if (isPreview()) return null;
  const client = await supabase();
  const { data } = await client.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

// Saves every answer so far. The database stamps completed_at (the raffle
// entry) the first time all answers are in and keeps it on later edits, so
// it's read back rather than sent.
export async function saveWaitlist(
  session: Extract<WaitlistSession, { status: "signed-in" }>,
  answers: WaitlistAnswers,
): Promise<{ completedAt: string | null; referralCode: string | null }> {
  if (isPreview()) {
    return {
      completedAt: isComplete(answers)
        ? (session.completedAt ?? new Date().toISOString())
        : null,
      referralCode: "PRE123",
    };
  }
  const client = await supabase();
  const { data, error } = await client
    .from("waitlist_responses")
    .upsert(
      {
        user_id: session.userId,
        email: session.email,
        school: session.school,
        name: answers.name?.trim() || null,
        photo_path: answers.photoPath,
        referred_by: answers.referredBy,
        gender: answers.gender,
        year: answers.year,
        major: answers.major?.trim() || null,
        budget: answers.budget,
        areas: answers.areas,
        study_abroad: answers.studyAbroad,
        // Saved only once every term has a place; the database rejects
        // half-filled pairs.
        study_abroad_plans:
          isAwayTerm(answers.studyAbroad) &&
          answers.studyAbroadPlans?.every((plan) => plan.place !== null)
            ? encodeAbroadPlans(answers.studyAbroadPlans)
            : null,
        sublet_out_terms: answers.subletOutTerms,
        sublet_in_terms: answers.subletInTerms,
        roommate_terms: answers.roommateTerms,
        drinking: answers.drinking,
        smoking: answers.smoking,
        cannabis: answers.cannabis,
        greek_life: answers.greekLife,
        pets: answers.pets,
        sleep: answers.sleep,
        cleanliness: answers.cleanliness,
        guests: answers.guests,
        // Where they came from (?src= on a poster or story link). The
        // database keeps the first value and ignores later ones.
        source: rememberedSource(),
      },
      { onConflict: "user_id" },
    )
    .select("completed_at, referral_code")
    .single<{ completed_at: string | null; referral_code: string | null }>();
  if (error) {
    if (error.message.includes("invalid referral code")) {
      throw new InvalidReferralCode();
    }
    throw error;
  }
  return { completedAt: data.completed_at, referralCode: data.referral_code };
}
