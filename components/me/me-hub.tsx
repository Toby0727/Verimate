"use client";

import {
  ChevronRight,
  Eye,
  House,
  IdCard,
  ListChecks,
  type LucideIcon,
  Settings,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { MemberPerks } from "@/components/membership/member-perks";
import { accessNotice } from "@/components/shell/access-gate";
import { formatMonth } from "@/components/shell/labels";
import {
  VerifiedMark,
  verificationLabel,
} from "@/components/shell/verification-badge";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import * as actions from "@/lib/demo/actions";
import { useDemo } from "@/lib/demo/use-demo";
import { missingRequiredFields, shouldAutoPause } from "@/lib/rules/profile";
import { badgeFor } from "@/lib/rules/verification";

function Row({
  href,
  icon: Icon,
  label,
  sub,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  sub?: string;
  value?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3.5 py-3 text-[15px] hover:bg-muted/50"
    >
      <Icon className="size-[18px] shrink-0" />
      <span className="min-w-0 flex-1">
        {label}
        {sub ? (
          <span className="block text-[13px] text-muted-foreground">{sub}</span>
        ) : null}
      </span>
      {value ? <span className="text-muted-foreground">{value}</span> : null}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-2 flex flex-col gap-1.5">
      <h2 className="px-1 text-[14px] text-muted-foreground">{title}</h2>
      <div className="flex flex-col divide-y overflow-hidden rounded-xl bg-card">
        {children}
      </div>
    </section>
  );
}

export function MeHub() {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton />;
  const blocked = accessNotice(demo, "signed-in");
  if (blocked) return blocked;
  const { me, profile, verification, now, membership, isMember, world } = demo;
  if (!me) return null;

  const badge = badgeFor(verification, now);
  const verified =
    badge === "student" || badge === "admitted" || badge === "graduate";
  const autoPaused = shouldAutoPause(me, now);
  const looking = profile?.searchStatus === "active" && !autoPaused;
  const missing = profile ? missingRequiredFields(profile) : ["photo"];
  const planLabel = world.viewAsFree
    ? "Free (viewing as free user)"
    : isMember
      ? membership?.kind === "founding"
        ? "Founding member"
        : membership?.kind === "internal"
          ? "Internal"
          : "Member"
      : "Free";

  return (
    <div className="flex flex-col gap-2 px-4 pt-2 pb-4">
      <div className="flex items-center gap-3 rounded-xl bg-card p-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-muted-foreground">Verification</p>
          <p className="flex items-center gap-1.5 font-bold text-[22px] tracking-tight">
            {verified ? "Verified" : verificationLabel(badge)}
            <VerifiedMark badge={badge} className="size-[18px]" />
          </p>
          <p className="truncate text-[14px] text-muted-foreground">
            {me.displayName}
            {verification?.expiresAt && verified
              ? ` · valid until ${formatMonth(verification.expiresAt)}`
              : ""}
          </p>
        </div>
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
          {profile?.photo ? (
            <Image
              src={profile.photo}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : null}
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

      <Group title="Your profile">
        <Row
          href="/me/profile"
          icon={IdCard}
          label="Edit profile"
          value={
            missing.length > 0 ? `${missing.length} to finish` : "Complete"
          }
        />
        <Row
          href="/me/questionnaire"
          icon={ListChecks}
          label="Detailed questionnaire"
        />
        <div className="flex items-center gap-3 px-3.5 py-3 text-[15px]">
          <Eye className="size-[18px] shrink-0" />
          <span className="min-w-0 flex-1">
            {looking ? "Looking for roommates" : "Paused"}
            <span className="block text-[13px] text-muted-foreground">
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
      </Group>

      <Group title="Account">
        <Row href="/me/sublets" icon={House} label="My sublets" />
        <Row
          href="/me/membership"
          icon={Sparkles}
          label="Membership"
          sub="Only you see your plan"
          value={planLabel}
        />
        <Row href="/me/settings" icon={Settings} label="Settings & privacy" />
      </Group>

      <div className="mt-2">
        <MemberPerks demo={demo} />
      </div>

      <div className="mt-2 flex gap-4 px-1 text-muted-foreground text-xs">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/about-demo">About this demo</Link>
      </div>
    </div>
  );
}
