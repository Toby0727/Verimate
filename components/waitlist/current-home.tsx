"use client";

import { Building2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HOME_MAX_LENGTH } from "@/lib/rules/waitlist";
import { APARTMENTS } from "@/lib/waitlist/apartments";

const SUGGESTIONS = 5;

// "Where do you live now?" for students subletting their place out: type
// it, or tap one of the buildings we already know as you type.
export function CurrentHome({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const query = (value ?? "").trim().toLowerCase();
  const listed = APARTMENTS.find((apt) => apt.name.toLowerCase() === query);
  const matches =
    query && !listed
      ? APARTMENTS.filter((apt) =>
          [apt.name, apt.address ?? "", ...apt.aliases].some((text) =>
            text.toLowerCase().includes(query),
          ),
        ).slice(0, SUGGESTIONS)
      : [];

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="current-home" className="font-medium text-[15px]">
        Where do you live now?
      </label>
      <span className="-mt-1 text-[13px] text-muted-foreground">
        The place you'd sublet. Pick your building or type it. No unit number
        needed.
      </span>
      <Input
        id="current-home"
        placeholder="e.g. Theory, or 123 Ackerman Ave"
        autoComplete="off"
        maxLength={HOME_MAX_LENGTH}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      />
      {listed ? (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-verified">
          <Check className="size-4" aria-hidden />
          {listed.address ?? listed.name}
        </span>
      ) : null}
      {matches.length > 0 ? (
        <ul className="flex flex-col gap-1" aria-label="Buildings we know">
          {matches.map((apt) => (
            <li key={apt.name}>
              <button
                type="button"
                onClick={() => onChange(apt.name)}
                className="flex w-full items-center gap-2.5 rounded-lg border border-black/10 bg-background px-3 py-2 text-left hover:bg-muted"
              >
                <Building2
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[14px]">
                    {apt.name}
                  </span>
                  {apt.address ? (
                    <span className="block truncate text-[12px] text-muted-foreground">
                      {apt.address}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {query && !listed && matches.length === 0 ? (
        <span className="text-[12px] text-muted-foreground">
          Not on our list yet. That's fine, we'll save what you typed.
        </span>
      ) : null}
    </div>
  );
}
