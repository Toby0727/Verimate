"use client";

import Link from "next/link";
import { toast } from "sonner";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { AccessGate } from "@/components/shell/access-gate";
import { Button, buttonVariants } from "@/components/ui/button";
import * as actions from "@/lib/demo/actions";
import { useDemo } from "@/lib/demo/use-demo";
import { SUBLET_CONFIRM_GRACE_DAYS } from "@/lib/rules/constants";
import { subletStatusAt } from "@/lib/rules/sublets";
import { LeaseBadge } from "./sublet-card";

const STATUS = {
  active: "Live",
  stale: "Needs your confirmation",
  subleased: "Subleased",
  expired: "Expired",
  removed: "Removed by the team",
} as const;

function MySubletsContent() {
  const demo = useDemo();
  if (!demo?.meId) return <DemoSkeleton />;
  const { world, now, meId } = demo;
  const mine = world.sublets.filter((s) => s.authorId === meId);

  return (
    <div className="flex flex-col gap-3 p-4">
      <Link href="/sublets/new" className={buttonVariants()}>
        Post a sublet
      </Link>
      {mine.length === 0 ? (
        <p className="p-6 text-center text-muted-foreground text-sm">
          You haven't posted a sublet yet.
        </p>
      ) : null}
      {mine.map((s) => {
        const status = subletStatusAt(s, now);
        return (
          <div
            key={s.id}
            className="flex flex-col gap-2 rounded-xl bg-card p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <Link href={`/sublets/${s.id}`} className="truncate font-medium">
                {s.title}
              </Link>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">
                {STATUS[status]}
              </span>
            </div>
            <LeaseBadge status={s.lease.status} />
            {s.lease.status === "rejected" ? (
              <p className="text-destructive text-xs">
                The team couldn't verify the lease you uploaded.
              </p>
            ) : null}
            {status === "stale" ? (
              <div className="flex flex-col gap-2 rounded-lg bg-amber-50 p-2 text-amber-900 text-sm">
                Still available? Confirm within {SUBLET_CONFIRM_GRACE_DAYS} days
                or the post comes down automatically.
                <Button
                  size="sm"
                  className="self-start"
                  onClick={() => {
                    actions.confirmStillAvailable(s.id);
                    toast.success("Thanks — your post stays up.");
                  }}
                >
                  Yes, still available
                </Button>
              </div>
            ) : null}
            {status === "active" || status === "stale" ? (
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => {
                  actions.markSubleased(s.id);
                  toast.success("Marked as subleased. It's no longer listed.");
                }}
              >
                Mark as subleased
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function MySublets() {
  return (
    <AccessGate require="signed-in">
      <MySubletsContent />
    </AccessGate>
  );
}
