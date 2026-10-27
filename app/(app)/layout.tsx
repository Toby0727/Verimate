import { Suspense } from "react";
import { FoundingInvite } from "@/components/membership/founding-invite";
import { BanGate } from "@/components/shell/access-gate";
import { TabBar, TabBarFrame } from "@/components/shell/tab-bar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background pb-20 shadow-sm">
      <BanGate>{children}</BanGate>
      <Suspense fallback={<TabBarFrame />}>
        <TabBar />
      </Suspense>
      <FoundingInvite />
    </div>
  );
}
