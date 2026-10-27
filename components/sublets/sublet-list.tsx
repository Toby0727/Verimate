"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { type Term, termOf } from "@/components/roommates/filters";
import { ChoiceChips } from "@/components/shell/choice-chips";
import { ROOM_TYPES } from "@/components/shell/labels";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildingOf } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { isSubletListed } from "@/lib/rules/sublets";
import type { RoomType, Sublet } from "@/lib/rules/types";
import { isBlurredForVisitor, isHiddenFor } from "@/lib/rules/visibility";
import { SubletCard } from "./sublet-card";

type Filters = {
  maxRent: number | null;
  term: Term | null;
  roomType: RoomType | null;
  furnished: "yes" | "no" | null;
  buildingId: string | null;
};

const EMPTY: Filters = {
  maxRent: null,
  term: null,
  roomType: null,
  furnished: null,
  buildingId: null,
};

const toggle = <T,>(current: T | null, next: T) =>
  current === next ? null : next;

function matches(s: Sublet, f: Filters) {
  return (
    (f.maxRent === null || (s.rent ?? 0) <= f.maxRent) &&
    (f.term === null || termOf(s.startDate) === f.term) &&
    (f.roomType === null || s.roomType === f.roomType) &&
    (f.furnished === null || s.furnished === (f.furnished === "yes")) &&
    (f.buildingId === null || s.buildingId === f.buildingId)
  );
}

export function SubletList() {
  const demo = useDemo();
  const [filters, setFilters] = useState<Filters>(EMPTY);
  if (!demo) return <DemoSkeleton rows={3} />;
  const { world, now, meId } = demo;
  const set = (patch: Partial<Filters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const sublets = world.sublets.filter(
    (s) =>
      isSubletListed(s, now) &&
      !isHiddenFor(meId, s.authorId, world.blocks) &&
      matches(s, filters),
  );
  const blurred = isBlurredForVisitor(meId);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-2 rounded-xl bg-card p-3">
        <div className="flex gap-2">
          <Input
            aria-label="Max rent"
            type="number"
            min={0}
            placeholder="Max rent / mo"
            value={filters.maxRent ?? ""}
            onChange={(e) =>
              set({ maxRent: e.target.value ? Number(e.target.value) : null })
            }
          />
          <select
            aria-label="Building or area"
            className="h-8 min-w-0 flex-1 rounded-lg border bg-background px-2 text-sm"
            value={filters.buildingId ?? ""}
            onChange={(e) => set({ buildingId: e.target.value || null })}
          >
            <option value="">Anywhere</option>
            {world.buildings
              .filter((b) => b.active)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
        </div>
        <ChoiceChips
          label="Term"
          options={[
            { value: "spring", label: "Spring" },
            { value: "summer", label: "Summer" },
            { value: "fall", label: "Fall" },
          ]}
          value={filters.term}
          onChange={(term) => set({ term: toggle(filters.term, term) })}
        />
        <ChoiceChips
          label="Room type"
          options={ROOM_TYPES}
          value={filters.roomType}
          onChange={(roomType) =>
            set({ roomType: toggle(filters.roomType, roomType) })
          }
        />
        <ChoiceChips
          label="Furnished"
          options={[
            { value: "yes", label: "Furnished" },
            { value: "no", label: "Unfurnished" },
          ]}
          value={filters.furnished}
          onChange={(furnished) =>
            set({ furnished: toggle(filters.furnished, furnished) })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {sublets.length} {sublets.length === 1 ? "sublet" : "sublets"} from
          people on the lease
        </p>
        {meId ? (
          <Link href="/sublets/new" className={buttonVariants({ size: "sm" })}>
            <Plus /> Post a sublet
          </Link>
        ) : null}
      </div>

      {sublets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No sublets match</p>
          <p className="text-muted-foreground text-sm">
            Try a higher max rent or another term.
          </p>
          <button
            type="button"
            className="text-primary text-sm"
            onClick={() => setFilters(EMPTY)}
          >
            Clear filters
          </button>
        </div>
      ) : (
        sublets.map((s) => (
          <SubletCard
            key={s.id}
            sublet={s}
            location={
              buildingOf(world, s.buildingId)?.name ?? s.area ?? "Syracuse"
            }
            blurred={blurred}
          />
        ))
      )}
    </div>
  );
}
