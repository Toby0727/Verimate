"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { showSampleNotice } from "@/components/demo/sample-notice";
import { QuotePreview } from "@/components/messages/quote-preview";
import { AccessGate } from "@/components/shell/access-gate";
import { formatRange, housingSummary } from "@/components/shell/labels";
import { VerificationBadge } from "@/components/shell/verification-badge";
import { Button } from "@/components/ui/button";
import * as actions from "@/lib/demo/actions";
import { profileOf, subletOf, verificationOf } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { REQUEST_COOLDOWN_AFTER_DELETE_DAYS } from "@/lib/rules/constants";
import { effectiveStatus } from "@/lib/rules/requests";
import { badgeFor } from "@/lib/rules/verification";

type Confirm = "delete" | "block" | null;

function RequestDetailContent({ id }: { id: string }) {
  const demo = useDemo();
  const router = useRouter();
  const [confirm, setConfirm] = useState<Confirm>(null);
  if (!demo) return <DemoSkeleton />;
  const { world, now, meId } = demo;
  const request = world.messageRequests.find(
    (r) => r.id === id && r.toId === meId,
  );
  const status = request ? effectiveStatus(request, now) : null;

  if (!request || status !== "pending") {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center text-sm">
        <p className="font-medium">This request is no longer active</p>
        <p className="text-muted-foreground">
          {status === "expired"
            ? "Requests expire after 14 days without a reply."
            : "It was already accepted, deleted or withdrawn."}
        </p>
        <Link href="/messages" className="text-primary">
          Back to messages
        </Link>
      </div>
    );
  }

  const sender = profileOf(world, request.fromId);
  const sublet =
    request.context.type === "sublet"
      ? subletOf(world, request.context.subletId)
      : undefined;
  const name = sender?.displayName ?? "Someone";

  return (
    <div className="flex flex-col gap-4 p-4">
      <Link
        href={`/roommates/${request.fromId}`}
        className="flex items-center gap-3 rounded-xl border p-3"
      >
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-muted">
          {sender?.photo ? (
            <Image
              src={sender.photo}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{name}</p>
          <VerificationBadge
            badge={badgeFor(verificationOf(world, request.fromId), now)}
          />
          {sender ? (
            <p className="mt-1 text-muted-foreground text-xs">
              ${sender.budgetMin}–{sender.budgetMax}/mo ·{" "}
              {formatRange(sender.moveInFrom, sender.moveInTo)} ·{" "}
              {housingSummary(sender)}
            </p>
          ) : null}
        </div>
      </Link>

      {sublet ? (
        <p className="text-muted-foreground text-sm">
          About your sublet:{" "}
          <span className="text-foreground">{sublet.title}</span>
        </p>
      ) : null}

      {request.context.type === "profile" && request.context.quote ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-muted-foreground text-xs">
            {name} is replying to your{" "}
            {request.context.quote.kind === "photo" ? "photo" : "answer"}
          </p>
          <QuotePreview quote={request.context.quote} />
        </div>
      ) : null}

      <div className="rounded-2xl rounded-tl-sm bg-card p-3 text-sm">
        {request.message}
      </div>

      {confirm ? (
        <div className="flex flex-col gap-3 rounded-xl border p-3 text-sm">
          {confirm === "delete"
            ? `Delete this request? ${name} won't be able to send you another one for ${REQUEST_COOLDOWN_AFTER_DELETE_DAYS} days.`
            : `Block ${name}? You won't see each other anywhere on Verimate.`}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                const result =
                  confirm === "delete"
                    ? actions.deleteRequest(id)
                    : actions.blockFromRequest(id);
                if (result.ok) {
                  toast.success(
                    confirm === "delete"
                      ? "Request deleted."
                      : `${name} is blocked.`,
                  );
                  router.push("/messages");
                }
              }}
            >
              {confirm === "delete" ? "Delete" : "Block"}
            </Button>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            onClick={() => {
              if (actions.acceptRequest(id).ok) {
                showSampleNotice(`an email would tell ${name} you accepted`);
                router.push(`/messages/c-${id}`);
              }
            }}
          >
            Accept and chat
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirm("delete")}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirm("block")}
            >
              Block
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RequestDetail({ id }: { id: string }) {
  return (
    <AccessGate require="signed-in">
      <RequestDetailContent id={id} />
    </AccessGate>
  );
}
