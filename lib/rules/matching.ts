import { TOP_MATCHES_MEMBER_ONLY, WEEKLY_FREE_UNLOCKS } from "./constants";
import { isListed } from "./profile";
import { startOfWeek } from "./time";
import type { Dataset, Match, Unlock } from "./types";
import { isHiddenFor } from "./visibility";

export type UnlockRefusal =
  | "no-consent"
  | "top-member-only"
  | "weekly-limit"
  | "not-found";

function hasConsent(data: Dataset, accountId: string): boolean {
  return (
    data.profiles.find((p) => p.accountId === accountId)?.aiMatchConsent ===
    true
  );
}

// Matches shown in For You: both people consented and the other is listed.
export function rankedMatches(
  data: Dataset,
  viewerId: string,
  now: Date,
): Match[] {
  if (!hasConsent(data, viewerId)) return [];
  return data.matches
    .filter(
      (m) =>
        m.viewerId === viewerId &&
        hasConsent(data, m.targetId) &&
        !isHiddenFor(viewerId, m.targetId, data.blocks) &&
        isListed(
          data.accounts.find((a) => a.id === m.targetId),
          data.profiles.find((p) => p.accountId === m.targetId),
          data.verifications.find((v) => v.accountId === m.targetId),
          now,
        ),
    )
    .sort((a, b) => b.score - a.score);
}

export function isTopMatch(ranked: Match[], targetId: string): boolean {
  const index = ranked.findIndex((m) => m.targetId === targetId);
  return index !== -1 && index < TOP_MATCHES_MEMBER_ONLY;
}

export function unlocksThisWeek(
  unlocks: Unlock[],
  viewerId: string,
  now: Date,
): number {
  const weekStart = startOfWeek(now);
  return unlocks.filter(
    (u) => u.viewerId === viewerId && new Date(u.unlockedAt) >= weekStart,
  ).length;
}

export function isUnlocked(
  unlocks: Unlock[],
  viewerId: string,
  targetId: string,
): boolean {
  return unlocks.some(
    (u) => u.viewerId === viewerId && u.targetId === targetId,
  );
}

export function canUnlock(
  data: Dataset,
  viewerId: string,
  targetId: string,
  now: Date,
): { ok: true } | { ok: false; reason: UnlockRefusal } {
  if (!hasConsent(data, viewerId)) return { ok: false, reason: "no-consent" };
  const ranked = rankedMatches(data, viewerId, now);
  if (!ranked.some((m) => m.targetId === targetId)) {
    return { ok: false, reason: "not-found" };
  }
  if (isTopMatch(ranked, targetId)) {
    return { ok: false, reason: "top-member-only" };
  }
  if (unlocksThisWeek(data.unlocks, viewerId, now) >= WEEKLY_FREE_UNLOCKS) {
    return { ok: false, reason: "weekly-limit" };
  }
  return { ok: true };
}
