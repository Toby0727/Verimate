"use client";

import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { School } from "@/lib/rules/types";
import type { WaitlistAnswers } from "@/lib/rules/waitlist";
import { waitlistPhotoUrl } from "@/lib/waitlist/api";
import { YEARS } from "@/lib/waitlist/options";

function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
}

// The student's own card on the done screen: photo, name, year and major,
// and their verified school (or a note that a personal account isn't
// verified).
export function ProfileCard({
  answers,
  school,
}: {
  answers: WaitlistAnswers;
  school: School | null;
}) {
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!answers.photoPath) return;
    let cancelled = false;
    waitlistPhotoUrl(answers.photoPath).then((url) => {
      if (!cancelled) setPhoto(url);
    });
    return () => {
      cancelled = true;
    };
  }, [answers.photoPath]);

  const year = YEARS.find((y) => y.value === answers.year)?.label;
  const details = [year, answers.major?.trim()].filter(Boolean).join(" · ");

  return (
    <div className="flex items-center gap-3 text-left">
      <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-muted font-semibold text-[18px] uppercase">
        {photo ? (
          // biome-ignore lint/performance/noImgElement: short-lived signed URL
          <img src={photo} alt="" className="size-full object-cover" />
        ) : (
          initials(answers.name)
        )}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-[17px]">
          {answers.name}
        </span>
        {details && (
          <span className="truncate text-[14px] text-muted-foreground">
            {details}
          </span>
        )}
        {school ? (
          <span className="mt-0.5 inline-flex items-center gap-1 font-medium text-[12px] text-verified">
            <BadgeCheck className="size-3.5" aria-hidden />
            Verified {school} student
          </span>
        ) : (
          <span className="mt-0.5 text-[12px] text-muted-foreground">
            Personal account · not verified yet
          </span>
        )}
      </div>
    </div>
  );
}
