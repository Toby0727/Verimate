"use client";

import { ShieldAlert } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { showSampleNotice } from "@/components/demo/sample-notice";
import { FieldError } from "@/components/onboarding/onboarding-step";
import { AccessGate } from "@/components/shell/access-gate";
import { ChoiceChips } from "@/components/shell/choice-chips";
import { ROOM_TYPES } from "@/components/shell/labels";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as actions from "@/lib/demo/actions";
import { ROOM_PHOTOS } from "@/lib/demo/sample-media";
import { useDemo } from "@/lib/demo/use-demo";
import { MIN_AGE } from "@/lib/rules/constants";
import { missingSubletFields, type SubletField } from "@/lib/rules/sublets";
import type { Sublet } from "@/lib/rules/types";
import { ageOn } from "@/lib/rules/verification";
import { cn } from "@/lib/utils";

const FIELD_LABELS: Record<SubletField, string> = {
  location: "Building or area",
  rent: "Monthly rent",
  startDate: "Start date",
  endDate: "End date",
  dates: "End date after start date",
  roomType: "Room type",
  furnished: "Furnished",
  photos: "At least one photo",
  roommatesInfo: "Current roommates",
  onLeaseDeclared: "Confirm you're on the lease",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-sm">{label}</span>
      {children}
    </div>
  );
}

