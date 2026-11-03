"use client";

import { Check, type LucideIcon } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import type { Choice } from "@/components/shell/choice-chips";
import { cn } from "@/lib/utils";
import { TERM_MONTHS, TERMS, type Term } from "@/lib/waitlist/options";

function termMonths(value: string): string | null {
  const info = TERM_MONTHS[value as Term];
  return info ? `${info.months} · ${info.count} months` : null;
}

// Single choice shown as a full-width list, with each term's months on the
// right, e.g. "Spring 2027 … Jan–May · 5 months".
export function TermList<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-2">
      {options.map((option) => {
        const on = value === option.value;
        const months = termMonths(option.value);
        return (
          // biome-ignore lint/a11y/useSemanticElements: list-style radio button with aria-checked
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
              on
                ? "border-foreground bg-foreground text-background"
                : "bg-background hover:bg-muted",
            )}
          >
            <span className="font-medium text-[15px]">{option.label}</span>
            {months && (
              <span
                className={cn(
                  "text-[13px]",
                  on ? "text-background/70" : "text-muted-foreground",
                )}
              >
                {months}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

type TimingColumn = {
  label: string;
  value: Term[] | null;
  onChange: (terms: Term[]) => void;
};

// Terms down the side, the three needs across the top; tap a box for every
// term you need that for. An empty column means "not needed", so the step
// counts as answered as soon as it's shown.
export function TimingGrid({ columns }: { columns: TimingColumn[] }) {
  useEffect(() => {
    for (const column of columns) {
      if (column.value === null) column.onChange([]);
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
            <TimingRow key={term.value} term={term} columns={columns} />
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
}: {
  term: Choice<Term>;
  columns: TimingColumn[];
}) {
  const info = TERM_MONTHS[term.value];
  return (
    <tr>
      <th scope="row" className="text-left font-normal">
        <span className="block font-medium text-[14px]">{term.label}</span>
        <span className="block text-[12px] text-muted-foreground">
          {info.months} · {info.count} mo
        </span>
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
