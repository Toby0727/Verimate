import {
  DAILY_REQUEST_LIMIT,
  REQUEST_COOLDOWN_AFTER_DELETE_DAYS,
  REQUEST_EXPIRY_DAYS,
} from "./constants";
import { isProfileComplete } from "./profile";
import { daysBetween, startOfDay } from "./time";
import type { Dataset, MessageRequest } from "./types";
import { isVerificationValid } from "./verification";
import { isHiddenFor } from "./visibility";

export type SendRequestRefusal =
  | "unverified"
  | "incomplete"
  | "blocked"
  | "duplicate"
  | "cooldown"
  | "daily-limit";

export function isRequestExpired(req: MessageRequest, now: Date): boolean {
  return (
    req.status === "pending" &&
    daysBetween(req.createdAt, now) >= REQUEST_EXPIRY_DAYS
  );
}

export function effectiveStatus(
  req: MessageRequest,
  now: Date,
): MessageRequest["status"] {
  return isRequestExpired(req, now) ? "expired" : req.status;
}

export function requestsSentToday(
  data: Dataset,
  fromId: string,
  now: Date,
): number {
  const dayStart = startOfDay(now);
  return data.messageRequests.filter(
    (r) => r.fromId === fromId && new Date(r.createdAt) >= dayStart,
  ).length;
}

export function canSendRequest(
  data: Dataset,
  fromId: string,
  toId: string,
  now: Date,
): { ok: true } | { ok: false; reason: SendRequestRefusal } {
  const verification = data.verifications.find((v) => v.accountId === fromId);
  if (!isVerificationValid(verification, now)) {
    return { ok: false, reason: "unverified" };
  }

  const fromProfile = data.profiles.find((p) => p.accountId === fromId);
  const toProfile = data.profiles.find((p) => p.accountId === toId);
  if (
    !fromProfile ||
    !toProfile ||
    !isProfileComplete(fromProfile) ||
    !isProfileComplete(toProfile)
  ) {
    return { ok: false, reason: "incomplete" };
  }

  if (isHiddenFor(fromId, toId, data.blocks)) {
    return { ok: false, reason: "blocked" };
  }

  const between = data.messageRequests.filter(
    (r) =>
      (r.fromId === fromId && r.toId === toId) ||
      (r.fromId === toId && r.toId === fromId),
  );
  const open = between.some((r) => {
    const status = effectiveStatus(r, now);
    return status === "pending" || status === "accepted";
  });
  if (open) return { ok: false, reason: "duplicate" };

  const inCooldown = between.some(
    (r) =>
      r.fromId === fromId &&
      r.status === "deleted" &&
      r.respondedAt !== null &&
      daysBetween(r.respondedAt, now) < REQUEST_COOLDOWN_AFTER_DELETE_DAYS,
  );
  if (inCooldown) return { ok: false, reason: "cooldown" };

  if (requestsSentToday(data, fromId, now) >= DAILY_REQUEST_LIMIT) {
    return { ok: false, reason: "daily-limit" };
  }

  return { ok: true };
}
