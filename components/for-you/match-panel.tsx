"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { SampleBadge } from "@/components/demo/sample-badge";
import type { Demo } from "@/lib/demo/use-demo";
import { cn } from "@/lib/utils";

// Match score area on a profile. Free users see it blurred.
export function MatchPanel({
  demo,
  targetId,
}: {
  demo: Demo;
  targetId: string;
}) {
  const { world, meId, entitlements, profile } = demo;
  if (!meId || meId === targetId) return null;
  const match = world.matches.find(
    (m) => m.viewerId === meId && m.targetId === targetId,
  );
  const consent =
    profile?.aiMatchConsent &&
    world.profiles.find((p) => p.accountId === targetId)?.aiMatchConsent;

  if (!match || !consent) {
    return (
      <div className="rounded-xl bg-card p-3.5 text-[14px] text-muted-foreground">
        <Sparkles className="mr-1 inline size-4" />
        AI match needs both people to allow matching in their questionnaire.{" "}
        <Link
          href="/me/questionnaire"
          className="font-semibold text-foreground"
        >
          Open questionnaire
        </Link>
      </div>
    );
  }

  const unlocked = entitlements.has("aiFull");
  return (
    <div className="match-glow relative overflow-hidden rounded-xl p-3.5 text-white">
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-1.5 font-semibold text-[15px]">
          Your match
          <SampleBadge />
        </span>
        <span
          className={cn(
            "font-bold text-[22px] tabular-nums",
            !unlocked && "select-none blur-sm",
          )}
          aria-hidden={!unlocked}
        >
          {match.score}%
        </span>
      </div>
      <p
        className={cn(
          "mt-0.5 text-[15px] leading-snug",
          !unlocked && "select-none blur-sm",
        )}
        aria-hidden={!unlocked}
      >
        {match.reasons.join(" ")}
      </p>
      {unlocked ? null : (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10">
          <Link
            href="/me/membership"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-semibold text-foreground text-sm"
          >
            <Lock className="size-4" />
            Members only · See your match
          </Link>
        </div>
      )}
    </div>
  );
}
