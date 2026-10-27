import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: ReactNode;
}) {
  // Tab roots get a large title; pages deeper in get a compact bar.
  if (!backHref) {
    return (
      <header className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-1">
        <h1 className="truncate font-bold text-[26px] leading-tight tracking-tight">
          {title}
        </h1>
        {action}
      </header>
    );
  }
  return (
    <header className="sticky top-9 z-20 flex h-12 items-center gap-2 bg-background/95 px-4 backdrop-blur">
      <Link
        href={backHref}
        aria-label="Back"
        className="-ml-2 rounded-md p-1 hover:bg-muted"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <h1 className="flex-1 truncate font-semibold text-base">{title}</h1>
      {action}
    </header>
  );
}
