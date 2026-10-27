"use client";

import { Home, MessageCircle, Sparkles, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemo } from "@/lib/demo/use-demo";
import { effectiveStatus } from "@/lib/rules/requests";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/roommates", label: "Roommates", icon: Users },
  { href: "/for-you", label: "For You", icon: Sparkles },
  { href: "/sublets", label: "Sublets", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/me", label: "Me", icon: User },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const demo = useDemo();
  const pending = demo?.meId
    ? demo.world.messageRequests.filter(
        (r) =>
          r.toId === demo.meId && effectiveStatus(r, demo.now) === "pending",
      ).length
    : 0;

  return (
    <TabBarFrame>
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2 font-medium text-[11px]",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {label}
            {href === "/messages" && pending > 0 ? (
              <span className="absolute top-1 left-1/2 ml-2 rounded-full bg-primary px-1.5 font-semibold text-[10px] text-primary-foreground">
                {pending}
              </span>
            ) : null}
          </Link>
        );
      })}
    </TabBarFrame>
  );
}

export function TabBarFrame({ children }: { children?: React.ReactNode }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-16 max-w-[520px] border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      {children}
    </nav>
  );
}
