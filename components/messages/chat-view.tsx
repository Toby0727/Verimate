"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { SampleBadge } from "@/components/demo/sample-badge";
import { AccessGate } from "@/components/shell/access-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as actions from "@/lib/demo/actions";
import {
  conversationOf,
  otherParticipant,
  profileOf,
  subletOf,
} from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { MIN_AGE } from "@/lib/rules/constants";
import { ageOn } from "@/lib/rules/verification";
import { isHiddenFor } from "@/lib/rules/visibility";
import { cn } from "@/lib/utils";

const TIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function ChatContent({ id }: { id: string }) {
  const demo = useDemo();
  const [draft, setDraft] = useState("");
  if (!demo?.meId) return <DemoSkeleton />;
  const { world, now, meId, me } = demo;
  const conversation = conversationOf(world, id);
  const otherId = conversation
    ? otherParticipant(conversation.participantIds, meId)
    : null;

  if (
    !conversation ||
    !otherId ||
    !conversation.participantIds.includes(meId) ||
    isHiddenFor(meId, otherId, world.blocks)
  ) {
    return (
      <p className="p-8 text-center text-muted-foreground text-sm">
        This chat isn't available.{" "}
        <Link href="/messages" className="text-primary">
          Back to messages
        </Link>
      </p>
    );
  }

  const other = profileOf(world, otherId);
  const request = world.messageRequests.find(
    (r) => r.id === conversation.requestId,
  );
  const sublet =
    request?.context.type === "sublet"
      ? subletOf(world, request.context.subletId)
      : undefined;
  const messages = world.messages
    .filter((m) => m.conversationId === id)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  const isMinor = me?.birthDate ? ageOn(me.birthDate, now) < MIN_AGE : false;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-2 p-4">
        <Link href={`/roommates/${otherId}`} className="font-semibold">
          {other?.displayName ?? "Someone"}{" "}
          <SampleBadge className="ml-1 align-middle" />
        </Link>
        {sublet ? (
          <Link
            href={`/sublets/${sublet.id}`}
            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
          >
            About: {sublet.title}
          </Link>
        ) : null}
        <div className="flex gap-2 rounded-xl bg-verified-tint p-3 text-sm text-verified">
          <ShieldCheck className="size-4 shrink-0" />
          <span>
            Never pay before you've seen the place in person. Verimate never
            asks for deposits.
          </span>
        </div>
        {isMinor ? (
          <div className="flex gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 p-3 text-amber-900 text-sm">
            <ShieldAlert className="size-4 shrink-0" />
            <span>
              You're under 18. Meet only in public places, bring a parent or
              friend to viewings, and never share your address or pay anyone.
            </span>
          </div>
        ) : null}
      </div>

      <ol className="flex flex-1 flex-col gap-2 px-4 pb-4">
        {messages.map((m) => {
          const mine = m.senderId === meId;
          return (
            <li
              key={m.id}
              className={cn(
                "flex flex-col gap-1",
                mine ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  mine
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted",
                )}
              >
                {m.body}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {TIME.format(new Date(m.sentAt))}
              </span>
              {m.fraudSignals.length > 0 ? (
                <div
                  role="note"
                  className="flex max-w-[85%] gap-2 rounded-xl border border-amber-300 bg-amber-50 p-2 text-amber-900 text-xs"
                >
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>
                    {m.fraudSignals.includes("payment")
                      ? "This message mentions a payment. Don't send money before you've seen the place and signed paperwork."
                      : "This message moves the chat off Verimate. Scammers often do this — keep talking here until you trust them."}
                  </span>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <form
        className="sticky bottom-16 flex gap-2 border-t bg-background p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (actions.sendMessage(id, draft).ok) setDraft("");
        }}
      >
        <Input
          aria-label="Message"
          placeholder="Message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" disabled={!draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}

export function ChatView({ id }: { id: string }) {
  return (
    <AccessGate require="signed-in">
      <ChatContent id={id} />
    </AccessGate>
  );
}
