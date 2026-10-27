"use client";

import { GraduationCap, School } from "lucide-react";
import { useRouter } from "next/navigation";
import * as actions from "@/lib/demo/actions";
import { useDemo } from "@/lib/demo/use-demo";
import { ageOn, canProceedWithAge } from "@/lib/rules/verification";
import { cn } from "@/lib/utils";

export function PathChooser() {
  const router = useRouter();
  const demo = useDemo();
  const age = demo?.me?.birthDate ? ageOn(demo.me.birthDate, demo.now) : 0;

  const options = [
    {
      path: "student" as const,
      icon: School,
      title: "Current SU/ESF student",
      body: "Verify with your @syr.edu or @esf.edu email.",
      href: "/onboarding/verify",
    },
    {
      path: "admitted" as const,
      icon: GraduationCap,
      title: "Admitted, starting soon",
      body: "Upload your admission letter. The team reviews it within 48 hours.",
      href: "/onboarding/admitted",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {options.map(({ path, icon: Icon, title, body, href }) => {
        const allowed = canProceedWithAge(age, path);
        return (
          <button
            key={path}
            type="button"
            disabled={!allowed}
            onClick={() => {
              if (actions.choosePath(path).ok) router.push(href);
            }}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left",
              allowed ? "hover:bg-muted" : "cursor-not-allowed opacity-50",
            )}
          >
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <span className="block font-medium">{title}</span>
              <span className="block text-muted-foreground text-sm">
                {body}
              </span>
              {!allowed ? (
                <span className="mt-1 block text-destructive text-xs">
                  Under 18? Only admitted students can join, after the team
                  verifies the admission.
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
