"use client";

import { useRouter } from "next/navigation";
import { SampleBadge } from "@/components/demo/sample-badge";
import { Button } from "@/components/ui/button";
import * as actions from "@/lib/demo/actions";
import { PERSONAS } from "@/lib/demo/personas";

const QUICK = [
  "student-free",
  "admitted-17",
  "member-internal",
  "admin",
] as const;

export function SignInCard() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl bg-card p-5">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-lg">Welcome to Verimate</h2>
          <SampleBadge />
        </div>
        <p className="text-muted-foreground text-sm">
          Sign in with your Google account. You'll verify your SU or ESF email
          next — it's only used to confirm you're a student.
        </p>
        <Button
          size="lg"
          onClick={() => {
            actions.startNewUser();
            router.push("/onboarding/birthday");
          }}
        >
          Continue with Google (Sample)
        </Button>
        <p className="text-muted-foreground text-xs">
          Sample sign-in: no Google account is connected. You'll start as a
          brand-new user.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-muted-foreground text-xs uppercase">
          Or jump in as a sample persona
        </h3>
        {QUICK.map((id) => {
          const persona = PERSONAS.find((p) => p.id === id);
          if (!persona) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                actions.switchPersona(id);
                router.push(id === "admin" ? "/admin" : "/roommates");
              }}
              className="rounded-lg border p-3 text-left hover:bg-muted"
            >
              <span className="block font-medium text-sm">{persona.label}</span>
              <span className="block text-muted-foreground text-xs">
                {persona.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
