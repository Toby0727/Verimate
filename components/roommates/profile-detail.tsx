"use client";

import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { SampleBadge } from "@/components/demo/sample-badge";
import { MatchPanel } from "@/components/for-you/match-panel";
import { RequestComposer } from "@/components/messages/request-composer";
import { SafetyMenu } from "@/components/report/safety-menu";
import {
  CLEANLINESS,
  formatDay,
  formatMonth,
  initials,
  labelOf,
  needSentence,
  PETS,
  PROMPTS,
  SLEEP,
  SMOKING,
  stayLength,
} from "@/components/shell/labels";
import {
  FoundingBadge,
  VerificationBadge,
  VerifiedMark,
} from "@/components/shell/verification-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import * as actions from "@/lib/demo/actions";
import {
  accountOf,
  buildingOf,
  isAccountListed,
  profileOf,
  verificationOf,
} from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { profilePhotos } from "@/lib/rules/profile";
import { effectiveStatus } from "@/lib/rules/requests";
import type { RequestQuote } from "@/lib/rules/types";
import { badgeFor } from "@/lib/rules/verification";
import { isBlurredForVisitor, isHiddenFor } from "@/lib/rules/visibility";
import { cn } from "@/lib/utils";

function ReplyButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-white text-foreground shadow-sm ring-1 ring-black/5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <MessageCircle className="size-5" />
    </button>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="truncate font-semibold text-[15px] tabular-nums">
        {children}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3 text-[15px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export function ProfileDetail({ id }: { id: string }) {
  const demo = useDemo();
  // null = closed; otherwise the composer is open, optionally quoting something.
  const [composer, setComposer] = useState<{ quote?: RequestQuote } | null>(
    null,
  );
  const signedIn = Boolean(demo?.meId);

  useEffect(() => {
    if (signedIn) actions.recordProfileView(id);
  }, [id, signedIn]);

  if (!demo) return <DemoSkeleton />;
  const { world, now, meId } = demo;
  const profile = profileOf(world, id);
  const account = accountOf(world, id);
  const visible =
    profile &&
    account &&
    !isHiddenFor(meId, id, world.blocks) &&
    (id === meId || isAccountListed(world, id, now));

  if (!visible) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        This profile isn't available.{" "}
        <Link href="/roommates" className="font-semibold text-foreground">
          Back to roommates
        </Link>
      </div>
    );
  }

  const blurred = isBlurredForVisitor(meId);
  const isMe = id === meId;
  const name = blurred
    ? initials(profile.displayName)
    : (profile.displayName ?? "");
  const badge = badgeFor(verificationOf(world, id), now);
  const building = buildingOf(world, profile.buildingId);
  const request = meId
    ? world.messageRequests.find(
        (r) =>
          (r.fromId === meId && r.toId === id) ||
          (r.fromId === id && r.toId === meId),
      )
    : undefined;
  const conversation = meId
    ? world.conversations.find(
        (c) => c.participantIds.includes(meId) && c.participantIds.includes(id),
      )
    : undefined;
  const requestStatus = request ? effectiveStatus(request, now) : null;
  const canRequest =
    !blurred && !isMe && !conversation && requestStatus !== "pending";

  const [heroPhoto, ...morePhotos] = profilePhotos(profile);
  // Prompts picked but not answered yet aren't shown.
  const prompts = blurred ? [] : profile.prompts.filter((p) => p.answer.trim());
  const photos = blurred ? [] : morePhotos;

  // Prompts and the remaining photos alternate, Hinge style.
  const sections: ReactNode[] = [];
  for (let i = 0; i < Math.max(prompts.length, photos.length); i++) {
    const prompt = prompts[i];
    const photo = photos[i];
    if (prompt) {
      const question = labelOf(PROMPTS, prompt.promptId);
      sections.push(
        <div
          key={`prompt-${prompt.promptId}`}
          className="relative rounded-2xl bg-card px-4 pt-4 pb-5"
        >
          <p className="pr-12 font-semibold text-[13px]">{question}</p>
          <p className="mt-1.5 pr-10 font-serif text-[22px] leading-tight">
            {prompt.answer}
          </p>
          {canRequest ? (
            <ReplyButton
              label={`Say hi about "${question}"`}
              className="absolute right-3 bottom-3"
              onClick={() =>
                setComposer({ quote: { kind: "prompt", ...prompt } })
              }
            />
          ) : null}
        </div>,
      );
    }
    if (photo) {
      sections.push(
        <div
          key={`photo-${photo}`}
          className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
        >
          <Image
            src={photo}
            alt=""
            fill
            sizes="(max-width: 520px) 100vw, 520px"
            className="object-cover"
          />
          {canRequest ? (
            <ReplyButton
              label="Say hi about this photo"
              className="absolute right-3 bottom-3"
              onClick={() => setComposer({ quote: { kind: "photo", photo } })}
            />
          ) : null}
        </div>,
      );
    }
  }

  const details = [
    profile.major ? { label: "Major", value: profile.major } : null,
    profile.languages.length > 0
      ? { label: "Languages", value: profile.languages.join(", ") }
      : null,
    building ? { label: "Building or area", value: building.name } : null,
  ].filter((d) => d !== null);

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* First screen: photo, then what they need, then habits. */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
        {heroPhoto ? (
          <Image
            src={heroPhoto}
            alt=""
            fill
            priority
            sizes="(max-width: 520px) 100vw, 520px"
            className={cn("object-cover", blurred && "scale-110 blur-lg")}
          />
        ) : null}
        <SampleBadge className="absolute top-3 left-3" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pt-16 pb-4 text-white">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-[26px] leading-tight tracking-tight">
              {name}
            </h2>
            <VerifiedMark
              badge={badge}
              className="size-6 rounded-full bg-white p-0.5"
            />
          </div>
          <p className="text-[15px] text-white/90">
            {profile.standing} at {profile.school}
            {profile.major && !blurred ? `, ${profile.major}` : ""}
          </p>
        </div>
        {canRequest && heroPhoto ? (
          <ReplyButton
            label="Say hi about this photo"
            className="absolute right-3 bottom-4"
            onClick={() =>
              setComposer({ quote: { kind: "photo", photo: heroPhoto } })
            }
          />
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl bg-card">
        <p className="border-b px-4 py-3 font-semibold text-[17px] leading-snug">
          {needSentence(profile, building?.name ?? null)}
        </p>
        <div className="grid grid-cols-3 divide-x">
          <Fact label="Rent">
            ${profile.budgetMin}
            <span className="font-normal text-muted-foreground">
              –{profile.budgetMax}
            </span>
          </Fact>
          <Fact label="Move in">{formatMonth(profile.moveInFrom)}</Fact>
          <Fact label="Stay">
            {stayLength(profile.moveInFrom, profile.moveInTo)}
          </Fact>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          labelOf(SLEEP, profile.sleep),
          labelOf(CLEANLINESS, profile.cleanliness),
          labelOf(SMOKING, profile.smoking),
          labelOf(PETS, profile.pets),
        ].map((habit) => (
          <span
            key={habit}
            className="rounded-full bg-card px-3 py-1.5 text-[13px]"
          >
            {habit}
          </span>
        ))}
      </div>

      {blurred ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-4 text-center text-sm">
          Sign up and verify your school email to see photos, full names and
          contact people.
          <Link href="/sign-in" className={buttonVariants()}>
            Sign up
          </Link>
        </div>
      ) : null}

      <MatchPanel demo={demo} targetId={id} />

      {profile.bio && !blurred ? (
        <div className="rounded-2xl bg-card px-4 pt-4 pb-5">
          <p className="font-semibold text-[13px]">About me</p>
          <p className="mt-1.5 text-[15px] leading-relaxed">{profile.bio}</p>
        </div>
      ) : null}

      {sections}

      {details.length > 0 && !blurred ? (
        <div className="divide-y rounded-2xl bg-card">
          {details.map((d) => (
            <Row key={d.label} label={d.label} value={d.value} />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <div className="flex flex-wrap justify-center gap-1">
          <VerificationBadge badge={badge} />
          {world.memberships.some(
            (m) => m.accountId === id && m.kind === "founding",
          ) ? (
            <FoundingBadge />
          ) : null}
        </div>
        <p className="text-[13px] text-muted-foreground">
          On Verimate since {formatDay(account.createdAt)}
        </p>
        {meId && !isMe ? (
          <SafetyMenu
            personId={id}
            personName={name}
            reportTarget={{ type: "account", id }}
            reportLabel={name}
            afterBlockHref="/roommates"
          />
        ) : null}
      </div>

      {/* Main action stays above the tab bar while scrolling. */}
      {blurred ? null : (
        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] z-10">
          {isMe ? (
            <Link
              href="/me/profile"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "w-full shadow-sm",
              )}
            >
              Edit your profile
            </Link>
          ) : conversation ? (
            <Link
              href={`/messages/${conversation.id}`}
              className={cn(buttonVariants({ size: "lg" }), "w-full shadow-sm")}
            >
              Open chat
            </Link>
          ) : requestStatus === "pending" && request?.fromId === meId ? (
            <Button
              disabled
              size="lg"
              variant="outline"
              className="w-full text-muted-foreground shadow-sm disabled:opacity-100"
            >
              Waiting for reply
            </Button>
          ) : requestStatus === "pending" && request ? (
            <Link
              href={`/messages/requests/${request.id}`}
              className={cn(buttonVariants({ size: "lg" }), "w-full shadow-sm")}
            >
              Respond to their request
            </Link>
          ) : (
            <Button
              size="lg"
              className="w-full shadow-sm"
              onClick={() => setComposer({})}
            >
              Say hi
            </Button>
          )}
        </div>
      )}

      {meId && !isMe ? (
        <RequestComposer
          open={composer !== null}
          onOpenChange={(open) => {
            if (!open) setComposer(null);
          }}
          toId={id}
          toName={name}
          context={{ type: "profile" }}
          quote={composer?.quote}
        />
      ) : null}
    </div>
  );
}
