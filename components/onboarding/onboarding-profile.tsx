"use client";

import { useRouter } from "next/navigation";
import { RequiredProfileForm } from "@/components/profile/required-profile-form";
import { useDemo } from "@/lib/demo/use-demo";

export function OnboardingProfile() {
  const router = useRouter();
  const demo = useDemo();

  return (
    <>
      <p className="text-muted-foreground text-sm">
        These are required so others know who they're talking to. You can add
        more detail later from Me.
      </p>
      <RequiredProfileForm
        initial={demo?.profile}
        submitLabel="Finish and find roommates"
        onSaved={() => router.push("/roommates")}
      />
    </>
  );
}
