"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { PageHeader } from "@/components/shell/page-header";
import {
  buildingOf,
  listedProfiles,
  verificationOf,
} from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { badgeFor, isVerificationValid } from "@/lib/rules/verification";
import { buildingMembers, isBlurredForVisitor } from "@/lib/rules/visibility";
import {
  EMPTY_FILTERS,
  type RoommateFilters as Filters,
  matchesFilters,
} from "./filters";
import { RoommateCard } from "./roommate-card";
import { RoommateFilters } from "./roommate-filters";

export function RoommateList() {
  const demo = useDemo();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  if (!demo) return <DemoSkeleton rows={4} />;
  const { world, now, meId, profile, verification } = demo;

  const blurred = isBlurredForVisitor(meId);
  const myBuilding = buildingOf(world, profile?.buildingId ?? null);
  const canUseSameBuilding = isVerificationValid(verification, now);
  const sameBuildingIds =
    filters.sameBuilding && meId && myBuilding
      ? new Set(
          buildingMembers(world, myBuilding.id, meId, now).map(
            (p) => p.accountId,
          ),
        )
      : null;

  const people = listedProfiles(world, meId, now).filter(
    (p) =>
      matchesFilters(p, filters) &&
      (sameBuildingIds === null || sameBuildingIds.has(p.accountId)),
  );

  return (
    <div className="flex flex-col gap-2.5 pb-3">
      <PageHeader
        title="Roommates"
        action={
          <span className="shrink-0 text-[14px] text-muted-foreground">
            {people.length} verified
          </span>
        }
      />
      <RoommateFilters
        value={filters}
        onChange={setFilters}
        buildings={world.buildings.filter((b) => b.active)}
        myBuildingName={myBuilding?.name ?? null}
        canUseSameBuilding={canUseSameBuilding}
      />

      {blurred ? (
        <div className="mx-2.5 rounded-xl bg-card p-3 text-sm">
          You're browsing as a visitor. Photos and names are hidden.{" "}
          <Link
            href="/sign-in"
            className="font-semibold underline underline-offset-2"
          >
            Sign up and verify
          </Link>{" "}
          to see more and contact people.
        </div>
      ) : null}

      {people.length === 0 ? (
        <div className="mx-2.5 flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No one matches these filters</p>
          <p className="text-muted-foreground text-sm">
            Try a higher budget, another move-in term or fewer habit filters.
          </p>
          <button
            type="button"
            className="text-primary text-sm"
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Clear filters
          </button>
        </div>
      ) : (
        // Two-column masonry. Alternating columns keeps the list order
        // (boosted people first) reading left to right.
        <div className="flex items-start gap-2 px-2.5">
          {[0, 1].map((column) => (
            <div key={column} className="flex min-w-0 flex-1 flex-col gap-2">
              {people
                .filter((_, i) => i % 2 === column)
                .map((p) => (
                  <RoommateCard
                    key={p.accountId}
                    profile={p}
                    badge={badgeFor(verificationOf(world, p.accountId), now)}
                    blurred={blurred}
                    isMe={p.accountId === meId}
                    boosted={
                      p.boostedUntil !== null && new Date(p.boostedUntil) > now
                    }
                  />
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
