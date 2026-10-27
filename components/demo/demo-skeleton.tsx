export function DemoSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3 p-4" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
          key={i}
          className="h-20 animate-pulse rounded-xl bg-muted"
        />
      ))}
    </div>
  );
}
