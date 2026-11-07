import { describe, expect, it } from "vitest";
import {
  addCustomHobby,
  decodeAbroadPlans,
  decodeCustomHobbies,
  EMPTY_ANSWERS,
  encodeAbroadPlans,
  encodeCustomHobbies,
  firstOpenStep,
  isComplete,
  isMajorOk,
  isStepDone,
  normalizeReferralCode,
  normalizeSource,
  raffleEntries,
  raffleWeight,
  removeCustomHobby,
  stepsLeft,
  toggle,
  toggleAbroad,
  toggleArea,
  type WaitlistAnswers,
} from "./waitlist";

const COMPLETE: WaitlistAnswers = {
  name: "Alex Kim",
  photoPath: null,
  referredBy: null,
  gender: "woman",
  year: "junior",
  major: "Information Management",
  budget: ["800-1000"],
  areas: ["university-hill"],
  studyAbroad: "no",
  studyAbroadPlans: null,
  subletOutTerms: [],
  currentHome: null,
  subletInTerms: ["summer-2027"],
  roommateTerms: ["fall-2027"],
  drinking: "socially",
  smoking: "no",
  cannabis: "never",
  greekLife: "no",
  pets: "okay",
  sleep: "late",
  cleanliness: "tidy",
  guests: "sometimes",
  hobbies: ["gym"],
  customHobbies: null,
};

describe("stepsLeft", () => {
  it("counts every step for a new student", () => {
    // The last step (photo, major, referral code) is all optional.
    expect(stepsLeft(EMPTY_ANSWERS)).toBe(6);
    expect(firstOpenStep(EMPTY_ANSWERS)).toBe("about");
  });

  it("is zero once every answer is in", () => {
    expect(stepsLeft(COMPLETE)).toBe(0);
    expect(isComplete(COMPLETE)).toBe(true);
    expect(firstOpenStep(COMPLETE)).toBeNull();
  });

  it("resumes at the first unanswered step", () => {
    expect(firstOpenStep({ ...COMPLETE, studyAbroad: null })).toBe("abroad");
    expect(stepsLeft({ ...COMPLETE, studyAbroad: null })).toBe(1);
  });
});

describe("isStepDone", () => {
  it("needs a non-blank name", () => {
    expect(isStepDone("about", { ...COMPLETE, name: " " })).toBe(false);
    expect(isStepDone("about", { ...COMPLETE, name: null })).toBe(false);
  });

  it("needs a term picked, but no longer where", () => {
    expect(
      isStepDone("abroad", {
        ...COMPLETE,
        studyAbroad: "fall-2027",
        studyAbroadPlans: [{ term: "fall-2027", place: null }],
      }),
    ).toBe(true);
    expect(
      isStepDone("abroad", {
        ...COMPLETE,
        studyAbroad: "fall-2027",
        studyAbroadPlans: [],
      }),
    ).toBe(false);
    expect(
      isStepDone("abroad", {
        ...COMPLETE,
        studyAbroad: "fall-2027",
        studyAbroadPlans: [{ term: "fall-2027", place: "london" }],
      }),
    ).toBe(true);
    expect(isStepDone("abroad", { ...COMPLETE, studyAbroad: "not-sure" })).toBe(
      true,
    );
  });

  it("needs a gender", () => {
    expect(isStepDone("about", { ...COMPLETE, gender: null })).toBe(false);
  });

  it("needs at least one budget", () => {
    expect(isStepDone("place", { ...COMPLETE, budget: [] })).toBe(false);
    expect(
      isStepDone("place", { ...COMPLETE, budget: ["600-800", "800-1000"] }),
    ).toBe(true);
  });

  it("needs Greek life and pets on the lifestyle step", () => {
    expect(isStepDone("lifestyle", { ...COMPLETE, greekLife: null })).toBe(
      false,
    );
    expect(isStepDone("lifestyle", { ...COMPLETE, pets: null })).toBe(false);
  });

  it("doesn't need a photo", () => {
    expect(isStepDone("profile", { ...COMPLETE, photoPath: null })).toBe(true);
  });

  it("needs a year", () => {
    expect(isStepDone("about", { ...COMPLETE, year: null })).toBe(false);
  });

  it("treats the major as optional", () => {
    expect(isComplete({ ...COMPLETE, major: null })).toBe(true);
    expect(isStepDone("profile", { ...COMPLETE, major: "   " })).toBe(true);
    expect(isStepDone("profile", { ...COMPLETE, major: "x".repeat(81) })).toBe(
      false,
    );
    expect(isMajorOk("=HYPERLINK()")).toBe(false);
  });

  it("treats an empty term list as answered (not needed)", () => {
    expect(isStepDone("timing", COMPLETE)).toBe(true);
    expect(isStepDone("timing", { ...COMPLETE, subletOutTerms: null })).toBe(
      false,
    );
  });

  it("needs at least one area", () => {
    expect(isStepDone("place", { ...COMPLETE, areas: [] })).toBe(false);
  });
});

