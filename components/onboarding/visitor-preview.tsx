"use client";

import Link from "next/link";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { SampleBadge } from "@/components/demo/sample-badge";
import { formatRange, initials } from "@/components/shell/labels";
import { listedProfiles } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { isSubletListed } from "@/lib/rules/sublets";

// Blurred teaser of real-looking content for signed-out visitors.
export function VisitorPreview() {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton rows={2} />;
  const { world, now } = demo;
  const people = listedProfiles(world, null, now).slice(0, 3);
  const sublets = world.sublets
    .filter((s) => isSubletListed(s, now))
    .slice(0, 2);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold">Happening now</h2>
        <SampleBadge />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {people.map((p) => (
          <div
            key={p.accountId}
            className="flex flex-col items-center gap-1 rounded-xl bg-card p-3"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground blur-[2px]">
              {initials(p.displayName)}
            </div>
            <p className="font-medium text-sm">{initials(p.displayName)}</p>
            <p className="text-center text-muted-foreground text-xs">
              ${p.budgetMin}–{p.budgetMax}
            </p>
          </div>
        ))}
      </div>
      {sublets.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 rounded-xl bg-card p-3"
        >
          <div className="size-14 shrink-0 rounded-lg bg-muted blur-[2px]" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{s.title}</p>
            <p className="text-muted-foreground text-xs">
              ${s.rent}/mo · {formatRange(s.startDate, s.endDate)}
            </p>
          </div>
        </div>
      ))}
      <p className="text-center text-muted-foreground text-sm">
        <Link href="/sign-in" className="font-medium text-primary">
          Sign up and verify
        </Link>{" "}
        to see photos, names and contact people.
      </p>
    </section>
  );
}
