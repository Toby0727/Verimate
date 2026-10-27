import { describe, expect, it } from "vitest";
import {
  entitlements,
  foundingEligibility,
  foundingSeatsLeft,
} from "./membership";
import {
  makeAccount,
  makeProfile,
  makeVerification,
  NOW,
  twoUserDataset,
} from "./test-fixtures";
import { addDays } from "./time";
import type { Dataset, Membership, Questionnaire } from "./types";

const QUESTIONNAIRE: Questionnaire = {
  guests: "rarely",
  noise: "quiet",
  cooking: "daily",
  study: "home",
  sharing: "share-basics",
};

const membership = (kind: Membership["kind"]): Membership => ({
  accountId: "a1",
  kind,
  startedAt: "2026-10-01T00:00:00.000Z",
  endsAt: null,
  lifetimeDiscount: null,
});

describe("entitlements", () => {
  it("gives free users nothing", () => {
    expect(entitlements(undefined, false).size).toBe(0);
    expect(entitlements(membership("free"), false).size).toBe(0);
  });

  it("gives paid, founding and internal members everything", () => {
    for (const kind of ["founding", "monthly", "season", "internal"] as const) {
      expect(entitlements(membership(kind), false).size).toBe(4);
    }
  });

  it("lets internal accounts preview the free experience", () => {
    expect(entitlements(membership("internal"), true).size).toBe(0);
    expect(entitlements(membership("season"), true).size).toBe(4);
  });
});

describe("foundingEligibility", () => {
  const ctx = { thresholdReached: true, seatsTakenElsewhere: 0 };
  const base = () =>
    twoUserDataset({
      accounts: [makeAccount({ createdAt: addDays(NOW, -10) })],
      profiles: [makeProfile({ questionnaire: QUESTIONNAIRE })],
    });

  it("accepts a complete, verified, established account", () => {
    expect(foundingEligibility(base(), "a1", NOW, ctx)).toEqual({
      eligible: true,
      missing: [],
    });
  });

  it("names each gap on its own", () => {
    const gaps = (data: Dataset, c = ctx) =>
      foundingEligibility(data, "a1", NOW, c).missing;

    expect(gaps(base(), { ...ctx, thresholdReached: false })).toEqual([
      "threshold",
    ]);
    expect(gaps({ ...base(), memberships: [membership("season")] })).toEqual([
      "already-member",
    ]);
    expect(
      gaps({
        ...base(),
        verifications: [makeVerification({ expiresAt: addDays(NOW, -1) })],
      }),
    ).toEqual(["verified"]);
    expect(
      gaps({
        ...base(),
        profiles: [makeProfile({ questionnaire: QUESTIONNAIRE, photo: null })],
      }),
    ).toEqual(["profile"]);
    expect(gaps({ ...base(), profiles: [makeProfile()] })).toEqual([
      "questionnaire",
    ]);
    expect(
      gaps({
        ...base(),
        accounts: [makeAccount({ createdAt: addDays(NOW, -3) })],
      }),
    ).toEqual(["account-age"]);
    expect(
      gaps({
        ...base(),
        reports: [
          {
            id: "rep1",
            reporterId: "a2",
            target: { type: "account", id: "a1" },
            reason: "Scam",
            note: null,
            status: "resolved",
            resolution: "warned",
            createdAt: NOW.toISOString(),
            resolvedAt: NOW.toISOString(),
          },
        ],
      }),
    ).toEqual(["reports"]);
  });

  it("closes when all 30 seats are taken", () => {
    expect(foundingSeatsLeft(base(), { ...ctx, seatsTakenElsewhere: 29 })).toBe(
      1,
    );
    expect(
      foundingEligibility(base(), "a1", NOW, {
        ...ctx,
        seatsTakenElsewhere: 29,
      }).eligible,
    ).toBe(true);
    expect(
      foundingEligibility(base(), "a1", NOW, {
        ...ctx,
        seatsTakenElsewhere: 30,
      }).missing,
    ).toEqual(["seats"]);
  });
});
