import { cn } from "@/lib/utils";

// Marks content that comes from the sample world.
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] shrink-0 items-center rounded-full bg-black/40 px-1.5 font-medium text-[10px] text-white backdrop-blur-sm",
        className,
      )}
    >
      Sample
    </span>
  );
}
