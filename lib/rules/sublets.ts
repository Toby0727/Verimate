import { SUBLET_CONFIRM_GRACE_DAYS, SUBLET_STALE_DAYS } from "./constants";
import { daysBetween } from "./time";
import type { Sublet } from "./types";

export type SubletField =
  | "location"
  | "rent"
  | "startDate"
  | "endDate"
  | "dates"
  | "roomType"
  | "furnished"
  | "photos"
  | "roommatesInfo"
  | "onLeaseDeclared";

export function missingSubletFields(fields: Partial<Sublet>): SubletField[] {
  const missing: SubletField[] = [];
  if (!fields.area && !fields.buildingId) missing.push("location");
  if (!fields.rent || fields.rent <= 0) missing.push("rent");
  if (!fields.startDate) missing.push("startDate");
  if (!fields.endDate) missing.push("endDate");
  if (
    fields.startDate &&
    fields.endDate &&
    fields.endDate <= fields.startDate
  ) {
    missing.push("dates");
  }
  if (!fields.roomType) missing.push("roomType");
  if (fields.furnished === null || fields.furnished === undefined) {
    missing.push("furnished");
  }
  if (!fields.photos || fields.photos.length === 0) missing.push("photos");
  if (!fields.roommatesInfo?.trim()) missing.push("roommatesInfo");
  if (fields.onLeaseDeclared !== true) missing.push("onLeaseDeclared");
  return missing;
}

export function subletStatusAt(sublet: Sublet, now: Date): Sublet["status"] {
  if (
    sublet.status === "subleased" ||
    sublet.status === "removed" ||
    sublet.status === "expired"
  ) {
    return sublet.status;
  }
  if (sublet.endDate && new Date(sublet.endDate) < now) return "expired";
  if (
    sublet.staleNotifiedAt &&
    daysBetween(sublet.staleNotifiedAt, now) >= SUBLET_CONFIRM_GRACE_DAYS
  ) {
    return "expired";
  }
  if (daysBetween(sublet.updatedAt, now) >= SUBLET_STALE_DAYS) return "stale";
  return "active";
}

export function isSubletListed(sublet: Sublet, now: Date): boolean {
  const status = subletStatusAt(sublet, now);
  return status === "active" || status === "stale";
}
