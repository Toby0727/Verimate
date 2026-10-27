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
  return (
    <header className="sticky top-9 z-20 flex h-12 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className="-ml-2 rounded-md p-1 hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </Link>
      ) : null}
      <h1 className="flex-1 truncate font-semibold text-base">{title}</h1>
      {action}
    </header>
  );
}
