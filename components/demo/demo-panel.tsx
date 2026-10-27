"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { PERSONAS } from "@/lib/demo/personas";
import { verifiedCount } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { cn } from "@/lib/utils";

const LANDING: Record<string, string> = {
  visitor: "/",
  "new-user": "/onboarding/birthday",
  admin: "/admin",
};

export function DemoPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const demo = useDemo();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!demo) return null;
  const { world, actions } = demo;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[88%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Demo controls</SheetTitle>
          <SheetDescription>
            Everything here is sample data stored only in this browser.
          </SheetDescription>
        </SheetHeader>

        <section className="flex flex-col gap-2 px-4">
          <h3 className="font-medium text-muted-foreground text-xs uppercase">
            Act as
          </h3>
          {PERSONAS.map((persona) => {
            const active = world.currentPersonaId === persona.id;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => {
                  actions.switchPersona(persona.id);
                  onOpenChange(false);
                  router.push(LANDING[persona.id] ?? "/roommates");
                }}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-3 text-left",
                  active ? "border-primary bg-primary-tint" : "hover:bg-muted",
                )}
              >
                <Check
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    active ? "text-primary" : "invisible",
                  )}
                />
                <span>
                  <span className="block font-medium text-sm">
                    {persona.label}
                  </span>
                  <span className="block text-muted-foreground text-xs">
                    {persona.description}
                  </span>
                </span>
              </button>
            );
          })}
        </section>

        <section className="flex flex-col gap-3 border-t px-4 pt-4">
          <h3 className="font-medium text-muted-foreground text-xs uppercase">
            Sample world
          </h3>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>
              Verified users reached 50
              <span className="block text-muted-foreground text-xs">
                Now {verifiedCount(world)} verified · opens founding invites
              </span>
            </span>
            <Switch
              aria-label="Verified users reached 50"
              checked={world.verifiedCountOverride === "reached50"}
              onCheckedChange={(checked) =>
                actions.setVerifiedCount(checked ? "reached50" : "below50")
              }
            />
          </div>
          {world.currentPersonaId === "member-internal" ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>
                View as free user
                <span className="block text-muted-foreground text-xs">
                  Preview what free members see
                </span>
              </span>
              <Switch
                aria-label="View as free user"
                checked={world.viewAsFree}
                onCheckedChange={(checked) => actions.setViewAsFree(checked)}
              />
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-2 border-t px-4 py-4">
          {confirmReset ? (
            <div className="flex flex-col gap-2 rounded-lg bg-muted p-3 text-sm">
              Reset all sample data and personas to the start?
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    actions.resetDemo();
                    setConfirmReset(false);
                    onOpenChange(false);
                    router.push("/");
                  }}
                >
                  Reset
                </Button>
                <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setConfirmReset(true)}>
              Reset sample data
            </Button>
          )}
          <Link
            href="/about-demo"
            onClick={() => onOpenChange(false)}
            className="text-center text-primary text-sm underline-offset-4 hover:underline"
          >
            About this demo
          </Link>
        </section>
      </SheetContent>
    </Sheet>
  );
}
