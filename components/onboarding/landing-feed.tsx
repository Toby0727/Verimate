"use client";

import { useEffect, useState } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { RoommateCard } from "@/components/roommates/roommate-card";
import { PageHeader } from "@/components/shell/page-header";
import { listedProfiles, verificationOf } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { badgeFor } from "@/lib/rules/verification";
import { SignInCard } from "./sign-in-card";

// Signed-out home: the roommate feed, with photos hidden by the visitor rule.
// The first scroll, tap or key press blurs it and asks the visitor to sign in.
export function LandingFeed() {
  const demo = useDemo();
  const [gated, setGated] = useState(false);

  useEffect(() => {
    if (gated) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    const gate = () => setGated(true);
    const events = ["wheel", "touchmove", "scroll", "keydown"] as const;
    for (const e of events) window.addEventListener(e, gate, { once: true });
    return () => {
      for (const e of events) window.removeEventListener(e, gate);
    };
  }, [gated]);

  if (!demo) return <DemoSkeleton rows={4} />;
  const { world, now } = demo;
  const people = listedProfiles(world, null, now);

  return (
    // Taps on cards open the sign-in card instead of navigating.
    <div
      onClickCapture={(e) => {
        if (gated) return;
        e.preventDefault();
        e.stopPropagation();
        setGated(true);
      }}
    >
      <PageHeader
        title="Verimate"
        action={
          <span className="shrink-0 text-[14px] text-muted-foreground">
            {people.length} verified
          </span>
        }
      />
      <div className="flex items-start gap-2 px-2.5 pt-1.5 pb-6">
        {[0, 1].map((column) => (
          <div key={column} className="flex min-w-0 flex-1 flex-col gap-2">
            {people
              .filter((_, i) => i % 2 === column)
              .map((p) => (
                <RoommateCard
                  key={p.accountId}
                  profile={p}
                  badge={badgeFor(verificationOf(world, p.accountId), now)}
                  blurred
                  isMe={false}
                  boosted={false}
                />
              ))}
          </div>
        ))}
      </div>

      {gated ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 p-4 backdrop-blur-xl">
          <div className="fade-in-0 zoom-in-95 w-full max-w-[400px] animate-in duration-200">
            <SignInCard />
          </div>
        </div>
      ) : null}
    </div>
  );
}
