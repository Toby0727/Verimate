"use client";

// Demo-only gate based on the current sample persona. NOT a security boundary:
// real access control must use server-side auth (getClaims) and RLS.
import { Ban, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { type Demo, useDemo } from "@/lib/demo/use-demo";
import { missingRequiredFields } from "@/lib/rules/profile";
import { badgeFor, isVerificationValid } from "@/lib/rules/verification";

export type AccessRequirement = "signed-in" | "verified-complete" | "admin";

export const ONBOARDING_ROUTES = {
  birthday: "/onboarding/birthday",
  path: "/onboarding/path",
  verify: "/onboarding/path",
  profile: "/onboarding/profile",
  done: "/roommates",
} as const;

function Notice({
  icon: Icon,
  title,
  body,
  href,
  cta,
}: {
  icon: typeof Lock;
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <h2 className="font-semibold text-lg">{title}</h2>
      <p className="max-w-xs text-muted-foreground text-sm">{body}</p>
      {href && cta ? (
        <Link href={href} className={buttonVariants({ className: "mt-2" })}>
          {cta}
        </Link>
      ) : null}
    </div>
  );
}

// Returns a blocking notice, or null when the persona meets the requirement.
export function accessNotice(
  demo: Demo,
  require: AccessRequirement,
): ReactNode | null {
  const { me, verification, profile, now } = demo;

  if (me?.status === "banned") {
    return (
      <Notice
        icon={Ban}
        title="This account was removed"
        body="The Verimate team removed this account after a report. If you think this is a mistake, contact the team."
      />
    );
  }
  if (!me) {
    return (
      <Notice
        icon={Lock}
        title="Sign in to continue"
        body="Verimate is only for verified SU and ESF students."
        href="/sign-in"
        cta="Sign in with Google (Sample)"
      />
    );
  }
  if (me.onboardingStep !== "done") {
    return (
      <Notice
        icon={Lock}
        title="Finish setting up"
        body="Complete your verification and profile to use Verimate."
        href={ONBOARDING_ROUTES[me.onboardingStep]}
        cta="Continue setup"
      />
    );
  }
  if (require === "admin") {
    return me.role === "admin" ? null : (
      <Notice
        icon={ShieldAlert}
        title="No access"
        body="The admin area is only for the Verimate team."
      />
    );
  }
  if (require === "verified-complete") {
    if (!isVerificationValid(verification, now)) {
      const badge = badgeFor(verification, now);
      return badge === "admitted-pending" ? (
        <Notice
          icon={Lock}
          title="Your admission is under review"
          body="The team reviews admission documents within 48 hours. You can browse in the meantime."
        />
      ) : (
        <Notice
          icon={Lock}
          title="Verify your school email"
          body="Your verification has expired. Verify your SU or ESF email again to post and contact people."
          href="/onboarding/verify"
          cta="Verify again"
        />
      );
    }
    if (!profile || missingRequiredFields(profile).length > 0) {
      return (
        <Notice
          icon={Lock}
          title="Complete your profile"
          body="Fill in the required fields so others can see who they're talking to."
          href="/me/profile"
          cta="Complete profile"
        />
      );
    }
  }
  return null;
}

export function AccessGate({
  require,
  children,
}: {
  require: AccessRequirement;
  children: ReactNode;
}) {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton />;
  return accessNotice(demo, require) ?? children;
}

// Banned accounts see only the removal notice anywhere in the app.
export function BanGate({ children }: { children: ReactNode }) {
  const demo = useDemo();
  if (demo?.me?.status === "banned") return accessNotice(demo, "signed-in");
  return children;
}
