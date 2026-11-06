"use client";

import { Check, type LucideIcon, Plane } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import type { Choice } from "@/components/shell/choice-chips";
import type { AbroadPlan } from "@/lib/rules/waitlist";
import { cn } from "@/lib/utils";
import {
  ABROAD_PLACE_LABELS,
  ABROAD_PLACES,
  type AbroadPlace,
  STUDY_ABROAD,
  TERM_MONTHS,
  TERMS,
  type Term,
} from "@/lib/waitlist/options";

type TimingColumn = {
  label: string;
  value: Term[] | null;
  onChange: (terms: Term[]) => void;
  // Ticked the first time the grid shows, before the student changes it.
  initial?: Term[];
};

// Terms down the side, the three needs across the top; tap a box for every
// term you need that for. An empty column means "not needed", so the step
// counts as answered as soon as it's shown.
// Terms away from step 4 are tagged with where, so the student sees why
// subletting their place might matter that term.
export function TimingGrid({
  columns,
  away,
}: {
  columns: TimingColumn[];
  away: AbroadPlan[] | null;
}) {
  useEffect(() => {
    for (const column of columns) {
      if (column.value === null) column.onChange(column.initial ?? []);
    }
  }, [columns]);

  return (
    <div className="flex flex-col gap-3">
      <table className="w-full table-fixed border-separate border-spacing-y-2">
        <caption className="sr-only">Terms you need housing help</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[37%]">
              <span className="sr-only">Term</span>
            </th>
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className="px-0.5 align-bottom font-medium text-[12px] text-muted-foreground leading-tight"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TERMS.map((term) => (
            <TimingRow
              key={term.value}
              term={term}
              columns={columns}
              place={away?.find((plan) => plan.term === term.value)?.place}
            />
          ))}
        </tbody>
      </table>
      <p className="text-[13px] text-muted-foreground">
        Tap every box that applies. Leave a column empty if you don't need it.
      </p>
    </div>
  );
}

function TimingRow({
  term,
  columns,
  place,
}: {
  term: Choice<Term>;
  columns: TimingColumn[];
  place?: AbroadPlace | null;
}) {
  const info = TERM_MONTHS[term.value];
  return (
    <tr>
      <th scope="row" className="text-left font-normal">
        <span className="block font-medium text-[14px]">{term.label}</span>
        <span className="block text-[12px] text-muted-foreground">
          {info.months} · {info.count} mo
        </span>
        {place && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-verified-tint px-2 py-0.5 font-medium text-[11px] text-verified">
            <Plane className="size-3" aria-hidden />
            {ABROAD_PLACE_LABELS[place]}
          </span>
        )}
      </th>
      {columns.map((column) => {
        const on = column.value?.includes(term.value) ?? false;
        return (
          <td key={column.label} className="text-center">
            <button
              type="button"
              aria-label={`${column.label}, ${term.label}`}
              aria-pressed={on}
              onClick={() => {
                const current = column.value ?? [];
                column.onChange(
                  on
                    ? current.filter((t) => t !== term.value)
                    : [...current, term.value],
                );
              }}
              className={cn(
                "inline-grid size-10 place-items-center rounded-xl border transition-colors",
                on
                  ? "border-foreground bg-foreground text-background"
                  : "bg-background hover:bg-muted",
              )}
            >
              {on && <Check className="size-5" strokeWidth={3} />}
            </button>
          </td>
        );
      })}
    </tr>
  );
}

// A Hinge-style question: an icon and a title over its answer chips.
export function IconQuestion({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
          <Icon className="size-4" strokeWidth={2.2} aria-hidden />
        </span>
        <span className="font-medium text-[15px]">{label}</span>
      </div>
      {children}
    </div>
  );
}

const PLACE_GROUPS: {
  label: string;
  options: readonly Choice<AbroadPlace>[];
}[] = [
  { label: "US semesters", options: ABROAD_PLACES.us },
  { label: "SU Abroad centers", options: ABROAD_PLACES.centers },
  { label: "Partner programs", options: ABROAD_PLACES.partners },
  { label: "At sea", options: ABROAD_PLACES.sea },
  { label: "Other", options: ABROAD_PLACES.other },
];

type AbroadValue = (typeof STUDY_ABROAD)[number]["value"];

// Study abroad, term by term: "No plans" and "Not sure yet" stand alone;
// any number of terms can be picked, and each picked term asks where.
export function AbroadPlanList({
  studyAbroad,
  plans,
  onToggle,
  onPlace,
}: {
  studyAbroad: AbroadValue | null;
  plans: AbroadPlan[] | null;
  onToggle: (value: AbroadValue) => void;
  onPlace: (term: Term, place: AbroadPlace) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {STUDY_ABROAD.map((option) => {
        const info = TERM_MONTHS[option.value as Term];
        const plan = plans?.find((p) => p.term === option.value);
        const on = info ? plan !== undefined : studyAbroad === option.value;
        return (
          <div
            key={option.value}
            className={cn(
              "overflow-hidden rounded-xl border transition-colors",
              on
                ? "border-foreground bg-foreground text-background"
                : "bg-background",
            )}
          >
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(option.value)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-3 text-left",
                !on && "hover:bg-muted",
              )}
            >
              <span className="flex items-center gap-2.5">
                {info && (
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-md border",
                      on
                        ? "border-background bg-background text-foreground"
                        : "",
                    )}
                  >
                    {on && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                )}
                <span className="font-medium text-[15px]">{option.label}</span>
              </span>
              {info && (
                <span
                  className={cn(
                    "text-[13px]",
                    on ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  {info.months} · {info.count} months
                </span>
              )}
            </button>
            {plan && (
              <div className="px-4 pb-3">
                <select
                  aria-label={`Where for ${option.label}`}
                  value={plan.place ?? ""}
                  onChange={(e) =>
                    onPlace(plan.term, e.target.value as AbroadPlace)
                  }
                  className={cn(
                    "h-11 w-full rounded-lg bg-background px-3 text-[15px] text-foreground",
                    !plan.place && "text-muted-foreground",
                  )}
                >
                  <option value="" disabled>
                    Where are you going?
                  </option>
                  {PLACE_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((place) => (
                        <option key={place.value} value={place.value}>
                          {place.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
