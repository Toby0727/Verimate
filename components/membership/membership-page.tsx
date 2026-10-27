"use client";

import { Check, Lock, Star } from "lucide-react";
import { toast } from "sonner";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { SampleBadge } from "@/components/demo/sample-badge";
import { showSampleNotice } from "@/components/demo/sample-notice";
import { AccessGate } from "@/components/shell/access-gate";
import { formatDay } from "@/components/shell/labels";
import { Button } from "@/components/ui/button";
import * as actions from "@/lib/demo/actions";
import { foundingContext, verifiedCount } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { FOUNDING_SEATS, PRICES } from "@/lib/rules/constants";
import {
  ALL_ENTITLEMENTS,
  foundingEligibility,
  foundingSeatsLeft,
} from "@/lib/rules/membership";
import { cn } from "@/lib/utils";
import { GAP_LABELS, PERK_LABELS } from "./founding-copy";

function MembershipContent() {
  const demo = useDemo();
  if (!demo?.meId) return <DemoSkeleton />;
  const { world, now, meId, membership, entitlements } = demo;
  const ctx = foundingContext(world);
  const eligibility = foundingEligibility(world, meId, now, ctx);
  const seatsLeft = foundingSeatsLeft(world, ctx);
  const kind = world.viewAsFree ? "free" : (membership?.kind ?? "free");

  return (
    <div className="flex flex-col gap-5 p-4">
      <section className="flex flex-col gap-1 rounded-xl bg-muted p-4">
        <p className="text-muted-foreground text-xs uppercase">Your plan</p>
        <p className="font-semibold text-lg capitalize">
          {kind === "internal"
            ? "Internal (all features)"
            : kind === "season"
              ? "Season pass"
              : kind}
        </p>
        {kind === "founding" && membership ? (
          <p className="text-sm">
            Free until {formatDay(membership.endsAt)}, then{" "}
            {membership.lifetimeDiscount} for life.
          </p>
        ) : null}
        <p className="text-muted-foreground text-xs">
          Only you can see your plan. Verification is what makes you trusted —
          not paying.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Member features</h2>
        {ALL_ENTITLEMENTS.map((perk) => {
          const on = entitlements.has(perk);
          return (
            <div
              key={perk}
              className="flex items-start gap-3 rounded-xl border p-3"
            >
              {on ? (
                <Check className="mt-0.5 size-4 text-verified" />
              ) : (
                <Lock className="mt-0.5 size-4 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">{PERK_LABELS[perk].title}</p>
                <p className="text-muted-foreground text-xs">
                  {PERK_LABELS[perk].body}
                </p>
              </div>
            </div>
          );
        })}
        <p className="text-muted-foreground text-xs">
          Always free: verification, profiles, browsing, posting and messaging.
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border-2 border-primary/30 p-4">
        <div className="flex items-center gap-2">
          <Star className="size-4 text-primary" />
          <h2 className="font-semibold">Founding members</h2>
          <SampleBadge />
        </div>
        <p className="text-sm">
          The first {FOUNDING_SEATS} eligible students get every member feature
          free until the end of the semester, then 50% off the season pass for
          life, plus a public founding badge.
        </p>
        <p className="text-muted-foreground text-xs">
          {verifiedCount(world)} verified students · {seatsLeft} of{" "}
          {FOUNDING_SEATS} spots left
        </p>
        {eligibility.eligible ? (
          <Button
            onClick={() => {
              const result = actions.claimFounding();
              if (result.eligible) toast.success("Welcome, founding member!");
            }}
          >
            Claim my founding spot
          </Button>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {eligibility.missing.map((gap) => (
              <li key={gap} className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                {GAP_LABELS[gap]}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Plans</h2>
        {[
          {
            id: "season" as const,
            title: "Season pass",
            price: PRICES.season.label,
            note: "Recommended · no auto-renew",
            featured: true,
          },
          {
            id: "monthly" as const,
            title: "Monthly",
            price: PRICES.monthly.label,
            note: "Cancel any time",
            featured: false,
          },
        ].map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => {
              actions.choosePlan();
              showSampleNotice("no payment is taken in this demo");
            }}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 text-left hover:bg-muted",
              plan.featured && "border-primary",
            )}
          >
            <span>
              <span className="block font-medium">{plan.title}</span>
              <span className="block text-muted-foreground text-xs">
                {plan.note}
              </span>
            </span>
            <span className="font-semibold">{plan.price}</span>
          </button>
        ))}
        <p className="text-muted-foreground text-xs">
          Both start with a {PRICES.trialDays}-day free trial.
        </p>
      </section>
    </div>
  );
}

export function MembershipPage() {
  return (
    <AccessGate require="signed-in">
      <MembershipContent />
    </AccessGate>
  );
}
