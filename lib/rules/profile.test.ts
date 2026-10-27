import { describe, expect, it } from "vitest";
import {
  isListed,
  isProfileComplete,
  missingRequiredFields,
  profilePhotos,
  shouldAutoPause,
} from "./profile";
import {
  makeAccount,
  makeProfile,
  makeVerification,
  NOW,
} from "./test-fixtures";
import { addDays } from "./time";

describe("required fields", () => {
  it("passes a complete profile", () => {
    expect(missingRequiredFields(makeProfile())).toEqual([]);
    expect(isProfileComplete(makeProfile())).toBe(true);
  });

  it("lists every missing required field", () => {
    expect(
      missingRequiredFields(makeProfile({ photo: null, budgetMax: null })),
    ).toEqual(["photo", "budgetMax"]);
  });

  it("requires group sizes when looking as a group", () => {
    expect(
      missingRequiredFields(
        makeProfile({ housingStatus: "group", groupHave: 2, groupNeed: null }),
      ),
    ).toEqual(["groupNeed"]);
  });
});

describe("profile photos", () => {
  it("puts the required photo first and caps the total at 6", () => {
    const extraPhotos = ["b", "c", "d", "e", "f", "g"];
    expect(profilePhotos(makeProfile({ photo: "a", extraPhotos }))).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
    ]);
  });

  it("skips a missing required photo", () => {
    expect(
      profilePhotos(makeProfile({ photo: null, extraPhotos: ["b"] })),
    ).toEqual(["b"]);
  });
});

describe("auto pause", () => {
  it("pauses after 30 days without activity", () => {
    const active = makeAccount({ lastActiveAt: addDays(NOW, -29) });
    const inactive = makeAccount({ lastActiveAt: addDays(NOW, -30) });
    expect(shouldAutoPause(active, NOW)).toBe(false);
    expect(shouldAutoPause(inactive, NOW)).toBe(true);
  });
});

describe("isListed", () => {
  const listed = () =>
    isListed(makeAccount(), makeProfile(), makeVerification(), NOW);

  it("lists an active, complete, verified user", () => {
    expect(listed()).toBe(true);
  });

  it("hides paused, inactive, incomplete, expired and banned users", () => {
    expect(
      isListed(
        makeAccount(),
        makeProfile({ searchStatus: "paused" }),
        makeVerification(),
        NOW,
      ),
    ).toBe(false);
    expect(
      isListed(
        makeAccount({ lastActiveAt: addDays(NOW, -31) }),
        makeProfile(),
        makeVerification(),
        NOW,
      ),
    ).toBe(false);
    expect(
      isListed(
        makeAccount(),
        makeProfile({ gender: null }),
        makeVerification(),
        NOW,
      ),
    ).toBe(false);
    expect(
      isListed(
        makeAccount(),
        makeProfile(),
        makeVerification({ expiresAt: addDays(NOW, -1) }),
        NOW,
      ),
    ).toBe(false);
    expect(
      isListed(
        makeAccount({ status: "banned" }),
        makeProfile(),
        makeVerification(),
        NOW,
      ),
    ).toBe(false);
  });
});
