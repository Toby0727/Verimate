import { describe, expect, it } from "vitest";
import {
  dailyCounts,
  dayKey,
  displayName,
  matchesSearch,
  recentActivity,
  referrerOf,
  signupStatus,
  sourceBreakdown,
  stepsDone,
  type TeamRow,
  teamRaffleEntries,
  teamRaffleWeight,
  teamTotals,
  winChance,
} from "./team";

const TZ = "America/New_York";

const EMPTY: TeamRow = {
  user_id: "u0",
  email: "someone@gmail.com",
  google_name: null,
  account_created_at: "2026-11-03T15:00:00Z",
  last_sign_in_at: null,
  school: null,
  has_response: false,
  name: null,
  gender: null,
  year: null,
  major: null,
  budget: null,
  areas: null,
  study_abroad: null,
  study_abroad_plans: null,
  sublet_out_terms: null,
  sublet_in_terms: null,
  roommate_terms: null,
  drinking: null,
  smoking: null,
  cannabis: null,
  greek_life: null,
  pets: null,
  sleep: null,
  cleanliness: null,
  guests: null,
  current_home: null,
  hobbies: null,
  custom_hobbies: null,
  source: null,
  photo_path: null,
  photo_uploaded: false,
  referral_code: null,
  referred_by: null,
  referral_count: 0,
  started_at: null,
  updated_at: null,
  completed_at: null,
};

const FINISHED: TeamRow = {
  ...EMPTY,
  user_id: "u1",
  email: "alex@g.syr.edu",
  school: "SU",
  has_response: true,
  name: "Alex Kim",
  gender: "woman",
  year: "junior",
  major: "Information Management",
  budget: ["800-1000"],
  areas: ["university-hill"],
  study_abroad: "no",
  sublet_out_terms: [],
  sublet_in_terms: [],
  roommate_terms: ["fall-2027"],
  drinking: "socially",
  smoking: "no",
  cannabis: "never",
  greek_life: "no",
  pets: "okay",
  sleep: "late",
  cleanliness: "tidy",
  guests: "sometimes",
  hobbies: ["gym"],
  source: "ig-story",
  photo_path: "u1/photo.jpg",
  photo_uploaded: true,
  referral_code: "ABC123",
  referral_count: 2,
  started_at: "2026-11-03T15:01:00Z",
  completed_at: "2026-11-03T15:05:00Z",
};

const STARTED: TeamRow = {
  ...EMPTY,
  user_id: "u2",
  email: "sam@g.syr.edu",
  school: "SU",
  has_response: true,
  name: "Sam Lee",
  gender: "man",
  year: "senior",
  major: "Finance",
  referred_by: "ABC123",
  account_created_at: "2026-11-04T02:00:00Z", // Nov 3, 9 PM Eastern
  started_at: "2026-11-04T02:01:00Z",
};

describe("signupStatus / stepsDone", () => {
  it("tells signed-in-only, in-progress and finished apart", () => {
    expect(signupStatus(EMPTY)).toBe("signed-in");
    expect(signupStatus(STARTED)).toBe("in-progress");
    expect(signupStatus(FINISHED)).toBe("finished");
  });

  it("counts answered steps", () => {
    expect(stepsDone(EMPTY)).toBe(0);
    expect(stepsDone(STARTED)).toBe(1);
    expect(stepsDone(FINISHED)).toBe(7);
  });
});

describe("raffle", () => {
  it("only counts finishers, and the photo only if it's in storage", () => {
    expect(teamRaffleEntries(STARTED)).toBe(0);
    expect(teamRaffleEntries(FINISHED)).toBe(2);
    expect(teamRaffleEntries({ ...FINISHED, photo_uploaded: false })).toBe(1);
  });

  it("weights school accounts and referrals", () => {
    // 2 entries × (1 + 0.05 + 0.1 × 2)
    expect(teamRaffleWeight(FINISHED)).toBe(2.5);
    expect(
      teamRaffleWeight({
        ...FINISHED,
        school: null,
        referral_count: 0,
        photo_uploaded: false,
      }),
    ).toBe(1);
  });

  it("gives each finisher a share of the total weight", () => {
    const other = { ...FINISHED, user_id: "u3", referral_count: 0 }; // 2.1
    const rows = [FINISHED, other, STARTED];
    expect(winChance(FINISHED, rows)).toBeCloseTo(2.5 / 4.6);
    expect(winChance(STARTED, rows)).toBe(0);
    expect(winChance(STARTED, [STARTED])).toBe(0);
  });
});

