"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { SampleBadge } from "@/components/demo/sample-badge";
import type { Demo } from "@/lib/demo/use-demo";

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
      <div className="rounded-2xl border border-dashed border-foreground/15 p-3 text-muted-foreground text-sm">
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
    <div className="match-glow relative overflow-hidden rounded-2xl p-4 text-white">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="size-4" />
        <span className="font-semibold text-sm">Your match</span>
        <SampleBadge />
      </div>
      <div
        className={unlocked ? "" : "select-none blur-sm"}
        aria-hidden={!unlocked}
      >
        <p className="font-bold text-3xl tabular-nums">{match.score}%</p>
        <ul className="mt-1 list-disc pl-5 text-[15px] leading-snug">
          {match.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      {unlocked ? null : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/10">
          <Lock className="size-5" />
          <Link
            href="/me/membership"
            className="rounded-full bg-white px-4 py-2 font-semibold text-foreground text-sm"
          >
            Members only · See your match
          </Link>
        </div>
      )}
    </div>
  );
}
