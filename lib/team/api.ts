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
