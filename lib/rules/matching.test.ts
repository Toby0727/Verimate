import { describe, expect, it } from "vitest";
import {
  canUnlock,
  isTopMatch,
  rankedMatches,
  unlocksThisWeek,
} from "./matching";
import {
  emptyDataset,
  makeAccount,
  makeProfile,
  makeVerification,
  NOW,
} from "./test-fixtures";
import { addDays } from "./time";
import type { Dataset, Unlock } from "./types";

// Viewer "me" plus six consenting, listed people t1..t6 with descending scores.
function matchDataset(overrides: Partial<Dataset> = {}): Dataset {
  const ids = ["me", "t1", "t2", "t3", "t4", "t5", "t6"];
  return emptyDataset({
    accounts: ids.map((id) => makeAccount({ id })),
    verifications: ids.map((id) =>
      makeVerification({ id: `v-${id}`, accountId: id }),
    ),
    profiles: ids.map((id) =>
      makeProfile({ accountId: id, aiMatchConsent: true }),
    ),
    matches: ids.slice(1).map((targetId, i) => ({
      viewerId: "me",
      targetId,
      score: 90 - i * 5,
      oneLiner: "Similar habits",
      reasons: [],
    })),
    ...overrides,
  });
}

const unlock = (targetId: string, daysAgo = 0): Unlock => ({
  viewerId: "me",
  targetId,
  unlockedAt: addDays(NOW, -daysAgo),
});

describe("rankedMatches", () => {
  it("sorts by score and drops people without consent", () => {
    const data = matchDataset();
    data.profiles = data.profiles.map((p) =>
      p.accountId === "t2" ? { ...p, aiMatchConsent: false } : p,
    );
    expect(rankedMatches(data, "me", NOW).map((m) => m.targetId)).toEqual([
      "t1",
      "t3",
      "t4",
      "t5",
      "t6",
    ]);
  });

  it("is empty when the viewer has not consented", () => {
    const data = matchDataset();
    data.profiles[0] = { ...data.profiles[0], aiMatchConsent: false };
    expect(rankedMatches(data, "me", NOW)).toEqual([]);
  });
});

describe("canUnlock", () => {
  it("keeps the top 3 for members", () => {
    const data = matchDataset();
    const ranked = rankedMatches(data, "me", NOW);
    expect(isTopMatch(ranked, "t1")).toBe(true);
    expect(isTopMatch(ranked, "t4")).toBe(false);
    expect(canUnlock(data, "me", "t1", NOW)).toEqual({
      ok: false,
      reason: "top-member-only",
    });
  });

  it("allows 3 unlocks a week and refuses the 4th", () => {
    const two = matchDataset({ unlocks: [unlock("t4"), unlock("t5")] });
    expect(canUnlock(two, "me", "t6", NOW)).toEqual({ ok: true });
    const three = matchDataset({
      unlocks: [unlock("t4"), unlock("t5"), unlock("t6")],
    });
    expect(canUnlock(three, "me", "t6", NOW)).toEqual({
      ok: false,
      reason: "weekly-limit",
    });
  });

  it("resets the weekly count on Monday", () => {
    // NOW is a Wednesday; 7 days ago was last week.
    const old = [unlock("t4", 7), unlock("t5", 7), unlock("t6", 7)];
    expect(unlocksThisWeek(old, "me", NOW)).toBe(0);
    expect(canUnlock(matchDataset({ unlocks: old }), "me", "t4", NOW)).toEqual({
      ok: true,
    });
  });

  it("refuses without consent", () => {
    const data = matchDataset();
    data.profiles[0] = { ...data.profiles[0], aiMatchConsent: false };
    expect(canUnlock(data, "me", "t4", NOW)).toEqual({
      ok: false,
      reason: "no-consent",
    });
  });
});
