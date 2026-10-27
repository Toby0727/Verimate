// Builders for rule unit tests only.
import { addMonths } from "./time";
import type { Account, Dataset, Profile, Sublet, Verification } from "./types";

export const NOW = new Date("2026-10-28T12:00:00.000Z");

export function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: "a1",
    displayName: "Jamie P.",
    googleEmail: "jamie@gmail.com",
    birthDate: "2004-03-01",
    role: "user",
    status: "active",
    createdAt: "2026-09-01T00:00:00.000Z",
    lastActiveAt: NOW.toISOString(),
    emailNotifications: true,
    onboardingStep: "done",
    ...overrides,
  };
}

export function makeVerification(
  overrides: Partial<Verification> = {},
): Verification {
  const verifiedAt = "2026-09-01T00:00:00.000Z";
  return {
    id: "v1",
    accountId: "a1",
    type: "student",
    schoolEmail: "jamie@syr.edu",
    school: "SU",
    status: "approved",
    verifiedAt,
    expiresAt: addMonths(verifiedAt, 12),
    documentName: null,
    submittedAt: verifiedAt,
    ...overrides,
  };
}

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    accountId: "a1",
    photo: "/sample/people/u-mia.jpg",
    displayName: "Jamie P.",
    school: "SU",
    standing: "Junior",
    gender: "woman",
    budgetMin: 700,
    budgetMax: 950,
    moveInFrom: "2027-08-01",
    moveInTo: "2028-05-31",
    housingStatus: "needs-place",
    groupHave: null,
    groupNeed: null,
    sleep: "early",
    cleanliness: "tidy",
    smoking: "no",
    pets: "none",
    major: null,
    languages: [],
    bio: null,
    buildingId: null,
    roommateGenderPref: null,
    extraPhotos: [],
    prompts: [],
    questionnaire: null,
    aiMatchConsent: false,
    searchStatus: "active",
    pausedReason: null,
    showInBuilding: false,
    boostedUntil: null,
    ...overrides,
  };
}

export function makeSublet(overrides: Partial<Sublet> = {}): Sublet {
  return {
    id: "s1",
    authorId: "a1",
    title: "Room near campus",
    area: "University Hill",
    buildingId: null,
    rent: 850,
    startDate: "2027-05-15",
    endDate: "2027-08-10",
    roomType: "private",
    furnished: true,
    photos: ["/sample/rooms/r-1484154218.jpg"],
    roommatesInfo: "Two grad students",
    onLeaseDeclared: true,
    exactAddress: "123 Example St",
    description: null,
    lease: { documentName: null, status: "none" },
    status: "active",
    createdAt: "2026-10-20T00:00:00.000Z",
    updatedAt: "2026-10-20T00:00:00.000Z",
    staleNotifiedAt: null,
    ...overrides,
  };
}

export function emptyDataset(overrides: Partial<Dataset> = {}): Dataset {
  return {
    accounts: [],
    verifications: [],
    profiles: [],
    messageRequests: [],
    conversations: [],
    messages: [],
    blocks: [],
    sublets: [],
    buildings: [],
    matches: [],
    unlocks: [],
    memberships: [],
    reports: [],
    profileViews: [],
    ...overrides,
  };
}

// A dataset with two listed, verified users: a1 and a2.
export function twoUserDataset(overrides: Partial<Dataset> = {}): Dataset {
  return emptyDataset({
    accounts: [
      makeAccount(),
      makeAccount({ id: "a2", displayName: "Alex K." }),
    ],
    verifications: [
      makeVerification(),
      makeVerification({
        id: "v2",
        accountId: "a2",
        schoolEmail: "alex@syr.edu",
      }),
    ],
    profiles: [makeProfile(), makeProfile({ accountId: "a2" })],
    ...overrides,
  });
}
