import { Suspense } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { SampleBadge } from "@/components/demo/sample-badge";
import { AccessGate } from "@/components/shell/access-gate";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col bg-background shadow-sm">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <span className="font-bold text-primary">Verimate</span>
        <span className="font-semibold">Team admin</span>
        <SampleBadge />
      </header>
      <AccessGate require="admin">
        <Suspense fallback={<div className="h-12 border-b" />}>
          <AdminNav />
        </Suspense>
        <main className="flex flex-col gap-4 p-4">{children}</main>
      </AccessGate>
    </div>
  );
}