describe("teamTotals", () => {
  it("adds up accounts by status and kind", () => {
    const totals = teamTotals(
      [EMPTY, STARTED, FINISHED],
      new Date("2026-11-03T23:00:00Z"),
      TZ,
    );
    expect(totals).toEqual({
      accounts: 3,
      started: 2,
      finished: 1,
      signedInOnly: 1,
      school: 2,
      personal: 1,
      photos: 1,
      referred: 1,
      // STARTED was created 9 PM Eastern on Nov 3, so all three are "today".
      newToday: 3,
    });
  });
});

describe("dailyCounts", () => {
  it("buckets by Eastern day and keeps empty days", () => {
    const days = dailyCounts(
      [EMPTY, STARTED, FINISHED],
      3,
      new Date("2026-11-04T16:00:00Z"),
      TZ,
    );
    expect(days).toEqual([
      { day: "2026-11-02", signups: 0, finished: 0 },
      { day: "2026-11-03", signups: 3, finished: 1 },
      { day: "2026-11-04", signups: 0, finished: 0 },
    ]);
  });

  it("never skips or repeats a day across the DST change", () => {
    // Clocks went back on Nov 1, 2026 in New York.
    const days = dailyCounts([], 4, new Date("2026-11-02T04:30:00Z"), TZ);
    expect(days.map((d) => d.day)).toEqual([
      "2026-10-29",
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
    ]);
  });

  it("uses the calendar day in the given time zone", () => {
    expect(dayKey(new Date("2026-11-04T02:00:00Z"), TZ)).toBe("2026-11-03");
  });
});

describe("recentActivity", () => {
  it("lists sign-ups, starts and finishes newest first", () => {
    const events = recentActivity([FINISHED, STARTED], 3);
    expect(events.map((e) => [e.kind, e.who])).toEqual([
      ["started", "Sam Lee"],
      ["signed-up", "Sam Lee"],
      ["finished", "Alex Kim"],
    ]);
  });
});

describe("helpers", () => {
  it("names accounts by survey name, then Google name, then email", () => {
    expect(displayName(FINISHED)).toBe("Alex Kim");
    expect(displayName({ ...EMPTY, google_name: "Jo" })).toBe("Jo");
    expect(displayName(EMPTY)).toBe("someone@gmail.com");
  });

  it("finds who invited a student", () => {
    expect(referrerOf(STARTED, [FINISHED, STARTED])?.user_id).toBe("u1");
    expect(referrerOf(FINISHED, [FINISHED, STARTED])).toBeNull();
  });

  it("searches name, email, major and code", () => {
    expect(matchesSearch(FINISHED, "alex")).toBe(true);
    expect(matchesSearch(FINISHED, "abc1")).toBe(true);
    expect(matchesSearch(FINISHED, "finance")).toBe(false);
    expect(matchesSearch(FINISHED, "  ")).toBe(true);
  });
});

describe("sourceBreakdown", () => {
  it("counts sign-ups and finishers per source, direct for no tag", () => {
    const poster = { ...STARTED, user_id: "u5", source: "slocum-gym-rat" };
    expect(sourceBreakdown([FINISHED, STARTED, EMPTY, poster])).toEqual([
      { source: "direct", accounts: 2, finished: 0 },
      { source: "ig-story", accounts: 1, finished: 1 },
      { source: "slocum-gym-rat", accounts: 1, finished: 0 },
    ]);
  });
});
