"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as actions from "@/lib/demo/actions";
import { foundingContext } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { FOUNDING_SEATS } from "@/lib/rules/constants";
import { foundingEligibility, foundingSeatsLeft } from "@/lib/rules/membership";

// Pops up once for eligible users after the 50-verified threshold.
export function FoundingInvite() {
  const demo = useDemo();
  const router = useRouter();
  if (!demo?.meId) return null;
  const { world, now, meId } = demo;
  const ctx = foundingContext(world);
  const open =
    !world.foundingInviteDismissed.includes(meId) &&
    foundingEligibility(world, meId, now, ctx).eligible;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && actions.dismissFoundingInvite()}
    >
      <DialogContent>
        <DialogHeader>
          <Star className="size-6 text-primary" />
          <DialogTitle>You're invited to be a founding member</DialogTitle>
          <DialogDescription>
            Verimate just passed 50 verified students. As one of the first{" "}
            {FOUNDING_SEATS}, you get every member feature free until the end of
            the semester, then 50% off for life. {foundingSeatsLeft(world, ctx)}{" "}
            spots left.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => actions.dismissFoundingInvite()}
          >
            Not now
          </Button>
          <Button
            onClick={() => {
              actions.claimFounding();
              actions.dismissFoundingInvite();
              toast.success("Welcome, founding member!");
              router.push("/me/membership");
            }}
          >
            Claim my spot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
