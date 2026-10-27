import { FOUNDING_MIN_ACCOUNT_AGE_DAYS, FOUNDING_SEATS } from "./constants";
import { isProfileComplete } from "./profile";
import { daysBetween } from "./time";
import type { Dataset, Membership } from "./types";
import { isVerificationValid } from "./verification";

export type FoundingContext = {
  // Whether the verified-user count has reached FOUNDING_THRESHOLD_VERIFIED.
  thresholdReached: boolean;
  seatsTakenElsewhere: number;
};

export type FoundingGap =
  | "threshold"
  | "already-member"
  | "verified"
  | "profile"
  | "questionnaire"
  | "account-age"
  | "reports"
  | "seats";

export function foundingSeatsUsed(data: Dataset, ctx: FoundingContext): number {
  return (
    ctx.seatsTakenElsewhere +
    data.memberships.filter((m) => m.kind === "founding").length
  );
}

export function foundingSeatsLeft(data: Dataset, ctx: FoundingContext): number {
  return Math.max(0, FOUNDING_SEATS - foundingSeatsUsed(data, ctx));
}

export function foundingEligibility(
  data: Dataset,
  accountId: string,
  now: Date,
  ctx: FoundingContext,
): { eligible: boolean; missing: FoundingGap[] } {
  const missing: FoundingGap[] = [];
  const account = data.accounts.find((a) => a.id === accountId);
  const profile = data.profiles.find((p) => p.accountId === accountId);
  const membership = data.memberships.find((m) => m.accountId === accountId);

  if (!ctx.thresholdReached) missing.push("threshold");
  if (membership && membership.kind !== "free") missing.push("already-member");
  if (
    !isVerificationValid(
      data.verifications.find((v) => v.accountId === accountId),
      now,
    )
  ) {
    missing.push("verified");
  }
  if (!profile || !isProfileComplete(profile)) missing.push("profile");
  if (!profile?.questionnaire) missing.push("questionnaire");
  if (
    !account ||
    daysBetween(account.createdAt, now) < FOUNDING_MIN_ACCOUNT_AGE_DAYS
  ) {
    missing.push("account-age");
  }
  const ownSublets = new Set(
    data.sublets.filter((s) => s.authorId === accountId).map((s) => s.id),
  );
  const actioned = data.reports.some(
    (r) =>
      r.status === "resolved" &&
      r.resolution !== "dismissed" &&
      ((r.target.type === "account" && r.target.id === accountId) ||
        (r.target.type === "sublet" && ownSublets.has(r.target.id))),
  );
  if (actioned) missing.push("reports");
  if (foundingSeatsLeft(data, ctx) === 0) missing.push("seats");

  return { eligible: missing.length === 0, missing };
}

export type Entitlement = "aiFull" | "alerts" | "boost" | "whoViewed";

export const ALL_ENTITLEMENTS: Entitlement[] = [
  "aiFull",
  "alerts",
  "boost",
  "whoViewed",
];

// Internal accounts can preview the free experience with viewAsFree.
export function entitlements(
  membership: Membership | undefined,
  viewAsFree: boolean,
): Set<Entitlement> {
  if (!membership || membership.kind === "free") return new Set();
  if (membership.kind === "internal" && viewAsFree) return new Set();
  return new Set(ALL_ENTITLEMENTS);
}
