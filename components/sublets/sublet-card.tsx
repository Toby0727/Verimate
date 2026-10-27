import { BadgeCheck, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SampleBadge } from "@/components/demo/sample-badge";
import { formatRange, labelOf, ROOM_TYPES } from "@/components/shell/labels";
import type { Sublet } from "@/lib/rules/types";
import { cn } from "@/lib/utils";

export function LeaseBadge({ status }: { status: Sublet["lease"]["status"] }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-verified-tint px-2 py-0.5 font-medium text-verified text-xs">
        <BadgeCheck className="size-3.5" /> Lease verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 text-xs">
        <Clock className="size-3.5" /> Lease under review
      </span>
    );
  }
  return null;
}

export function SubletCard({
  sublet,
  location,
  blurred,
}: {
  sublet: Sublet;
  location: string;
  blurred: boolean;
}) {
  return (
    <Link
      href={`/sublets/${sublet.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-card transition-colors hover:bg-muted/50"
    >
      <div className="relative aspect-[16/9] bg-muted">
        {sublet.photos[0] ? (
          <Image
            src={sublet.photos[0]}
            alt=""
            fill
            sizes="(max-width: 520px) 100vw, 520px"
            className={cn("object-cover", blurred && "scale-105 blur-md")}
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate font-semibold">{sublet.title}</span>
          <SampleBadge />
        </div>
        <p className="text-sm">
          <span className="font-semibold">${sublet.rent}</span>
          <span className="text-muted-foreground">/mo · {location}</span>
        </p>
        <p className="text-muted-foreground text-sm">
          {formatRange(sublet.startDate, sublet.endDate)} ·{" "}
          {labelOf(ROOM_TYPES, sublet.roomType)} ·{" "}
          {sublet.furnished ? "Furnished" : "Unfurnished"}
        </p>
        <LeaseBadge status={sublet.lease.status} />
      </div>
    </Link>
  );
}
