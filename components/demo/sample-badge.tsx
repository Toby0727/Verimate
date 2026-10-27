import { cn } from "@/lib/utils";

// Marks content that comes from the sample world.
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 shrink-0 items-center rounded-sm border border-dashed border-amber-500/60 bg-amber-50 px-1 font-medium text-[10px] text-amber-700 uppercase tracking-wide",
        className,
      )}
    >
      Sample
    </span>
  );
}