function SubletFormContent() {
  const router = useRouter();
  const demo = useDemo();
  const [values, setValues] = useState<Partial<Sublet>>({
    photos: [],
    onLeaseDeclared: false,
  });
  const [missing, setMissing] = useState<SubletField[]>([]);
  if (!demo) return null;
  const set = (patch: Partial<Sublet>) =>
    setValues((v) => ({ ...v, ...patch }));
  const invalid = (f: SubletField) => missing.includes(f);
  const isMinor = demo.me?.birthDate
    ? ageOn(demo.me.birthDate, demo.now) < MIN_AGE
    : false;
  const photos = values.photos ?? [];

  return (
    <form
      className="flex flex-col gap-5 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const gaps = missingSubletFields(values);
        setMissing(gaps);
        if (gaps.length > 0) return;
        const result = actions.createSublet(values);
        if (!result.ok) return;
        if (values.lease?.documentName) {
          showSampleNotice(
            "the lease is not uploaded; the team sees only its name",
          );
        }
        router.push("/me/sublets");
      }}
    >
      {isMinor ? (
        <div className="flex gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 p-3 text-amber-900 text-sm">
          <ShieldAlert className="size-4 shrink-0" />
          You're under 18. Show the place only with a parent or friend present,
          and never take money before paperwork is signed.
        </div>
      ) : null}

      <Field label="Title">
        <Input
          aria-label="Title"
          placeholder="e.g. Summer room near campus"
          value={values.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
        />
      </Field>

      <Field label="Building or area">
        <select
          aria-label="Building or area"
          aria-invalid={invalid("location")}
          className="h-9 rounded-lg border bg-background px-2 text-sm aria-invalid:border-destructive"
          value={values.buildingId ?? ""}
          onChange={(e) => {
            const building = demo.world.buildings.find(
              (b) => b.id === e.target.value,
            );
            set({
              buildingId: building?.id ?? null,
              area:
                building?.name ?? (e.target.value === "other" ? "Other" : null),
            });
          }}
        >
          <option value="">Choose…</option>
          {demo.world.buildings
            .filter((b) => b.active)
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          <option value="other">Other</option>
        </select>
      </Field>

      <Field label="Exact address (shown only after you connect)">
        <Input
          aria-label="Exact address"
          placeholder="Street, unit"
          value={values.exactAddress ?? ""}
          onChange={(e) => set({ exactAddress: e.target.value || null })}
        />
      </Field>

      <Field label="Monthly rent (USD)">
        <Input
          type="number"
          min={0}
          aria-label="Monthly rent"
          aria-invalid={invalid("rent")}
          value={values.rent ?? ""}
          onChange={(e) =>
            set({ rent: e.target.value ? Number(e.target.value) : null })
          }
        />
      </Field>

      <Field label="Dates">
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="Start date"
            aria-invalid={invalid("startDate") || invalid("dates")}
            value={values.startDate ?? ""}
            onChange={(e) => set({ startDate: e.target.value || null })}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="date"
            aria-label="End date"
            aria-invalid={invalid("endDate") || invalid("dates")}
            value={values.endDate ?? ""}
            onChange={(e) => set({ endDate: e.target.value || null })}
          />
        </div>
      </Field>

      <Field label="Room type">
        <ChoiceChips
          label="Room type"
          options={ROOM_TYPES}
          value={values.roomType ?? null}
          invalid={invalid("roomType")}
          onChange={(roomType) => set({ roomType })}
        />
      </Field>

      <Field label="Furnished">
        <ChoiceChips
          label="Furnished"
          options={[
            { value: "yes", label: "Furnished" },
            { value: "no", label: "Unfurnished" },
          ]}
          value={
            values.furnished === undefined || values.furnished === null
              ? null
              : values.furnished
                ? "yes"
                : "no"
          }
          invalid={invalid("furnished")}
          onChange={(v) => set({ furnished: v === "yes" })}
        />
      </Field>

      <Field label="Photos">
        <div
          className={cn(
            "grid grid-cols-5 gap-1.5 rounded-lg",
            invalid("photos") && "outline outline-destructive outline-offset-2",
          )}
        >
          {ROOM_PHOTOS.map((src) => {
            const selected = photos.includes(src);
            return (
              <button
                key={src}
                type="button"
                aria-pressed={selected}
                aria-label="Toggle sample photo"
                onClick={() =>
                  set({
                    photos: selected
                      ? photos.filter((p) => p !== src)
                      : [...photos, src],
                  })
                }
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border-2",
                  selected ? "border-primary" : "border-transparent",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
        <p className="text-muted-foreground text-xs">
          Sample: pick sample photos. The real app will let you upload yours.
        </p>
      </Field>

      <Field label="Current roommates">
        <Textarea
          aria-label="Current roommates"
          rows={2}
          placeholder="Who else lives there?"
          aria-invalid={invalid("roommatesInfo")}
          value={values.roommatesInfo ?? ""}
          onChange={(e) => set({ roommatesInfo: e.target.value })}
        />
      </Field>

      <Field label="Description (optional)">
        <Textarea
          aria-label="Description"
          rows={3}
          value={values.description ?? ""}
          onChange={(e) => set({ description: e.target.value || null })}
        />
      </Field>

      <Field label="Lease (optional, gets a “Lease verified” badge)">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => {
            const name = e.target.files?.[0]?.name ?? null;
            set({
              lease: { documentName: name, status: name ? "pending" : "none" },
            });
          }}
          className="text-sm file:mr-3 file:rounded-md file:border file:bg-muted file:px-3 file:py-1.5"
        />
        <button
          type="button"
          className="self-start text-primary text-sm"
          onClick={() =>
            set({
              lease: { documentName: "sample-lease.pdf", status: "pending" },
            })
          }
        >
          Use a sample lease
        </button>
        {values.lease?.documentName ? (
          <p className="text-sm">{values.lease.documentName}</p>
        ) : null}
      </Field>

      <div
        className={cn(
          "flex items-start gap-2 rounded-lg",
          invalid("onLeaseDeclared") &&
            "outline outline-destructive outline-offset-2",
        )}
      >
        <Checkbox
          id="on-lease"
          aria-label="I'm on the lease or a roommate on it"
          checked={values.onLeaseDeclared === true}
          onCheckedChange={(checked) =>
            set({ onLeaseDeclared: checked === true })
          }
        />
        <Label htmlFor="on-lease" className="font-normal leading-snug">
          I'm on the lease, or a roommate on it, and I'm allowed to sublet. No
          agents or landlords.
        </Label>
      </div>

      {missing.length > 0 ? (
        <FieldError>
          Still needed: {missing.map((f) => FIELD_LABELS[f]).join(", ")}.
        </FieldError>
      ) : null}
      <Button type="submit" size="lg">
        Post sublet
      </Button>
    </form>
  );
}

export function SubletForm() {
  return (
    <AccessGate require="verified-complete">
      <SubletFormContent />
    </AccessGate>
  );
}
