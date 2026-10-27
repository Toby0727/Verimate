"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { type Choice, ChoiceChips } from "@/components/shell/choice-chips";
import {
  CLEANLINESS,
  GENDER,
  PETS,
  SLEEP,
  SMOKING,
} from "@/components/shell/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { Building } from "@/lib/rules/types";
import {
  activeFilterCount,
  EMPTY_FILTERS,
  type RoommateFilters as Filters,
  type Term,
} from "./filters";

const TERMS: Choice<Term>[] = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall / next year" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-sm">{title}</span>
      {children}
    </div>
  );
}

// Toggle a chip: picking the selected value again clears it.
const toggle = <T,>(current: T | null, next: T) =>
  current === next ? null : next;

export function RoommateFilters({
  value,
  onChange,
  buildings,
  myBuildingName,
  canUseSameBuilding,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
  buildings: Building[];
  myBuildingName: string | null;
  canUseSameBuilding: boolean;
}) {
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });
  const count = activeFilterCount(value);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <SlidersHorizontal />
        Filters{count > 0 ? ` · ${count}` : ""}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[85dvh] max-w-[520px] overflow-y-auto rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle>Filter roommates</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-4">
            {canUseSameBuilding ? (
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">Same building</span>
                  <span className="block text-muted-foreground text-xs">
                    {myBuildingName
                      ? `People in ${myBuildingName} who chose to show up`
                      : "Choose your building in your profile first"}
                  </span>
                </span>
                <Switch
                  aria-label="Same building"
                  checked={value.sameBuilding}
                  disabled={!myBuildingName}
                  onCheckedChange={(checked) => set({ sameBuilding: checked })}
                />
              </div>
            ) : null}
            <Section title="Max budget (USD / month)">
              <Label htmlFor="max-budget" className="sr-only">
                Max budget
              </Label>
              <Input
                id="max-budget"
                type="number"
                min={0}
                placeholder="Any"
                value={value.maxBudget ?? ""}
                onChange={(e) =>
                  set({
                    maxBudget: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </Section>
            <Section title="Move-in">
              <ChoiceChips
                label="Move-in"
                options={TERMS}
                value={value.term}
                onChange={(term) => set({ term: toggle(value.term, term) })}
              />
            </Section>
            <Section title="Building or area">
              <select
                aria-label="Building or area"
                className="h-9 rounded-lg border bg-background px-2 text-sm"
                value={value.buildingId ?? ""}
                onChange={(e) => set({ buildingId: e.target.value || null })}
              >
                <option value="">Anywhere</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Section>
            <Section title="Gender">
              <ChoiceChips
                label="Gender"
                options={GENDER}
                value={value.gender}
                onChange={(gender) =>
                  set({ gender: toggle(value.gender, gender) })
                }
              />
            </Section>
            <Section title="Sleep schedule">
              <ChoiceChips
                label="Sleep schedule"
                options={SLEEP}
                value={value.sleep}
                onChange={(sleep) => set({ sleep: toggle(value.sleep, sleep) })}
              />
            </Section>
            <Section title="Cleanliness">
              <ChoiceChips
                label="Cleanliness"
                options={CLEANLINESS}
                value={value.cleanliness}
                onChange={(cleanliness) =>
                  set({ cleanliness: toggle(value.cleanliness, cleanliness) })
                }
              />
            </Section>
            <Section title="Smoking">
              <ChoiceChips
                label="Smoking"
                options={SMOKING}
                value={value.smoking}
                onChange={(smoking) =>
                  set({ smoking: toggle(value.smoking, smoking) })
                }
              />
            </Section>
            <Section title="Pets">
              <ChoiceChips
                label="Pets"
                options={PETS}
                value={value.pets}
                onChange={(pets) => set({ pets: toggle(value.pets, pets) })}
              />
            </Section>
          </div>
          <SheetFooter className="flex-row">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => onChange(EMPTY_FILTERS)}
            >
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Show results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
