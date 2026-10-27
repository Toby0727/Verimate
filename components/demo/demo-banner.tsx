"use client";

import { FlaskConical, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/lib/demo/use-demo";
import { DemoPanel } from "./demo-panel";

export function DemoBanner() {
  const demo = useDemo();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="sticky top-0 z-40 flex h-9 w-full items-center justify-center gap-2 bg-amber-100 px-3 text-amber-900 text-xs"
      >
        <FlaskConical className="size-3.5 shrink-0" />
        <span className="truncate">
          <strong>Demo</strong> · Sample data, nothing here is real
          {demo ? ` · ${demo.persona.label}` : ""}
        </span>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-200/70 px-2 py-0.5 font-medium">
          <SlidersHorizontal className="size-3" />
          Controls
        </span>
      </button>
      <DemoPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
