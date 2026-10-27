import Image from "next/image";
import Link from "next/link";
import { SampleBadge } from "@/components/demo/sample-badge";
import {
  formatMonth,
  housingSummary,
  initials,
} from "@/components/shell/labels";
import { VerifiedMark } from "@/components/shell/verification-badge";
import type { Profile } from "@/lib/rules/types";
import type { Badge } from "@/lib/rules/verification";
import { cn } from "@/lib/utils";

// Photo shapes vary so the two-column feed reads as masonry.
const PHOTO_SHAPES = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square"];

function shapeFor(id: string) {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return PHOTO_SHAPES[sum % PHOTO_SHAPES.length];
}

export function RoommateCard({
  profile,
  badge,
  blurred,
  isMe,
  boosted,
}: {
  profile: Profile;
  badge: Badge;
  blurred: boolean;
  isMe: boolean;
  boosted: boolean;
}) {
  const prompt = blurred
    ? undefined
    : profile.prompts.find((p) => p.answer.trim());
  const tag = isMe ? "You" : boosted ? "Boosted" : null;

  return (
    <Link
      href={`/roommates/${profile.accountId}`}
      className="block overflow-hidden rounded-xl bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          shapeFor(profile.accountId),
        )}
      >
        {profile.photo ? (
          <Image
            src={profile.photo}
            alt=""
            fill
            sizes="(max-width: 520px) 50vw, 260px"
            className={cn("object-cover", blurred && "scale-110 blur-md")}
          />
        ) : null}
        <SampleBadge className="absolute top-2 right-2" />
        {tag ? (
          <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 font-semibold text-[12px]">
            {tag}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 px-2.5 pt-2 pb-2.5">
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate font-semibold text-[15px]">
            {blurred ? initials(profile.displayName) : profile.displayName}
          </span>
          <VerifiedMark badge={badge} />
        </div>
        <p className="text-[14px] text-muted-foreground leading-snug">
          {housingSummary(profile)}
        </p>
        {prompt ? (
          <p className="font-serif font-medium text-[17px] leading-[1.2] tracking-tight">
            “{prompt.answer}”
          </p>
        ) : null}
        <div className="mt-0.5 flex items-baseline justify-between gap-2 text-[14px]">
          <span className="font-semibold tabular-nums">
            ${profile.budgetMin}
            <span className="font-normal text-muted-foreground">
              –{profile.budgetMax}
            </span>
          </span>
          <span className="text-muted-foreground">
            {formatMonth(profile.moveInFrom)}
          </span>
        </div>
      </div>
    </Link>
  );
}
