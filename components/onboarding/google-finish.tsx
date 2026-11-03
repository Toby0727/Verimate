"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { ONBOARDING_ROUTES } from "@/components/shell/access-gate";
import * as actions from "@/lib/demo/actions";

// Runs after /auth/callback has set the Google session: copies the real name
// and email into the sample world, then continues onboarding.
export function GoogleFinish() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const { data, error } = await createClient().auth.getUser();
      if (cancelled) return;
      const user = data.user;
      if (error || !user?.email) {
        router.replace("/auth/error");
        return;
      }
      const meta = user.user_metadata;
      const { step, verifiedSchool } = actions.startGoogleUser({
        googleEmail: user.email,
        displayName: meta.full_name ?? meta.name ?? user.email.split("@")[0],
      });
      if (verifiedSchool) {
        toast.success(
          `Your ${verifiedSchool} Google account verified you as a student.`,
        );
      }
      router.replace(ONBOARDING_ROUTES[step]);
    })().catch(() => {
      if (!cancelled) router.replace("/auth/error");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return <DemoSkeleton />;
}
