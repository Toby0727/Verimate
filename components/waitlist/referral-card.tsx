"use client";

import { Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { REFERRAL_BOOST } from "@/lib/rules/waitlist";

export function referralLink(code: string): string {
  return `${window.location.origin}/?ref=${code}`;
}

// The student's own code on the done screen, how many friends joined with
// it, and what that adds to their chances.
export function ReferralCard({
  code,
  friends,
}: {
  code: string | null;
  friends: number;
}) {
  if (!code) return null;
  const boost = Math.round(friends * REFERRAL_BOOST * 100);

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(referralLink(code));
      toast.success("Invite link copied");
    } catch {
      toast.error(`Couldn't copy. Your code is ${code}`);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-verified-tint text-verified">
          <Users className="size-4" aria-hidden />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="font-semibold text-[16px]">
            +{Math.round(REFERRAL_BOOST * 100)}% for every friend
          </h2>
          <p className="text-[14px] text-muted-foreground">
            Each SU or ESF student who joins with your code and finishes the
            survey raises your chance to win.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy invite link with code ${code}`}
        className="flex items-center justify-between rounded-xl border border-dashed border-verified/40 bg-verified-tint/50 px-4 py-3 text-left"
      >
        <span className="flex flex-col">
          <span className="text-[12px] text-muted-foreground">
            Your referral code
          </span>
          <span className="font-bold font-mono text-[22px] tracking-[0.2em] text-verified">
            {code}
          </span>
        </span>
        <span className="flex items-center gap-1 font-medium text-[13px]">
          <Copy className="size-4" aria-hidden />
          Copy link
        </span>
      </button>
      <p className="text-[13px]">
        {friends === 0 ? (
          <span className="text-muted-foreground">
            No friends joined yet. Share your link to get a head start.
          </span>
        ) : (
          <span>
            <b>
              {friends} {friends === 1 ? "friend" : "friends"}
            </b>{" "}
            joined with your code ·{" "}
            <b className="text-verified">+{boost}% chance</b>
          </span>
        )}
      </p>
    </section>
  );
}
