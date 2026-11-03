import { describe, expect, it } from "vitest";
import {
  EMPTY_ANSWERS,
  firstOpenStep,
  isComplete,
  isStepDone,
  stepsLeft,
  toggleArea,
  type WaitlistAnswers,
} from "./waitlist";

const COMPLETE: WaitlistAnswers = {
  year: "junior",
  major: "Information Management",
  budget: "800-1000",
  areas: ["university-hill"],
  studyAbroad: "no",
  subletOutTerms: [],
  subletInTerms: ["summer-2027"],
  roommateTerms: ["fall-2027"],
  drinking: "socially",
  smoking: "no",
  cannabis: "never",
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
