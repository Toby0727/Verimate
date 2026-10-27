import { describe, expect, it } from "vitest";
import { makeVerification, NOW } from "./test-fixtures";
import { addDays } from "./time";
import {
  ageOn,
  badgeFor,
  canProceedWithAge,
  isEmailTaken,
  isSchoolEmail,
  isVerificationValid,
} from "./verification";

describe("isSchoolEmail", () => {
  it("accepts SU and ESF addresses regardless of case", () => {
    expect(isSchoolEmail("jamie@syr.edu")).toBe(true);
    expect(isSchoolEmail("Jamie@SYR.EDU")).toBe(true);
    expect(isSchoolEmail("sam@esf.edu")).toBe(true);
  });

  it("rejects other domains and malformed input", () => {
    expect(isSchoolEmail("jamie@gmail.com")).toBe(false);
    expect(isSchoolEmail("jamie@mail.syr.edu.fake.com")).toBe(false);
    expect(isSchoolEmail("not-an-email")).toBe(false);
  });
});

describe("isEmailTaken", () => {
  const verifications = [makeVerification({ schoolEmail: "jamie@syr.edu" })];

  it("finds an email already bound to another account", () => {
    expect(isEmailTaken("JAMIE@syr.edu", verifications, "a2")).toBe(true);
  });

  it("ignores the account's own binding", () => {
    expect(isEmailTaken("jamie@syr.edu", verifications, "a1")).toBe(false);
  });

  it("ignores rejected verifications", () => {
    const rejected = [makeVerification({ status: "rejected" })];
    expect(isEmailTaken("jamie@syr.edu", rejected, "a2")).toBe(false);
  });
});

describe("age", () => {
  it("counts full years", () => {
    expect(ageOn("2008-10-28", NOW)).toBe(18);
    expect(ageOn("2008-10-29", NOW)).toBe(17);
  });

  it("lets 18+ take either path", () => {
    expect(canProceedWithAge(18, "student")).toBe(true);
    expect(canProceedWithAge(18, "admitted")).toBe(true);
  });

  it("lets 17-year-olds through only as admitted students", () => {
    expect(canProceedWithAge(17, "student")).toBe(false);
    expect(canProceedWithAge(17, "admitted")).toBe(true);
    expect(canProceedWithAge(16, "admitted")).toBe(false);
  });
});

describe("validity and badges", () => {
  it("is valid until the day it expires", () => {
    const v = makeVerification({ expiresAt: addDays(NOW, 1) });
    expect(isVerificationValid(v, NOW)).toBe(true);
    const expiring = makeVerification({ expiresAt: NOW.toISOString() });
    expect(isVerificationValid(expiring, NOW)).toBe(false);
  });

  it("maps each state to a badge", () => {
    expect(badgeFor(undefined, NOW)).toBe("none");
    expect(badgeFor(makeVerification(), NOW)).toBe("student");
    expect(badgeFor(makeVerification({ type: "admitted" }), NOW)).toBe(
      "admitted",
    );
    expect(badgeFor(makeVerification({ type: "graduate" }), NOW)).toBe(
      "graduate",
    );
    expect(
      badgeFor(makeVerification({ type: "admitted", status: "pending" }), NOW),
    ).toBe("admitted-pending");
    expect(
      badgeFor(makeVerification({ expiresAt: addDays(NOW, -1) }), NOW),
    ).toBe("expired");
    expect(badgeFor(makeVerification({ status: "rejected" }), NOW)).toBe(
      "rejected",
    );
  });
});
