// Loads the team dashboard. Runs in the browser as the signed-in user; the
// database function public.team_waitlist() refuses anyone not on the team
// list, so this file decides nothing about access.
import type { TeamRow } from "@/lib/rules/team";

export type TeamSession =
  | { status: "signed-out" }
  | { status: "forbidden"; email: string }
  // The SQL in supabase/migrations/20261104030000_team_dashboard.sql hasn't
  // been run yet.
  | { status: "not-set-up"; email: string }
  | { status: "ready"; email: string; rows: TeamRow[]; loadedAt: Date };

async function supabase() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

// `npm run dev` only: /team?preview shows sample accounts without Supabase;
// /team?preview=signed-out and /team?preview=forbidden show those screens.
function previewMode(): string | null {
  if (process.env.NODE_ENV !== "development") return null;
  return new URLSearchParams(window.location.search).get("preview");
}

export async function loadTeam(): Promise<TeamSession> {
  const preview = previewMode();
  if (preview !== null) {
    if (preview === "signed-out") return { status: "signed-out" };
    if (preview === "forbidden")
      return { status: "forbidden", email: "someone@gmail.com" };
    const { previewRows } = await import("./preview");
    return {
      status: "ready",
      email: "preview@g.syr.edu",
      rows: previewRows(new Date()),
      loadedAt: new Date(),
    };
  }

  const client = await supabase();
  const { data, error } = await client.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return { status: "signed-out" };

  const { data: rows, error: rpcError } = await client.rpc("team_waitlist");
  if (rpcError) {
    // 42501 = not on the team list; PGRST202 = function doesn't exist yet.
    if (rpcError.code === "42501") return { status: "forbidden", email };
    if (rpcError.code === "PGRST202") return { status: "not-set-up", email };
    throw rpcError;
  }
  return {
    status: "ready",
    email,
    rows: (rows ?? []) as TeamRow[],
    loadedAt: new Date(),
  };
}

// Signed links to students' private photos, valid for an hour. The storage
// policy only lets team accounts read other students' photos.
export async function teamPhotoUrls(
  paths: string[],
): Promise<Record<string, string>> {
  if (!paths.length || previewMode() !== null) return {};
  const client = await supabase();
  const { data, error } = await client.storage
    .from("waitlist-photos")
    .createSignedUrls(paths, 60 * 60);
  if (error || !data) return {};
  const urls: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) urls[item.path] = item.signedUrl;
  }
  return urls;
}

// Why a delete was refused, in words the team can act on.
export class DeleteRefused extends Error {}

// Deletes a student's account and everything in it. The photo goes first
// through the Storage API (Supabase won't delete a user who owns files),
// then public.team_delete_account() records the deletion and removes the
// account, which cascades to their survey row.
export async function deleteTeamAccount(userId: string): Promise<void> {
  if (previewMode() !== null) return;
  const client = await supabase();

  // Every student's photo lives at this one path; removing a missing file
  // is not an error.
  const { error: photoError } = await client.storage
    .from("waitlist-photos")
    .remove([`${userId}/photo.jpg`]);
  if (photoError) throw photoError;

  const { error } = await client.rpc("team_delete_account", {
    target: userId,
  });
  if (!error) return;
  // PGRST202 = the SQL for this feature hasn't been run yet.
  if (error.code === "PGRST202")
    throw new DeleteRefused(
      "Run 20261104040000_team_delete_account.sql in Supabase first.",
    );
  if (error.hint === "team account")
    throw new DeleteRefused("Team accounts can't be deleted here.");
  if (error.code === "P0002")
    throw new DeleteRefused("That account was already deleted.");
  if (error.code === "55000")
    throw new DeleteRefused(
      "This account still has a file in storage. Remove it in Supabase → Storage, then try again.",
    );
  throw error;
}
