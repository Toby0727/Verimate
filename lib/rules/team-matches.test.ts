import { describe, expect, it } from "vitest";
import type { TeamRow } from "./team";
import {
  busiestTerm,
  homeArea,
  roommateMatches,
  roommateScore,
  sharedHobbies,
  subletMatches,
  termDemand,
} from "./team-matches";

const BASE: TeamRow = {
  user_id: "x",
  email: "x@g.syr.edu",
  google_name: null,
  account_created_at: "2026-11-03T15:00:00Z",
  last_sign_in_at: null,
  school: "SU",
  has_response: true,
  name: "X",
  gender: null,
  year: null,
  major: null,
  budget: ["800-1000"],
  areas: ["euclid"],
  study_abroad: null,
  study_abroad_plans: null,
  sublet_out_terms: [],
  current_home: null,
  sublet_in_terms: [],
  roommate_terms: [],
  drinking: "socially",
  smoking: "no",
  cannabis: "never",
  greek_life: "no",
  pets: "okay",
  sleep: "late",
  cleanliness: "tidy",
  guests: "sometimes",
  hobbies: ["gym", "coffee"],
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
const row = (id: string, extra: Partial<TeamRow>): TeamRow => ({
  ...BASE,
  user_id: id,
  ...extra,
});

describe("termDemand", () => {
  it("counts offers, seekers and roommate seekers per term", () => {
    const rows = [
      row("a", { sublet_out_terms: ["fall-2027"] }),
      row("b", {
        sublet_in_terms: ["fall-2027"],
        roommate_terms: ["fall-2027"],
      }),
      row("c", { sublet_in_terms: ["fall-2027", "spring-2028"] }),
    ];
    const fall = termDemand(rows).find((t) => t.term === "fall-2027");
    expect(fall).toEqual({
      term: "fall-2027",
      offering: 1,
      seeking: 2,
      roommates: 1,
    });
  });
});

describe("sublet matches", () => {
  it("knows the area of a building from our list, by name or alias", () => {
    expect(homeArea(row("a", { current_home: "theory" }))).toBe(
      "university-hill",
    );
    expect(homeArea(row("a", { current_home: "UPoint" }))).toBe(
      "university-hill",
    );
    expect(
      homeArea(row("a", { current_home: "my friend's house" })),
    ).toBeNull();
  });

  it("pairs seekers with offerers the same term, area fits first", () => {
    const rows = [
      row("out-hill", {
        sublet_out_terms: ["fall-2027"],
        current_home: "Theory",
      }),
      row("out-unknown", {
        sublet_out_terms: ["fall-2027"],
        current_home: "A house",
      }),
      row("in-hill", {
        sublet_in_terms: ["fall-2027"],
        areas: ["university-hill"],
      }),
      row("in-euclid", { sublet_in_terms: ["fall-2027"], areas: ["euclid"] }),
      row("in-spring", { sublet_in_terms: ["spring-2027"] }),
    ];
    const matches = subletMatches(rows, "fall-2027");
    expect(matches).toHaveLength(4);
    expect(matches[0]).toMatchObject({
      seekerId: "in-hill",
      offererId: "out-hill",
      fit: "area",
    });
    expect(
      matches.find(
        (m) => m.seekerId === "in-euclid" && m.offererId === "out-hill",
      )?.fit,
    ).toBe("elsewhere");
    expect(matches.filter((m) => m.fit === "unknown")).toHaveLength(2);
  });

  it("never pairs someone with themselves", () => {
    const both = row("a", {
      sublet_out_terms: ["fall-2027"],
      sublet_in_terms: ["fall-2027"],
    });
    expect(subletMatches([both], "fall-2027")).toEqual([]);
  });
});

describe("roommate matches", () => {
  it("needs the same term and overlapping budget and area", () => {
    const rows = [
      row("a", { roommate_terms: ["fall-2027"] }),
      row("b", { roommate_terms: ["fall-2027"] }),
      row("c", { roommate_terms: ["fall-2027"], budget: ["1500-plus"] }),
      row("d", { roommate_terms: ["fall-2027"], areas: ["downtown"] }),
      row("e", { roommate_terms: ["fall-2027"], areas: ["not-sure"] }),
      row("f", { roommate_terms: ["spring-2028"] }),
    ];
    const pairs = roommateMatches(rows, "fall-2027").map(
      (m) => `${m.aId}-${m.bId}`,
    );
    expect(pairs.sort()).toEqual(["a-b", "a-e", "b-e", "d-e"]);
  });

  it("scores alike habits and shared hobbies highest", () => {
    const same = roommateScore(row("a", {}), row("b", {}));
    expect(same.score).toBe(90);
    expect(same.reasons).toContain("Both night owls");
    expect(same.reasons).toContain("2 hobbies in common: Gym, Coffee shops");
    expect(same.clashes).toEqual([]);

    const apart = roommateScore(
      row("a", { hobbies: [] }),
      row("b", {
        hobbies: [],
        sleep: "early",
        cleanliness: "spotless",
        smoking: "yes",
        pets: "have-pet",
      }),
    );
    expect(apart.score).toBeLessThan(60);
    expect(apart.clashes).toEqual(
      expect.arrayContaining(["Early bird + night owl", "Smoker + non-smoker"]),
    );
  });

  it("flags a pet owner with someone who wants no pets", () => {
    const result = roommateScore(
      row("a", { pets: "have-pet" }),
      row("b", { pets: "no-pets" }),
    );
    expect(result.clashes).toContain("Pet + no pets");
  });

  it("counts hobbies they added themselves, ignoring case", () => {
    expect(
      sharedHobbies(
        row("a", { hobbies: [], custom_hobbies: ["tent:Camping"] }),
        row("b", { hobbies: [], custom_hobbies: ["star:camping"] }),
      ),
    ).toEqual(["Camping"]);
  });
});

describe("busiestTerm", () => {
  it("opens on the term with the most possible matches", () => {
    const rows = [
      row("a", { roommate_terms: ["spring-2028"] }),
      row("b", { roommate_terms: ["spring-2028"] }),
    ];
    expect(busiestTerm(rows)).toBe("spring-2028");
  });
});
