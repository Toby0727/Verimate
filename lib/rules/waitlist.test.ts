import { describe, expect, it } from "vitest";
import {
  decodeAbroadPlans,
  EMPTY_ANSWERS,
  encodeAbroadPlans,
  firstOpenStep,
  isComplete,
  isStepDone,
  normalizeReferralCode,
  raffleEntries,
  raffleWeight,
  setAbroadPlace,
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
  subletInTerms: ["summer-2027"],
  roommateTerms: ["fall-2027"],
  drinking: "socially",
  smoking: "no",
  cannabis: "never",
  greekLife: "no",
  pets: "okay",
};

describe("stepsLeft", () => {
  it("counts every step for a new student", () => {
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

  it("needs a place for every term away", () => {
    expect(
      isStepDone("abroad", {
        ...COMPLETE,
        studyAbroad: "fall-2027",
        studyAbroadPlans: [{ term: "fall-2027", place: null }],
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
    expect(isStepDone("budget", { ...COMPLETE, budget: [] })).toBe(false);
    expect(
      isStepDone("budget", { ...COMPLETE, budget: ["600-800", "800-1000"] }),
    ).toBe(true);
  });

  it("needs Greek life and pets on the lifestyle step", () => {
    expect(isStepDone("lifestyle", { ...COMPLETE, greekLife: null })).toBe(
      false,
    );
    expect(isStepDone("lifestyle", { ...COMPLETE, pets: null })).toBe(false);
  });

  it("doesn't need a photo", () => {
    expect(isStepDone("about", { ...COMPLETE, photoPath: null })).toBe(true);
  });

  it("needs a year and a non-blank major", () => {
    expect(isStepDone("about", { ...COMPLETE, major: "   " })).toBe(false);
    expect(isStepDone("about", { ...COMPLETE, major: "x".repeat(81) })).toBe(
      false,
    );
    expect(isStepDone("about", { ...COMPLETE, year: null })).toBe(false);
  });

  it("treats an empty term list as answered (not needed)", () => {
    expect(isStepDone("timing", COMPLETE)).toBe(true);
    expect(isStepDone("timing", { ...COMPLETE, subletOutTerms: null })).toBe(
      false,
    );
  });

  it("needs at least one area", () => {
    expect(isStepDone("areas", { ...COMPLETE, areas: [] })).toBe(false);
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

  it("sets a place for one term and round-trips through storage", () => {
    const plans = setAbroadPlace(
      [
        { term: "fall-2027", place: null },
        { term: "spring-2028", place: null },
      ],
      "spring-2028",
      "seoul",
    );
    expect(encodeAbroadPlans(plans)).toEqual([
      "fall-2027:",
      "spring-2028:seoul",
    ]);
    expect(decodeAbroadPlans(encodeAbroadPlans(plans))).toEqual(plans);
  });
});

describe("referrals", () => {
  it("cleans up a typed or pasted code", () => {
    expect(normalizeReferralCode(" 3f9-a2c9z ")).toBe("3F9A2C");
  });

  it("blocks step 1 only while a code is half typed", () => {
    expect(isStepDone("about", { ...COMPLETE, referredBy: "3F9" })).toBe(false);
    expect(isStepDone("about", { ...COMPLETE, referredBy: "3F9A2C" })).toBe(
      true,
    );
  });

  it("raises the chance 10% per friend", () => {
    expect(raffleWeight(1, 0)).toBe(1);
    expect(raffleWeight(1, 3)).toBe(1.3);
    expect(raffleWeight(2, 1)).toBe(2.2);
  });
});
