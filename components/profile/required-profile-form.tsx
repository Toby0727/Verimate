"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { FieldError } from "@/components/onboarding/onboarding-step";
import { ChoiceChips } from "@/components/shell/choice-chips";
import {
  CLEANLINESS,
  GENDER,
  HOUSING,
  PETS,
  SLEEP,
  SMOKING,
} from "@/components/shell/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as actions from "@/lib/demo/actions";
import { PEOPLE_PHOTOS } from "@/lib/demo/sample-media";
import { missingRequiredFields, type RequiredField } from "@/lib/rules/profile";
import type { Profile } from "@/lib/rules/types";
import { cn } from "@/lib/utils";

const FIELD_LABELS: Record<RequiredField, string> = {
  photo: "Photo",
  displayName: "Display name",
  school: "School",
  standing: "Year or admit term",
  gender: "Gender",
  budgetMin: "Budget from",
  budgetMax: "Budget to",
  moveInFrom: "Move-in from",
  moveInTo: "Move-out by",
  housingStatus: "Housing status",
  groupHave: "People in your group",
  groupNeed: "People you need",
  sleep: "Sleep schedule",
  cleanliness: "Cleanliness",
  smoking: "Smoking",
  pets: "Pets",
};

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {htmlFor ? (
        <Label htmlFor={htmlFor}>{label}</Label>
      ) : (
        <span className="font-medium text-sm">{label}</span>
      )}
      {children}
    </div>
  );
}

export function RequiredProfileForm({
  initial,
  submitLabel,
  extra,
  onSaved,
}: {
  initial: Partial<Profile> | undefined;
  submitLabel: string;
  extra?: (
    values: Partial<Profile>,
    set: (patch: Partial<Profile>) => void,
  ) => ReactNode;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Partial<Profile>>(initial ?? {});
  const [missing, setMissing] = useState<RequiredField[]>([]);
  const set = (patch: Partial<Profile>) =>
    setValues((v) => ({ ...v, ...patch }));
  const invalid = (field: RequiredField) => missing.includes(field);
  const num = (value: string) => (value === "" ? null : Number(value));

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const gaps = missingRequiredFields(values);
        setMissing(gaps);
        if (gaps.length > 0) return;
        if (actions.saveRequiredProfile(values).ok) onSaved();
      }}
    >
      <Field label="Photo">
        <div
          className={cn(
            "grid grid-cols-6 gap-2 rounded-lg",
            invalid("photo") && "outline outline-destructive outline-offset-2",
          )}
        >
          {PEOPLE_PHOTOS.map((src) => (
            <button
              key={src}
              type="button"
              aria-label="Choose this sample photo"
              aria-pressed={values.photo === src}
              onClick={() => set({ photo: src })}
              className={cn(
                "overflow-hidden rounded-full border-2",
                values.photo === src ? "border-primary" : "border-transparent",
              )}
            >
              <Image
                src={src}
                alt=""
                width={48}
                height={48}
                className="aspect-square object-cover"
              />
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          Sample: pick a sample photo. The real app will let you upload one.
        </p>
      </Field>

      <Field label="Display name" htmlFor="displayName">
        <Input
          id="displayName"
          placeholder="First name + last initial, e.g. Jamie P."
          value={values.displayName ?? ""}
          aria-invalid={invalid("displayName")}
          onChange={(e) => set({ displayName: e.target.value })}
        />
      </Field>

      <Field label="School">
        <ChoiceChips
          label="School"
          options={[
            { value: "SU", label: "Syracuse University" },
            { value: "ESF", label: "SUNY ESF" },
          ]}
          value={values.school ?? null}
          invalid={invalid("school")}
          onChange={(school) => set({ school })}
        />
      </Field>

      <Field label="Year or admit term" htmlFor="standing">
        <Input
          id="standing"
          placeholder="e.g. Junior, Graduate, Admitted · Fall 2027"
          value={values.standing ?? ""}
          aria-invalid={invalid("standing")}
          onChange={(e) => set({ standing: e.target.value })}
        />
      </Field>

      <Field label="Gender">
        <ChoiceChips
          label="Gender"
          options={GENDER}
          value={values.gender ?? null}
          invalid={invalid("gender")}
          onChange={(gender) => set({ gender })}
        />
      </Field>

      <Field label="Monthly budget (USD)">
        <div className="flex items-center gap-2">
          <Input
            aria-label="Budget from"
            type="number"
            min={0}
            placeholder="From"
            value={values.budgetMin ?? ""}
            aria-invalid={invalid("budgetMin")}
            onChange={(e) => set({ budgetMin: num(e.target.value) })}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            aria-label="Budget to"
            type="number"
            min={0}
            placeholder="To"
            value={values.budgetMax ?? ""}
            aria-invalid={invalid("budgetMax")}
            onChange={(e) => set({ budgetMax: num(e.target.value) })}
          />
        </div>
      </Field>

      <Field label="When do you need a place?">
        <div className="flex items-center gap-2">
          <Input
            aria-label="Move-in from"
            type="date"
            value={values.moveInFrom ?? ""}
            aria-invalid={invalid("moveInFrom")}
            onChange={(e) => set({ moveInFrom: e.target.value || null })}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            aria-label="Move-out by"
            type="date"
            value={values.moveInTo ?? ""}
            aria-invalid={invalid("moveInTo")}
            onChange={(e) => set({ moveInTo: e.target.value || null })}
          />
        </div>
      </Field>

      <Field label="Where are you at?">
        <ChoiceChips
          label="Housing status"
          options={HOUSING}
          value={values.housingStatus ?? null}
          invalid={invalid("housingStatus")}
          onChange={(housingStatus) => set({ housingStatus })}
        />
        {values.housingStatus === "group" ? (
          <div className="flex items-center gap-2 text-sm">
            We are
            <Input
              aria-label="People in your group"
              type="number"
              min={1}
              className="w-16"
              value={values.groupHave ?? ""}
              aria-invalid={invalid("groupHave")}
              onChange={(e) => set({ groupHave: num(e.target.value) })}
            />
            and need
            <Input
              aria-label="People you need"
              type="number"
              min={1}
              className="w-16"
              value={values.groupNeed ?? ""}
              aria-invalid={invalid("groupNeed")}
              onChange={(e) => set({ groupNeed: num(e.target.value) })}
            />
            more
          </div>
        ) : null}
      </Field>

      <Field label="Sleep schedule">
        <ChoiceChips
          label="Sleep schedule"
          options={SLEEP}
          value={values.sleep ?? null}
          invalid={invalid("sleep")}
          onChange={(sleep) => set({ sleep })}
        />
      </Field>
      <Field label="Cleanliness">
        <ChoiceChips
          label="Cleanliness"
          options={CLEANLINESS}
          value={values.cleanliness ?? null}
          invalid={invalid("cleanliness")}
          onChange={(cleanliness) => set({ cleanliness })}
        />
      </Field>
      <Field label="Smoking">
        <ChoiceChips
          label="Smoking"
          options={SMOKING}
          value={values.smoking ?? null}
          invalid={invalid("smoking")}
          onChange={(smoking) => set({ smoking })}
        />
      </Field>
      <Field label="Pets">
        <ChoiceChips
          label="Pets"
          options={PETS}
          value={values.pets ?? null}
          invalid={invalid("pets")}
          onChange={(pets) => set({ pets })}
        />
      </Field>

      {extra?.(values, set)}

      {missing.length > 0 ? (
        <FieldError>
          Still needed: {missing.map((f) => FIELD_LABELS[f]).join(", ")}.
        </FieldError>
      ) : null}
      <Button type="submit" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
