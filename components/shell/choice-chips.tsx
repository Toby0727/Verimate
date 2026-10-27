"use client";

import { cn } from "@/lib/utils";

export type Choice<T extends string> = { value: T; label: string };

// Quick-select buttons used for habits and other short option lists.
export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
  invalid,
  label,
}: {
  options: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  invalid?: boolean;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid}
      className={cn(
        "flex flex-wrap gap-2 rounded-lg",
        invalid && "outline outline-destructive outline-offset-2",
      )}
    >
      {options.map((option) => (
        // biome-ignore lint/a11y/useSemanticElements: chip-style radio button with aria-checked
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            value === option.value
              ? "border-foreground bg-foreground text-background"
              : "bg-background hover:bg-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
