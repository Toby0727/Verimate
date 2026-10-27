"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { ONBOARDING_ROUTES } from "@/components/shell/access-gate";
import { buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo/use-demo";
import type { Account } from "@/lib/rules/types";
import { cn } from "@/lib/utils";

const STEPS = ["Birthday", "Path", "Verify", "Profile"] as const;
const ORDER: Record<Account["onboardingStep"], number> = {
  birthday: 0,
  path: 1,
  verify: 2,
  profile: 3,
  done: 4,
};

// Wraps an onboarding page: shows progress and blocks skipping ahead.
export function OnboardingStep({
  step,
  title,
  allowWhenDone = false,
  children,
}: {
  step: 0 | 1 | 2 | 3;
  title: string;
  allowWhenDone?: boolean;
  children: ReactNode;
}) {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton />;
  const { me } = demo;

  let blocked: ReactNode = null;
  if (!me) {
    blocked = (
      <Link href="/sign-in" className={buttonVariants()}>
        Sign in first
      </Link>
    );
  } else if (ORDER[me.onboardingStep] < step) {
    blocked = (
      <Link
        href={ONBOARDING_ROUTES[me.onboardingStep]}
        className={buttonVariants()}
      >
        Go to your current step
      </Link>
    );
  } else if (me.onboardingStep === "done" && !allowWhenDone) {
    blocked = (
      <Link href="/roommates" className={buttonVariants()}>
        You're all set — go to Verimate
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-5 py-6">
      <ol className="flex gap-1.5" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col gap-1">
            <span
              className={cn(
                "h-1 rounded-full",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
            <span
              className={cn(
                "text-[11px]",
                i === step ? "font-medium" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
      <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
      {blocked ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground text-sm">
            {me
              ? "This step isn't available yet."
              : "You need to sign in to continue."}
          </p>
          {blocked}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  return children ? (
    <p role="alert" className="text-destructive text-sm">
      {children}
    </p>
  ) : null;
}
