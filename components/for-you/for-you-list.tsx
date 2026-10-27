"use client";

import { Lock, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { SampleBadge } from "@/components/demo/sample-badge";
import { AccessGate } from "@/components/shell/access-gate";
import { Button, buttonVariants } from "@/components/ui/button";
import * as actions from "@/lib/demo/actions";
import { profileOf } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { WEEKLY_FREE_UNLOCKS } from "@/lib/rules/constants";
import {
  isTopMatch,
  isUnlocked,
  rankedMatches,
  unlocksThisWeek,
} from "@/lib/rules/matching";
import { cn } from "@/lib/utils";

const REFUSALS = {
  "weekly-limit": `You've used your ${WEEKLY_FREE_UNLOCKS} free unlocks this week.`,
  "top-member-only": "Your top matches are for members.",
  "no-consent": "Allow AI matching in your questionnaire first.",
  "not-found": "This match isn't available anymore.",
} as const;

function ForYouContent() {
  const demo = useDemo();
  const router = useRouter();
  if (!demo?.meId) return <DemoSkeleton rows={4} />;
  const { world, now, meId, profile, entitlements } = demo;
  const member = entitlements.has("aiFull");

  if (!profile?.aiMatchConsent || !profile.questionnaire) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <Sparkles className="size-8 text-primary" />
        <p className="font-medium">Get matched by AI</p>
        <p className="text-muted-foreground text-sm">
          Fill in the detailed questionnaire and allow it to be used for
          matching. We'll rank people by how well your habits fit.
        </p>
        <Link href="/me/questionnaire" className={buttonVariants()}>
          Open questionnaire
        </Link>
      </div>
    );
  }

  const ranked = rankedMatches(world, meId, now);
  const used = unlocksThisWeek(world.unlocks, meId, now);
  const strong = ranked.filter((m) => m.score >= 75).length;

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-lg">
          {strong} strong matches for you
        </h2>
        <SampleBadge />
      </div>
      <p className="text-muted-foreground text-sm">
        {member
          ? "Ranked by AI from your questionnaire. You see everyone, with full reasons."
          : `Free: unlock up to ${WEEKLY_FREE_UNLOCKS} people a week (${Math.max(0, WEEKLY_FREE_UNLOCKS - used)} left). Your top matches are for members.`}
      </p>
      {!member ? (
        <Link
          href="/me/membership"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "self-start",
          })}
        >
          See membership
        </Link>
      ) : null}

      {ranked.map((match) => {
        const p = profileOf(world, match.targetId);
        if (!p) return null;
        const top = isTopMatch(ranked, match.targetId);
        const revealed =
          member || isUnlocked(world.unlocks, meId, match.targetId);
        return (
          <div
            key={match.targetId}
            className="flex gap-3 rounded-xl border p-3"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-muted">
              {p.photo ? (
                <Image
                  src={p.photo}
                  alt=""
                  fill
                  sizes="56px"
                  className={cn(
                    "object-cover",
                    !revealed && "scale-110 blur-md",
                  )}
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">
                  {match.score}%
                </span>
                <span
                  className={cn(
                    "truncate font-medium",
                    !revealed && "select-none blur-sm",
                  )}
                >
                  {revealed ? p.displayName : "Hidden name"}
                </span>
              </div>
              <p className="text-sm">{match.oneLiner}</p>
              {member ? (
                <ul className="list-disc pl-4 text-muted-foreground text-xs">
                  {match.reasons.slice(1).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-1">
                {revealed ? (
                  <Link
                    href={`/roommates/${match.targetId}`}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                  >
                    View profile
                  </Link>
                ) : top ? (
                  <Link
                    href="/me/membership"
                    className={buttonVariants({
                      size: "sm",
                      variant: "secondary",
                    })}
                  >
                    <Lock /> Members only
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      const result = actions.unlockMatch(match.targetId);
                      if (!result.ok) {
                        toast.error(REFUSALS[result.reason], {
                          action: {
                            label: "See plans",
                            onClick: () => router.push("/me/membership"),
                          },
                        });
                      }
                    }}
                  >
                    Unlock ({Math.max(0, WEEKLY_FREE_UNLOCKS - used)} of{" "}
                    {WEEKLY_FREE_UNLOCKS} left)
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ForYouList() {
  return (
    <AccessGate require="verified-complete">
      <ForYouContent />
    </AccessGate>
  );
}
