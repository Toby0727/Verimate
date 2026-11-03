"use client";

import type { Choice } from "@/components/shell/choice-chips";
import { cn } from "@/lib/utils";

const chipClass = (on: boolean) =>
  cn(
    "rounded-full border px-3 py-1.5 text-sm transition-colors",
    on
      ? "border-foreground bg-foreground text-background"
      : "bg-background hover:bg-muted",
  );

// Multi-select version of ChoiceChips. With `noneLabel`, an extra chip stands
// for "none of these" and is stored as an empty list.
export function MultiChips<T extends string>({
  options,
  value,
  onToggle,
  onNone,
  noneLabel,
  label,
}: {
  options: readonly Choice<T>[];
  value: T[] | null;
  onToggle: (value: T) => void;
  onNone?: () => void;
  noneLabel?: string;
  label: string;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: chip-style checkboxes
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = value?.includes(option.value) ?? false;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(option.value)}
            className={chipClass(on)}
          >
            {option.label}
          </button>
        );
      })}
      {noneLabel && onNone ? (
        <button
          type="button"
          aria-pressed={value?.length === 0}
          onClick={onNone}
          className={chipClass(value?.length === 0)}
        >
          {noneLabel}
        </button>
      ) : null}
    </div>
  );
}
