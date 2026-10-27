import { describe, expect, it } from "vitest";
import {
  makeProfile,
  makeSublet,
  makeVerification,
  NOW,
  twoUserDataset,
} from "./test-fixtures";
import { addDays } from "./time";
import {
  buildingMembers,
  canSeeExactAddress,
  isBlurredForVisitor,
  isHiddenFor,
} from "./visibility";

const block = {
  blockerId: "a1",
  blockedId: "a2",
  createdAt: NOW.toISOString(),
};

describe("isHiddenFor", () => {
  it("hides both directions after a block", () => {
    expect(isHiddenFor("a1", "a2", [block])).toBe(true);
    expect(isHiddenFor("a2", "a1", [block])).toBe(true);
    expect(isHiddenFor("a1", "a3", [block])).toBe(false);
    expect(isHiddenFor(null, "a2", [block])).toBe(false);
  });
});

describe("isBlurredForVisitor", () => {
  it("blurs only for signed-out visitors", () => {
    expect(isBlurredForVisitor(null)).toBe(true);
    expect(isBlurredForVisitor("a1")).toBe(false);
  });
});

describe("canSeeExactAddress", () => {
  const sublet = makeSublet({ authorId: "a2" });
  const conversation = {
    id: "c1",
    participantIds: ["a1", "a2"] as [string, string],
    requestId: "r1",
    createdAt: NOW.toISOString(),
  };

  it("shows the address to the author and connected people only", () => {
    expect(canSeeExactAddress("a2", sublet, [])).toBe(true);
    expect(canSeeExactAddress("a1", sublet, [])).toBe(false);
    expect(canSeeExactAddress("a1", sublet, [conversation])).toBe(true);
    expect(canSeeExactAddress(null, sublet, [conversation])).toBe(false);
  });
});

describe("buildingMembers", () => {
  const inBuilding = (overrides = {}) =>
    makeProfile({ buildingId: "b1", showInBuilding: true, ...overrides });

  it("lists only opted-in, listed people in the building", () => {
    const data = twoUserDataset({
      profiles: [inBuilding(), inBuilding({ accountId: "a2" })],
    });
    expect(
      buildingMembers(data, "b1", "a1", NOW).map((p) => p.accountId),
    ).toEqual(["a1", "a2"]);

    const optedOut = twoUserDataset({
      profiles: [
        inBuilding(),
        inBuilding({ accountId: "a2", showInBuilding: false }),
      ],
    });
    expect(buildingMembers(optedOut, "b1", "a1", NOW)).toHaveLength(1);
  });

  it("hides blocked people and shows nothing to unverified viewers", () => {
    const blocked = twoUserDataset({
      profiles: [inBuilding(), inBuilding({ accountId: "a2" })],
      blocks: [block],
    });
    expect(buildingMembers(blocked, "b1", "a1", NOW)).toHaveLength(1);

    const unverified = twoUserDataset({
      profiles: [inBuilding(), inBuilding({ accountId: "a2" })],
      verifications: [
        makeVerification({ expiresAt: addDays(NOW, -1) }),
        makeVerification({ id: "v2", accountId: "a2" }),
      ],
    });
    expect(buildingMembers(unverified, "b1", "a1", NOW)).toEqual([]);
  });
});
