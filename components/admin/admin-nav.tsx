"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/admissions", label: "Admissions" },
  { href: "/admin/leases", label: "Leases" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/buildings", label: "Buildings" },
  { href: "/admin/founding", label: "Founding" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="flex gap-1 overflow-x-auto border-b px-2 py-2"
    >
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-sm",
            pathname === l.href
              ? "bg-foreground text-background"
              : "hover:bg-muted",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
