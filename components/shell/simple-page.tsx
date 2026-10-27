import type { ReactNode } from "react";
import { PageHeader } from "./page-header";

// Centered phone-width column for pages outside the tab layout.
export function SimplePage({
  title,
  backHref,
  children,
}: {
  title: string;
  backHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background shadow-sm">
      <PageHeader title={title} backHref={backHref} />
      <main className="flex flex-col gap-4 p-4">{children}</main>
    </div>
  );
}
