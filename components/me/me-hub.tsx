"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { MemberPerks } from "@/components/membership/member-perks";
import { accessNotice } from "@/components/shell/access-gate";
import { VerificationBadge } from "@/components/shell/verification-badge";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import * as actions from "@/lib/demo/actions";
import { useDemo } from "@/lib/demo/use-demo";
import { missingRequiredFields, shouldAutoPause } from "@/lib/rules/profile";
import { badgeFor } from "@/lib/rules/verification";

const LINKS = [
  { href: "/me/profile", label: "Edit profile" },
  { href: "/me/questionnaire", label: "Detailed questionnaire" },
  { href: "/me/sublets", label: "My sublets" },
  { href: "/me/membership", label: "Membership" },
  { href: "/me/settings", label: "Settings & privacy" },
];

export function MeHub() {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton />;
  const blocked = accessNotice(demo, "signed-in");
  if (blocked) return blocked;
  const { me, profile, verification, now, membership, isMember, world } = demo;
  if (!me) return null;

  const badge = badgeFor(verification, now);
  const autoPaused = shouldAutoPause(me, now);
  const looking = profile?.searchStatus === "active" && !autoPaused;
  const missing = profile ? missingRequiredFields(profile) : ["photo"];
  const planLabel = world.viewAsFree
    ? "Free (viewing as free user)"
    : isMember
      ? membership?.kind === "founding"
        ? "Founding member"
        : membership?.kind === "internal"
          ? "Internal · all features"
          : "Member"
      : "Free";

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="relative size-16 overflow-hidden rounded-full bg-muted">
          {profile?.photo ? (
            <Image
              src={profile.photo}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-lg">{me.displayName}</p>
          <VerificationBadge badge={badge} />
          <p className="text-muted-foreground text-xs">
            Plan: {planLabel} · only you see this
          </p>
        </div>
      </div>

      {badge === "expired" ? (
        <Link href="/onboarding/verify" className={buttonVariants()}>
          Verify your school email again
        </Link>
      ) : null}
      {missing.length > 0 ? (
        <Link
          href="/me/profile"
          className={buttonVariants({ variant: "outline" })}
        >
          Finish your profile to appear in the list
        </Link>
      ) : null}

      <div className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
        <span>
          <span className="font-medium">
            {looking ? "Looking for roommates" : "Paused"}
          </span>
          <span className="block text-muted-foreground text-xs">
            {autoPaused
              ? "Paused after 30 days of inactivity. Turn back on to show up again."
              : looking
                ? "You appear in lists and For You."
                : "You're hidden from lists. Existing chats stay."}
          </span>
        </span>
        <Switch
          aria-label="Looking for roommates"
          checked={looking}
          onCheckedChange={(checked) =>
            actions.setSearchStatus(checked ? "active" : "paused")
          }
        />
      </div>

      <nav className="flex flex-col divide-y rounded-xl border">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center justify-between p-3 text-sm hover:bg-muted"
          >
            {l.label}
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </nav>

      <MemberPerks demo={demo} />

      <div className="flex gap-4 text-muted-foreground text-xs">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/about-demo">About this demo</Link>
      </div>
    </div>
  );
}
