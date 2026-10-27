"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { SampleBadge } from "@/components/demo/sample-badge";
import { RequestComposer } from "@/components/messages/request-composer";
import { SafetyMenu } from "@/components/report/safety-menu";
import {
  formatDay,
  formatRange,
  labelOf,
  ROOM_TYPES,
} from "@/components/shell/labels";
import { VerificationBadge } from "@/components/shell/verification-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  buildingOf,
  profileOf,
  subletOf,
  verificationOf,
} from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { isSubletListed } from "@/lib/rules/sublets";
import { badgeFor } from "@/lib/rules/verification";
import {
  canSeeExactAddress,
  isBlurredForVisitor,
  isHiddenFor,
} from "@/lib/rules/visibility";
import { cn } from "@/lib/utils";
import { LeaseBadge } from "./sublet-card";

export function SubletDetail({ id }: { id: string }) {
  const demo = useDemo();
  const [composerOpen, setComposerOpen] = useState(false);
  if (!demo) return <DemoSkeleton />;
  const { world, now, meId } = demo;
  const sublet = subletOf(world, id);
  const isAuthor = sublet?.authorId === meId;

  if (
    !sublet ||
    isHiddenFor(meId, sublet.authorId, world.blocks) ||
    (!isAuthor && !isSubletListed(sublet, now))
  ) {
    return (
      <p className="p-8 text-center text-muted-foreground text-sm">
        This sublet isn't available anymore.{" "}
        <Link href="/sublets" className="text-primary">
          Back to sublets
        </Link>
      </p>
    );
  }

  const author = profileOf(world, sublet.authorId);
  const blurred = isBlurredForVisitor(meId);
  const location =
    buildingOf(world, sublet.buildingId)?.name ?? sublet.area ?? "Syracuse";
  const showAddress = canSeeExactAddress(meId, sublet, world.conversations);
  const conversation = meId
    ? world.conversations.find(
        (c) =>
          c.participantIds.includes(meId) &&
          c.participantIds.includes(sublet.authorId),
      )
    : undefined;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex snap-x gap-1 overflow-x-auto">
        {sublet.photos.map((src) => (
          <div
            key={src}
            className="relative aspect-[4/3] w-full shrink-0 snap-center bg-muted"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="520px"
              className={cn("object-cover", blurred && "blur-md")}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4">
        <div className="flex items-start gap-2">
          <h2 className="flex-1 font-semibold text-xl">{sublet.title}</h2>
          <SampleBadge className="mt-1.5" />
        </div>
        <p>
          <span className="font-semibold text-lg">${sublet.rent}</span>
          <span className="text-muted-foreground">/mo</span>
        </p>
        <LeaseBadge status={sublet.lease.status} />

        <div className="flex items-start gap-2 rounded-xl bg-muted p-3 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          {showAddress && sublet.exactAddress ? (
            <span>{sublet.exactAddress}</span>
          ) : (
            <span>
              {location}
              <span className="block text-muted-foreground text-xs">
                Exact address shown after you connect with the poster.
              </span>
            </span>
          )}
        </div>

        <div className="divide-y rounded-xl border px-3 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Dates</span>
            {formatRange(sublet.startDate, sublet.endDate)}
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Room</span>
            {labelOf(ROOM_TYPES, sublet.roomType)}
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Furnished</span>
            {sublet.furnished ? "Yes" : "No"}
          </div>
          <div className="flex justify-between gap-4 py-2">
            <span className="text-muted-foreground">Roommates</span>
            <span className="text-right">{sublet.roommatesInfo}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Posted</span>
            {formatDay(sublet.createdAt)}
          </div>
        </div>

        {sublet.description ? (
          <p className="text-sm">{sublet.description}</p>
        ) : null}

        {author ? (
          <Link
            href={`/roommates/${sublet.authorId}`}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            <div className="relative size-10 overflow-hidden rounded-full bg-muted">
              {author.photo ? (
                <Image
                  src={author.photo}
                  alt=""
                  fill
                  sizes="40px"
                  className={cn("object-cover", blurred && "blur-md")}
                />
              ) : null}
            </div>
            <div>
              <p className="font-medium text-sm">
                Posted by {blurred ? "a verified student" : author.displayName}
              </p>
              <VerificationBadge
                badge={badgeFor(verificationOf(world, sublet.authorId), now)}
              />
            </div>
          </Link>
        ) : null}

        {blurred ? (
          <Link href="/sign-in" className={buttonVariants()}>
            Sign up to contact the poster
          </Link>
        ) : isAuthor ? (
          <Link
            href="/me/sublets"
            className={buttonVariants({ variant: "outline" })}
          >
            Manage your sublet
          </Link>
        ) : conversation ? (
          <Link
            href={`/messages/${conversation.id}`}
            className={buttonVariants()}
          >
            Open chat
          </Link>
        ) : (
          <Button onClick={() => setComposerOpen(true)}>Contact poster</Button>
        )}

        {meId && !isAuthor ? (
          <>
            <SafetyMenu
              personId={sublet.authorId}
              personName={author?.displayName ?? "this person"}
              reportTarget={{ type: "sublet", id: sublet.id }}
              reportLabel="this sublet"
              afterBlockHref="/sublets"
            />
            <RequestComposer
              open={composerOpen}
              onOpenChange={setComposerOpen}
              toId={sublet.authorId}
              toName={author?.displayName ?? "the poster"}
              context={{ type: "sublet", subletId: sublet.id }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
