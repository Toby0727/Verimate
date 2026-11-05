"use client";

import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addCustomHobby,
  type CustomHobby,
  type CustomHobbyRefusal,
  removeCustomHobby,
  toggle,
} from "@/lib/rules/waitlist";
import { cn } from "@/lib/utils";
import {
  CUSTOM_HOBBY_ICONS,
  type CustomHobbyIcon,
  HOBBIES,
  HOBBY_CUSTOM_MAX,
  HOBBY_LABEL_MAX,
  type Hobby,
} from "@/lib/waitlist/options";
import { CUSTOM_ICONS, HOBBY_ICONS } from "./hobby-icons";

const REFUSALS: Record<CustomHobbyRefusal, string> = {
  empty: "Type a hobby first.",
  "too-long": `Keep it under ${HOBBY_LABEL_MAX} characters.`,
  formula: "Start with a letter or number.",
  taken: "That one's already on your list. Tap it above.",
  full: `You can add up to ${HOBBY_CUSTOM_MAX} of your own.`,
};

const tileClass = (on: boolean) =>
  cn(
    "relative flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-3 text-center text-[12px] leading-tight transition-colors",
    on
      ? "border-verified-fill bg-verified-tint font-semibold text-foreground"
      : "border-black/10 bg-background hover:bg-muted",
  );

// Tappable hobby tiles, each with its own icon, plus hobbies the student
// adds themselves (they pick an icon and type a name).
export function HobbyPicker({
  hobbies,
  custom,
  onHobbies,
  onCustom,
}: {
  hobbies: Hobby[] | null;
  custom: CustomHobby[] | null;
  onHobbies: (hobbies: Hobby[]) => void;
  onCustom: (custom: CustomHobby[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const own = custom ?? [];

  return (
    <div className="flex flex-col gap-3">
      {/* biome-ignore lint/a11y/useSemanticElements: tile-style checkboxes */}
      <div
        role="group"
        aria-label="Hobbies"
        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
      >
        {HOBBIES.map((hobby) => {
          const on = hobbies?.includes(hobby.value) ?? false;
          const Icon = HOBBY_ICONS[hobby.value];
          return (
            <button
              key={hobby.value}
              type="button"
              aria-pressed={on}
              onClick={() => onHobbies(toggle(hobbies, hobby.value))}
              className={tileClass(on)}
            >
              <Icon
                aria-hidden
                className={cn(
                  "size-7",
                  on ? "text-verified" : "text-foreground",
                )}
                strokeWidth={1.7}
              />
              {hobby.label}
              {on ? <Tick /> : null}
            </button>
          );
        })}
        {own.map((hobby) => {
          const Icon = CUSTOM_ICONS[hobby.icon];
          return (
            <div key={hobby.label} className={tileClass(true)}>
              <Icon
                aria-hidden
                className="size-7 text-verified"
                strokeWidth={1.7}
              />
              <span className="break-words">{hobby.label}</span>
              <button
                type="button"
                aria-label={`Remove ${hobby.label}`}
                onClick={() => onCustom(removeCustomHobby(custom, hobby.label))}
                className="absolute top-1 right-1 grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-background"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
        {!adding && own.length < HOBBY_CUSTOM_MAX ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-xl border border-black/20 border-dashed px-1.5 py-3 text-[12px] text-muted-foreground hover:bg-muted"
          >
            <Plus aria-hidden className="size-7" strokeWidth={1.7} />
            Add your own
          </button>
        ) : null}
      </div>

      {adding ? (
        <AddOwn
          custom={custom}
          onAdd={(list) => {
            onCustom(list);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : null}
    </div>
  );
}

function Tick() {
  return (
    <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-verified-fill text-foreground">
      <Check className="size-3" strokeWidth={3} aria-hidden />
    </span>
  );
}

function AddOwn({
  custom,
  onAdd,
  onCancel,
}: {
  custom: CustomHobby[] | null;
  onAdd: (list: CustomHobby[]) => void;
  onCancel: () => void;
}) {
  const [icon, setIcon] = useState<CustomHobbyIcon>("star");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const result = addCustomHobby(custom, icon, label);
    if (result.ok) onAdd(result.list);
    else setError(REFUSALS[result.reason]);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-background p-3">
      <span className="font-medium text-[14px]">Add your own hobby</span>
      <div
        role="radiogroup"
        aria-label="Pick an icon"
        className="grid grid-cols-6 gap-1.5"
      >
        {CUSTOM_HOBBY_ICONS.map((key) => {
          const Icon = CUSTOM_ICONS[key];
          const on = icon === key;
          return (
            // biome-ignore lint/a11y/useSemanticElements: icon-style radio buttons
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={key}
              onClick={() => setIcon(key)}
              className={cn(
                "grid aspect-square place-items-center rounded-lg border transition-colors",
                on
                  ? "border-verified-fill bg-verified-tint text-verified"
                  : "border-black/10 hover:bg-muted",
              )}
            >
              <Icon className="size-5" strokeWidth={1.8} aria-hidden />
            </button>
          );
        })}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <Input
          aria-label="Hobby name"
          placeholder="e.g. Camping, K-pop, Thrifting"
          maxLength={HOBBY_LABEL_MAX}
          value={label}
          autoFocus
          onChange={(e) => {
            setLabel(e.target.value);
            setError(null);
          }}
        />
        <Button type="submit" disabled={!label.trim()}>
          Add
        </Button>
      </form>
      <div className="flex items-center justify-between">
        <span
          role={error ? "alert" : undefined}
          className={cn(
            "text-[12px]",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? `${label.trim().length}/${HOBBY_LABEL_MAX}`}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-[13px] text-muted-foreground underline underline-offset-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
