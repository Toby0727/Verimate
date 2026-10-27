"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { ChoiceChips } from "@/components/shell/choice-chips";
import { PROMPTS } from "@/components/shell/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROOM_PHOTOS } from "@/lib/demo/sample-media";
import { MAX_PROFILE_PHOTOS, MAX_PROMPTS } from "@/lib/rules/constants";
import type { Building, Profile, PromptAnswer } from "@/lib/rules/types";
import { cn } from "@/lib/utils";
import { BuildingPicker } from "./building-picker";

const MAX_EXTRA_PHOTOS = MAX_PROFILE_PHOTOS - 1;

function ExtraPhotos({
  value,
  onChange,
}: {
  value: string[];
  onChange: (photos: string[]) => void;
}) {
  const full = value.length >= MAX_EXTRA_PHOTOS;
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-sm">
        More photos ({value.length} of {MAX_EXTRA_PHOTOS})
      </span>
      <div className="grid grid-cols-5 gap-2">
        {ROOM_PHOTOS.map((src) => {
          const picked = value.includes(src);
          return (
            <button
              key={src}
              type="button"
              aria-label="Add this sample photo"
              aria-pressed={picked}
              disabled={!picked && full}
              onClick={() =>
                onChange(
                  picked ? value.filter((p) => p !== src) : [...value, src],
                )
              }
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 disabled:opacity-40",
                picked ? "border-primary" : "border-transparent",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground text-xs">
        Sample: pick sample photos. The real app will let you upload your own.
      </p>
    </div>
  );
}

function Prompts({
  value,
  onChange,
}: {
  value: PromptAnswer[];
  onChange: (prompts: PromptAnswer[]) => void;
}) {
  const unused = PROMPTS.filter(
    (p) => !value.some((a) => a.promptId === p.value),
  );
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-sm">
        Prompts ({value.length} of {MAX_PROMPTS})
      </span>
      {value.map((answer, i) => (
        <div
          key={answer.promptId}
          className="flex flex-col gap-2 rounded-xl bg-card p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`prompt-${answer.promptId}`}>
              {PROMPTS.find((p) => p.value === answer.promptId)?.label}
            </Label>
            <button
              type="button"
              aria-label="Remove this prompt"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
          <Textarea
            id={`prompt-${answer.promptId}`}
            rows={2}
            value={answer.answer}
            onChange={(e) =>
              onChange(
                value.map((a, j) =>
                  j === i ? { ...a, answer: e.target.value } : a,
                ),
              )
            }
          />
        </div>
      ))}
      {value.length < MAX_PROMPTS ? (
        <div className="flex flex-wrap gap-1.5">
          {unused.map((p) => (
            <Button
              key={p.value}
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onChange([...value, { promptId: p.value, answer: "" }])
              }
            >
              {p.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function OptionalProfileFields({
  values,
  set,
  buildings,
}: {
  values: Partial<Profile>;
  set: (patch: Partial<Profile>) => void;
  buildings: Building[];
}) {
  return (
    <div className="flex flex-col gap-5 border-t pt-5">
      <h2 className="font-semibold">Optional</h2>
      <ExtraPhotos
        value={values.extraPhotos ?? []}
        onChange={(extraPhotos) => set({ extraPhotos })}
      />
      <Prompts
        value={values.prompts ?? []}
        onChange={(prompts) => set({ prompts })}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor="major">Major</Label>
        <Input
          id="major"
          value={values.major ?? ""}
          onChange={(e) => set({ major: e.target.value || null })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="languages">Languages (comma separated)</Label>
        <Input
          id="languages"
          value={(values.languages ?? []).join(", ")}
          onChange={(e) =>
            set({
              languages: e.target.value
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean),
            })
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">About you</Label>
        <Textarea
          id="bio"
          rows={3}
          value={values.bio ?? ""}
          onChange={(e) => set({ bio: e.target.value || null })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">
          Building or area you live in / want
        </span>
        <BuildingPicker
          buildings={buildings}
          value={values.buildingId ?? null}
          onChange={(buildingId) => set({ buildingId })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">Roommate gender preference</span>
        <ChoiceChips
          label="Roommate gender preference"
          options={[
            { value: "same", label: "Same gender" },
            { value: "any", label: "No preference" },
          ]}
          value={values.roommateGenderPref ?? null}
          onChange={(roommateGenderPref) => set({ roommateGenderPref })}
        />
      </div>
    </div>
  );
}
