"use client";

import {
  ChevronLeft,
  CigaretteOff,
  GraduationCap,
  Languages,
  MapPin,
  MessageCircle,
  Moon,
  PawPrint,
  Sparkles,
} from "lucide-react";
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
  formatMonth,
  initials,
  labelOf,
  needSentence,
  PETS,
  PROMPTS,
  QUESTIONS,
  SLEEP,
  SMOKING,
  stayLength,
} from "@/components/shell/labels";
import {
  FoundingBadge,
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
        "flex size-11 items-center justify-center rounded-full bg-white text-foreground shadow-sm ring-1 ring-black/5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <MessageCircle className="size-5" />
    </button>
  );
}

// Photo shapes vary so the two columns stagger.
const PHOTO_SHAPES = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[5/4]",
];

function GaugeRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 text-[15px]">
      <span className="flex-1">{label}</span>
      {children}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 px-3.5 py-3">
      <p className="text-[14px] text-muted-foreground">{label}</p>
      <p className="truncate font-bold text-[18px] tabular-nums tracking-tight">
        {children}
      </p>
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

  // How they live: budget and move-in first, then habits on a 3-dot scale.
  const firstName = name.split(" ")[0];
  const q = profile.questionnaire;
  const dots = [
    profile.cleanliness
      ? {
          label: "Tidiness",
          // Listed tidiest first, so more dots means tidier.
          level:
            3 - CLEANLINESS.findIndex((c) => c.value === profile.cleanliness),
          text: labelOf(CLEANLINESS, profile.cleanliness),
        }
      : null,
    ...(q
      ? QUESTIONS.filter((question) =>
          ["guests", "noise", "cooking"].includes(question.key),
        ).map((question) => ({
          label: question.key[0].toUpperCase() + question.key.slice(1),
          level:
            question.options.findIndex((o) => o.value === q[question.key]) + 1,
          text: labelOf(question.options, q[question.key]),
        }))
      : []),
  ].filter((d) => d !== null);

  const details = [
    profile.major
      ? { icon: GraduationCap, label: "Major", value: profile.major }
      : null,
    profile.languages.length > 0
      ? {
          icon: Languages,
          label: "Languages",
          value: profile.languages.join(", "),
        }
      : null,
    building
      ? { icon: MapPin, label: "Building or area", value: building.name }
      : null,
  ].filter((d) => d !== null);

  const habits = [
    { icon: Moon, label: labelOf(SLEEP, profile.sleep) },
    { icon: Sparkles, label: labelOf(CLEANLINESS, profile.cleanliness) },
    { icon: CigaretteOff, label: labelOf(SMOKING, profile.smoking) },
    { icon: PawPrint, label: labelOf(PETS, profile.pets) },
  ];
  const verifiedAt = verificationOf(world, id)?.verifiedAt ?? null;

  return (
    <div className="flex flex-col pb-3">
      {/* First screen: photo with name, what they need, key numbers, habits. */}
      <div className="relative aspect-[10/11] overflow-hidden bg-muted">
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
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <Link
            href="/roommates"
            aria-label="Back"
            className="flex size-9 items-center justify-center rounded-full bg-white/90 text-foreground backdrop-blur outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <SampleBadge />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 pt-16 pb-5 text-white">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[27px] leading-tight tracking-tight">
              {name}
            </h1>
            <VerifiedMark badge={badge} className="size-[18px]" />
          </div>
          <p className="text-[15px] text-white/90">
            {profile.standing} at {profile.school}
            {profile.major && !blurred ? `, ${profile.major}` : ""}
          </p>
        </div>
      </div>

      <div className="relative mx-4 -mt-2 overflow-hidden rounded-xl bg-card">
        <p className="border-b px-3.5 pt-3.5 pb-3 font-bold text-[19px] leading-tight tracking-tight">
          {needSentence(profile, building?.name ?? null)}
        </p>
        <div className="grid grid-cols-3 divide-x">
          <Fact label="Rent">
            ${profile.budgetMin}
            <span className="text-faint">–{profile.budgetMax}</span>
          </Fact>
          <Fact label="Move in">{formatMonth(profile.moveInFrom)}</Fact>
          <Fact label="Stay">
            {stayLength(profile.moveInFrom, profile.moveInTo)}
          </Fact>
        </div>
      </div>

      <div className="mx-4 mt-2 flex flex-wrap gap-1.5">
        {habits.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[14px]"
          >
            <Icon className="size-3.5" />
            {label}
          </span>
        ))}
      </div>

      {blurred ? (
        <div className="mx-4 mt-3 flex flex-col items-center gap-3 rounded-xl bg-card p-4 text-center text-sm">
          Sign up and verify your school email to see photos, full names and
          contact people.
          <Link href="/sign-in" className={buttonVariants()}>
            Sign up
          </Link>
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2.5 px-4">
        <MatchPanel demo={demo} targetId={id} />

        <section className="flex flex-col gap-1.5">
          <h2 className="px-1 text-[14px] text-muted-foreground">
            How {firstName} lives
          </h2>
          <div className="divide-y rounded-xl bg-card">
            <GaugeRow label="Budget">
              <span className="font-semibold tabular-nums">
                ${profile.budgetMin}
                <span className="text-faint">–{profile.budgetMax}</span>
              </span>
            </GaugeRow>
            <GaugeRow label="Move in">
              <span className="font-semibold">
                {formatMonth(profile.moveInFrom)} ·{" "}
                {stayLength(profile.moveInFrom, profile.moveInTo)}
              </span>
            </GaugeRow>
            {profile.sleep ? (
              <GaugeRow label="Sleep">
                <span className="font-semibold">
                  {labelOf(SLEEP, profile.sleep)}
                </span>
              </GaugeRow>
            ) : null}
            {dots.map((d) => (
              <GaugeRow key={d.label} label={d.label}>
                <span
                  role="img"
                  aria-label={`${d.level} of 3`}
                  className="flex gap-1"
                >
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        "size-2 rounded-full",
                        n <= d.level ? "bg-foreground" : "bg-input",
                      )}
                    />
                  ))}
                </span>
                <span className="w-[84px] text-right text-[14px] text-muted-foreground">
                  {d.text}
                </span>
              </GaugeRow>
            ))}
          </div>
        </section>

        {(profile.bio && !blurred) || prompts.length > 0 ? (
          <section className="flex flex-col gap-1.5">
            <h2 className="px-1 text-[14px] text-muted-foreground">
              In {firstName}'s words
            </h2>
            <div className="divide-y rounded-xl bg-card">
              {profile.bio && !blurred ? (
                <div className="px-3.5 py-3">
                  <p className="text-[13px] text-muted-foreground">About me</p>
                  <p className="mt-0.5 text-[15px] leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              ) : null}
              {prompts.map((prompt) => {
                const question = labelOf(PROMPTS, prompt.promptId);
                return (
                  <div key={prompt.promptId} className="relative px-3.5 py-3">
                    <p className="text-[13px] text-muted-foreground">
                      {question}
                    </p>
                    <p className="mt-0.5 pr-11 font-medium font-serif text-[18px] leading-tight">
                      {prompt.answer}
                    </p>
                    {canRequest ? (
                      <ReplyButton
                        label={`Say hi about "${question}"`}
                        className="absolute right-3 bottom-3 size-8 [&_svg]:size-4"
                        onClick={() =>
                          setComposer({ quote: { kind: "prompt", ...prompt } })
                        }
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {photos.length > 0 ? (
          <section className="flex flex-col gap-1.5">
            <h2 className="px-1 text-[14px] text-muted-foreground">
              Photos · {photos.length}
            </h2>
            <div className="flex items-start gap-2">
              {/* Two staggered columns, like the home feed. */}
              {[0, 1].map((column) => (
                <div
                  key={column}
                  className="flex min-w-0 flex-1 flex-col gap-2"
                >
                  {photos
                    .filter((_, i) => i % 2 === column)
                    .map((photo, i) => (
                      <div
                        key={photo}
                        className={cn(
                          "relative overflow-hidden rounded-xl bg-muted",
                          PHOTO_SHAPES[(i * 2 + column) % PHOTO_SHAPES.length],
                        )}
                      >
                        <Image
                          src={photo}
                          alt=""
                          fill
                          sizes="(max-width: 520px) 50vw, 260px"
                          className="object-cover"
                        />
                        {canRequest ? (
                          <ReplyButton
                            label="Say hi about this photo"
                            className="absolute right-2 bottom-2 size-8 [&_svg]:size-4"
                            onClick={() =>
                              setComposer({ quote: { kind: "photo", photo } })
                            }
                          />
                        ) : null}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {details.length > 0 && !blurred ? (
          <div className="divide-y rounded-xl bg-card">
            {details.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-3.5 py-3 text-[15px]"
              >
                <Icon aria-label={label} className="size-4 shrink-0" />
                {value}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-2 px-4 pt-4 pb-2 text-center">
        <p className="text-[13px] text-muted-foreground">
          On Verimate since {formatMonth(account.createdAt)}.
          {verifiedAt ? ` Verified ${formatMonth(verifiedAt)}.` : ""}
        </p>
        {world.memberships.some(
          (m) => m.accountId === id && m.kind === "founding",
        ) ? (
          <FoundingBadge />
        ) : null}
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
        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] z-10 mt-2 px-4">
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
