import {
  BadgeCheck,
  Check,
  Clock,
  GraduationCap,
  TriangleAlert,
} from "lucide-react";
import type { Badge } from "@/lib/rules/verification";
import { cn } from "@/lib/utils";

const LABELS: Record<Badge, string> = {
  student: "Verified student",
  "admitted-pending": "Admitted · under review",
  admitted: "Verified admit",
  graduate: "Graduate",
  expired: "Verification expired",
  rejected: "Not verified",
  none: "Not verified",
};

export function VerificationBadge({
  badge,
  className,
}: {
  badge: Badge;
  className?: string;
}) {
  const verified =
    badge === "student" || badge === "admitted" || badge === "graduate";
  const Icon = verified
    ? badge === "graduate"
      ? GraduationCap
      : BadgeCheck
    : badge === "admitted-pending"
      ? Clock
      : TriangleAlert;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs",
        verified
          ? "bg-verified-tint text-verified"
          : badge === "admitted-pending"
            ? "bg-amber-50 text-amber-700"
            : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {LABELS[badge]}
    </span>
  );
}

// Compact icon-only version for cards and photo overlays.
export function VerifiedMark({
  badge,
  className,
}: {
  badge: Badge;
  className?: string;
}) {
  if (badge === "admitted-pending") {
    return (
      <Clock
        role="img"
        aria-label={LABELS[badge]}
        className={cn("size-4 shrink-0 text-amber-600", className)}
      />
    );
  }
  if (badge !== "student" && badge !== "admitted" && badge !== "graduate") {
    return null;
  }
  return (
    <span
      role="img"
      aria-label={LABELS[badge]}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-verified-fill text-white",
        className,
      )}
    >
      <Check className="size-[68%]" strokeWidth={3.5} />
    </span>
  );
}

export function verificationLabel(badge: Badge) {
  return LABELS[badge];
}

export function FoundingBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-foreground/25 px-2 py-0.5 font-medium text-foreground text-xs",
        className,
      )}
    >
      ★ Founding member
    </span>
  );
}
