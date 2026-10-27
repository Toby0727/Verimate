"use client";

import { Bell, Eye, Lock, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { SampleBadge } from "@/components/demo/sample-badge";
import { showSampleNotice } from "@/components/demo/sample-notice";
import { formatDay } from "@/components/shell/labels";
import { Button, buttonVariants } from "@/components/ui/button";
import * as actions from "@/lib/demo/actions";
import { profileOf } from "@/lib/demo/selectors";
import type { Demo } from "@/lib/demo/use-demo";
import { isHiddenFor } from "@/lib/rules/visibility";

export function MemberPerks({ demo }: { demo: Demo }) {
  const { world, now, meId, profile, entitlements } = demo;
  if (!meId) return null;

  if (entitlements.size === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed p-3">
        <Lock className="size-4 text-muted-foreground" />
        <p className="flex-1 text-sm">
          Who viewed you, alerts and profile boost are member features.
        </p>
        <Link
          href="/me/membership"
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          See plans
        </Link>
      </div>
    );
  }

  const viewers = world.profileViews
    .filter(
      (v) =>
        v.targetId === meId && !isHiddenFor(meId, v.viewerId, world.blocks),
    )
    .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt));
  const alerts = world.alerts.filter((a) => a.accountId === meId);
  const boosted = profile?.boostedUntil && new Date(profile.boostedUntil) > now;

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-2 rounded-xl border p-3">
        <div className="flex items-center gap-2">
          <Eye className="size-4" />
          <h3 className="font-medium text-sm">Who viewed you</h3>
          <SampleBadge />
        </div>
        {viewers.length === 0 ? (
          <p className="text-muted-foreground text-sm">No views yet.</p>
        ) : null}
        {viewers.map((v) => {
          const p = profileOf(world, v.viewerId);
          return (
            <Link
              key={`${v.viewerId}-${v.viewedAt}`}
              href={`/roommates/${v.viewerId}`}
              className="flex items-center gap-2 text-sm"
            >
              <div className="relative size-7 overflow-hidden rounded-full bg-muted">
                {p?.photo ? (
                  <Image
                    src={p.photo}
                    alt=""
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <span className="flex-1">{p?.displayName ?? "Someone"}</span>
              <span className="text-muted-foreground text-xs">
                {formatDay(v.viewedAt)}
              </span>
            </Link>
          );
        })}
      </section>

      <section className="flex flex-col gap-2 rounded-xl border p-3">
        <div className="flex items-center gap-2">
          <Bell className="size-4" />
          <h3 className="font-medium text-sm">New match alerts</h3>
          <SampleBadge />
        </div>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            We'll email you when someone new fits.
          </p>
        ) : null}
        {alerts.map((a) => (
          <Link
            key={a.id}
            href={a.href}
            onClick={() =>
              showSampleNotice("this alert would also arrive by email")
            }
            className="text-sm hover:underline"
          >
            {a.text}
          </Link>
        ))}
      </section>

      <section className="flex items-center gap-3 rounded-xl border p-3">
        <Rocket className="size-4" />
        <p className="flex-1 text-sm">
          {boosted
            ? `Boosted until ${formatDay(profile?.boostedUntil ?? null)} — you show up first.`
            : "Boost your profile to the top of the list for 7 days."}
        </p>
        {!boosted ? (
          <Button
            size="sm"
            onClick={() => {
              if (actions.boostProfile().ok)
                toast.success("Your profile is boosted for 7 days.");
            }}
          >
            Boost
          </Button>
        ) : null}
      </section>
    </div>
  );
}
