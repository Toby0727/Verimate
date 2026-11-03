"use client";

import { toast } from "sonner";

// Sends the browser to Google. Supabase brings it back to /auth/callback.
// The client is imported lazily so the rest of the demo still works when the
// Supabase env vars are missing.
export async function signInWithGoogle(): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Students often have both a personal and a school Google account;
        // always let them pick, since the school one verifies them.
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error(error);
    toast.error("Google sign-in isn't available right now. Try again later.");
  }
}

// Clears the real Google session, if there is one.
export async function signOutOfGoogle(): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signOut();
  } catch (error) {
    console.error(error);
  }
}
