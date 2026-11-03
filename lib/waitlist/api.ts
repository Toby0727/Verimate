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
  name: string | null;
  photo_path: string | null;
  gender: WaitlistAnswers["gender"];
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
  greek_life: WaitlistAnswers["greekLife"];
  pets: WaitlistAnswers["pets"];
  completed_at: string | null;
};

const COLUMNS =
  "name, photo_path, gender, year, major, budget, areas, study_abroad, sublet_out_terms, sublet_in_terms, roommate_terms, drinking, smoking, cannabis, greek_life, pets, completed_at";

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
      // Google's name is the starting point until the student saves their own.
      name: row?.name ?? googleName(user.user_metadata),
      photoPath: row?.photo_path ?? null,
      gender: row?.gender ?? null,
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
      greekLife: row?.greek_life ?? null,
      pets: row?.pets ?? null,
    },
    completedAt: row?.completed_at ?? null,
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
): Promise<{ completedAt: string | null }> {
  if (isPreview()) {
    return {
      completedAt: isComplete(answers)
        ? (session.completedAt ?? new Date().toISOString())
        : null,
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
        gender: answers.gender,
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
        greek_life: answers.greekLife,
        pets: answers.pets,
      },
      { onConflict: "user_id" },
    )
    .select("completed_at")
    .single<{ completed_at: string | null }>();
  if (error) throw error;
  return { completedAt: data.completed_at };
}