describe("toggleArea", () => {
  it("adds and removes areas", () => {
    expect(toggleArea(null, "westcott")).toEqual(["westcott"]);
    expect(toggleArea(["westcott"], "westcott")).toEqual([]);
  });

  it("keeps 'not sure' on its own", () => {
    expect(toggleArea(["westcott", "euclid"], "not-sure")).toEqual([
      "not-sure",
    ]);
    expect(toggleArea(["not-sure"], "euclid")).toEqual(["euclid"]);
  });
});

describe("raffleEntries", () => {
  it("is zero until the survey is finished", () => {
    expect(raffleEntries({ ...COMPLETE, cannabis: null })).toBe(0);
  });

  it("gives one entry for finishing and one more for a photo", () => {
    expect(raffleEntries(COMPLETE)).toBe(1);
    expect(raffleEntries({ ...COMPLETE, photoPath: "u/photo" })).toBe(2);
  });
});

describe("toggle", () => {
  it("adds a missing value and removes a present one", () => {
    expect(toggle(null, "a")).toEqual(["a"]);
    expect(toggle(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("study abroad plans", () => {
  it("adds terms in calendar order and keeps the earliest as the answer", () => {
    const one = toggleAbroad(null, "spring-2028");
    const two = toggleAbroad(one.studyAbroadPlans, "fall-2027");
    expect(two.studyAbroad).toBe("fall-2027");
    expect(two.studyAbroadPlans?.map((p) => p.term)).toEqual([
      "fall-2027",
      "spring-2028",
    ]);
  });

  it("removes a term and clears when none are left", () => {
    const one = toggleAbroad(null, "fall-2027");
    expect(toggleAbroad(one.studyAbroadPlans, "fall-2027")).toEqual({
      studyAbroad: null,
      studyAbroadPlans: null,
    });
  });

  it("drops every term for No plans", () => {
    const one = toggleAbroad(null, "fall-2027");
    expect(toggleAbroad(one.studyAbroadPlans, "no")).toEqual({
      studyAbroad: "no",
      studyAbroadPlans: null,
    });
  });

  it("round-trips through storage, keeping places from older answers", () => {
    const plans = [
      { term: "fall-2027", place: null },
      { term: "spring-2028", place: "seoul" },
    ] as const;
    expect(encodeAbroadPlans([...plans])).toEqual([
      "fall-2027",
      "spring-2028:seoul",
    ]);
    expect(decodeAbroadPlans(encodeAbroadPlans([...plans]))).toEqual(plans);
  });
});

describe("referrals", () => {
  it("cleans up a typed or pasted code", () => {
    expect(normalizeReferralCode(" 3f9-a2c9z ")).toBe("3F9A2C");
  });

  it("blocks the last step only while a code is half typed", () => {
    expect(isStepDone("profile", { ...COMPLETE, referredBy: "3F9" })).toBe(
      false,
    );
    expect(isStepDone("profile", { ...COMPLETE, referredBy: "3F9A2C" })).toBe(
      true,
    );
  });

  it("raises the chance 5% for a school account and 10% per friend", () => {
    expect(raffleWeight(1, false, 0)).toBe(1);
    expect(raffleWeight(1, true, 0)).toBe(1.05);
    expect(raffleWeight(1, false, 3)).toBe(1.3);
    expect(raffleWeight(2, true, 2)).toBe(2.5);
  });
});

describe("living-together habits", () => {
  it("are required to finish the lifestyle step", () => {
    expect(isStepDone("lifestyle", COMPLETE)).toBe(true);
    expect(isStepDone("lifestyle", { ...COMPLETE, sleep: null })).toBe(false);
    expect(isStepDone("lifestyle", { ...COMPLETE, cleanliness: null })).toBe(
      false,
    );
    expect(isStepDone("lifestyle", { ...COMPLETE, guests: null })).toBe(false);
  });
});

describe("normalizeSource", () => {
  it("keeps clean tags", () => {
    expect(normalizeSource("ig-story")).toBe("ig-story");
    expect(normalizeSource("slocum-gym-rat")).toBe("slocum-gym-rat");
  });

  it("lowercases and replaces anything else with dashes", () => {
    expect(normalizeSource("IG Story!")).toBe("ig-story");
    expect(normalizeSource("  slocum__2F  ")).toBe("slocum-2f");
  });

  it("caps the length and drops empty tags", () => {
    expect(normalizeSource("a".repeat(60))).toHaveLength(40);
    expect(normalizeSource(`${"a".repeat(39)}-b`)).toBe("a".repeat(39));
    expect(normalizeSource("!!!")).toBeNull();
    expect(normalizeSource("")).toBeNull();
    expect(normalizeSource(null)).toBeNull();
  });
});

describe("where they live now", () => {
  it("is no longer asked", () => {
    expect(
      isStepDone("timing", { ...COMPLETE, subletOutTerms: ["spring-2027"] }),
    ).toBe(true);
  });
});

describe("hobbies", () => {
  it("need at least one, listed or their own", () => {
    expect(isStepDone("hobbies", { ...COMPLETE, hobbies: [] })).toBe(false);
    expect(
      isStepDone("hobbies", {
        ...COMPLETE,
        hobbies: [],
        customHobbies: [{ icon: "tent", label: "Camping" }],
      }),
    ).toBe(true);
  });

  it("adds a hobby of their own, cleaned up", () => {
    const result = addCustomHobby(null, "tent", "  Winter   camping ");
    expect(result).toEqual({
      ok: true,
      list: [{ icon: "tent", label: "Winter camping" }],
    });
  });

  it("refuses empty, long, formula-like and repeated hobbies", () => {
    const one = [{ icon: "star" as const, label: "Camping" }];
    expect(addCustomHobby(null, "star", "   ")).toEqual({
      ok: false,
      reason: "empty",
    });
    expect(addCustomHobby(null, "star", "x".repeat(31))).toEqual({
      ok: false,
      reason: "too-long",
    });
    expect(addCustomHobby(null, "star", "=cmd")).toEqual({
      ok: false,
      reason: "formula",
    });
    expect(addCustomHobby(one, "zap", "camping")).toEqual({
      ok: false,
      reason: "taken",
    });
    // Same as a listed hobby: they should tap that one instead.
    expect(addCustomHobby(null, "zap", "gym")).toEqual({
      ok: false,
      reason: "taken",
    });
  });

  it("allows five of their own", () => {
    let list = null as Parameters<typeof addCustomHobby>[0];
    for (const label of ["a1", "a2", "a3", "a4", "a5"]) {
      const result = addCustomHobby(list, "star", label);
      if (!result.ok) throw new Error(result.reason);
      list = result.list;
    }
    expect(addCustomHobby(list, "star", "a6")).toEqual({
      ok: false,
      reason: "full",
    });
    expect(removeCustomHobby(list, "a3")).toHaveLength(4);
  });

  it("round-trip through storage and skip anything malformed", () => {
    const list = [
      { icon: "tent" as const, label: "Camping" },
      { icon: "music" as const, label: "K-pop: dance covers" },
    ];
    const stored = encodeCustomHobbies(list);
    expect(stored).toEqual(["tent:Camping", "music:K-pop: dance covers"]);
    expect(decodeCustomHobbies(stored)).toEqual(list);
    expect(
      decodeCustomHobbies(["nope:Thing", "noicon", ":x", "star:"]),
    ).toEqual([]);
  });

  it("are the last required step before the raffle", () => {
    expect(firstOpenStep({ ...COMPLETE, hobbies: null })).toBe("hobbies");
  });
});
